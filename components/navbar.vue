<template>
  <b-navbar wrapper-class="container" :mobile-burger="false" centered>
    <template #brand>
      <b-navbar-item tag="nuxt-link" :to="{ path: '/' }" :class="{'ml-3':$device.isMobileOrTablet}">
        <img src="~/assets/images/tbot.png" alt="Tbot Army">
      </b-navbar-item>
    </template>

    <template #start v-if="$device.isDesktopOrTablet">
      <floatingMenu />
    </template>

    <template #end>
      <b-navbar-item tag="div">
        <div class="buttons">
          <b-tag type="mb-2 mr-2 is-light" size="is-large" v-if="parseInt(chainId) == 1">
            <div class="is-flex is-align-items-center">
              <img src="~/assets/images/ethereum.png" width="21px" height="21px" alt="Ethereum">
              <strong v-if="$device.isDesktopOrTablet" class="has-text-dark">Ethereum</strong>
            </div>
          </b-tag>

          <b-button type="is-secondary" v-if="mainAccount">
            <div class="is-flex is-align-items-center">
              <jazzicon class="mr-2 is-flex is-align-items-center" :address="mainAccount" :diameter="16" />
              <strong>{{mainAccount.slice(0,6)}}...{{mainAccount.slice(-4)}}</strong>
            </div>
          </b-button>

          <a v-else class="button is-primary" @click="connectWallet">
            <strong>Connect Wallet</strong>
          </a>

        </div>
      </b-navbar-item>
      <b-navbar-item>
        <b-dropdown
            aria-role="menu"
            position="is-bottom-left"
            :mobile-modal="false"
            append-to-body>

            <template #trigger="{ /*active*/ }">
                <a
                  class="navbar-item"
                  role="button">
                  <b-icon icon="dots-vertical"></b-icon>
              </a>
            </template>

            <b-dropdown-item has-link>
              <nuxt-link to="/my-account">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <span>
                  About
                </span>
                <b-icon icon="information-outline" size="is-small"></b-icon>
              </div>
              </nuxt-link>
            </b-dropdown-item>

            <b-dropdown-item has-link>
              <nuxt-link to="/my-account">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <span>
                  Notifications
                </span>
                <b-icon icon="bell" size="is-small"></b-icon>
              </div>
              </nuxt-link>
            </b-dropdown-item>

            <b-dropdown-item  @click="logout">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <span>
                  Settings
                </span>
                <b-icon icon="cog-outline" size="is-small"></b-icon>
              </div>
            </b-dropdown-item>

            <b-dropdown-item  @click="toggleDarkMode">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <span>
                  Dark Theme
                </span>
                <b-icon icon="brightness-4" size="is-small"></b-icon>
              </div>
            </b-dropdown-item>

            <b-dropdown-item  @click="logout" v-if="mainAccount">
              <div class="is-flex is-align-items-center is-justify-content-space-between">
                <span>
                  Disconnect
                </span>
                <b-icon icon="power" size="is-small"></b-icon>
              </div>
            </b-dropdown-item>

          </b-dropdown>
      </b-navbar-item>
    </template>
  </b-navbar>
</template>

<script>
  import {
    ethers
  } from 'ethers'
  import {
    mapState
  } from 'vuex'

  import walletSelector from '../components/walletSelector.vue'

  export default {
    data() {
      return {
        loading: false,
        provider: null
      }
    },
    methods: {
      toggleDarkMode(){
        // if(this.$colorMode.value == 'light'){
        //   this.$colorMode.value = 'dark'
        // }else{
        //   this.$colorMode.value = 'light'
        // }
      },
      async connectWallet() {
        // Open wallet selector
        this.$buefy.modal.open({
          parent: this,
          component: walletSelector,
          hasModalCard: true,
          customClass: '',
          trapFocus: true,
          canCancel: ['escape', 'outside']
        })

      },
      async login() {
        this.loading = true
        if (this.$store.state.localStorage.walletVersion == 'metamask') {
          this.provider = this.$eth
        } else if (this.$store.state.localStorage.walletVersion == 'walletConnect') {
          this.provider = this.$connector
        } else if (this.$store.state.localStorage.walletVersion == 'walletLink'){
          this.provider = this.$walletlink
        }

        // Get nonce from the API
        const {
          data: nonce
        } = await this.$axios.post(`${this.$config.apiUrl}/auth/nonce`, {
          wallet: this.mainAccount
        })

        if (nonce) {
          // Let's sign the hell of that nonce

          let signature

          if (this.$store.state.localStorage.walletVersion == 'metamask') {

            Object.defineProperties(this.provider, { isMetaMask: { value: true} })

            const provider = new ethers.providers.Web3Provider(this.provider)
            const signer = provider.getSigner()

            signature = await signer.signMessage(nonce).catch(err => {
              console.log(err)
              this.$store.commit('localStorage/set', ['accounts', []])
            })

          } else if (this.$store.state.localStorage.walletVersion == 'walletConnect') {

            const rawMessageLength = new Blob([nonce]).size
            let message = ethers.utils.toUtf8Bytes(
              "\x19Ethereum Signed Message:\n" + rawMessageLength + nonce
            )
            message = ethers.utils.keccak256(message)

            let params = [
              this.mainAccount,
              message
            ]


            signature = await this.provider.connector.signMessage(params).catch(async err => {
              console.log(err)
              this.$store.commit('localStorage/set', ['accounts', []])
              await this.provider.disconnect()
            })

          }else if(this.$store.state.localStorage.walletVersion == 'walletLink'){

            Object.defineProperties(this.provider, { isMetaMask: { value: true} })

            const provider = new ethers.providers.Web3Provider(this.provider)
            const signer = provider.getSigner()

            signature = await signer.signMessage(nonce).catch(async err => {
              console.log(err)
              this.$store.commit('localStorage/set', ['accounts', []])
              await this.provider.disconnect()
            })
          }

          // const a = ethers.utils.verifyMessage(nonce, signature)
          // console.log('Signer of nonce:',a)
          // console.log('Wallet: ',this.accounts[0])

          if (signature) {
            const login = {
              nonce,
              signature
            }
            // Let's get the jwt
            try {
              await this.$auth.loginWith('local', {
                data: login
              })
              if(this.$auth.loggedIn){
                this.$buefy.snackbar.open({
                message: "Welcome! You can access your account at the menu under 'My Account'.",
                type: 'is-success',
                position: 'is-top',
                actionText: 'OK',
                indefinite: true
                })
              }

            } catch (err) {
              console.log(err)
              if (this.$store.state.localStorage.walletVersion == 'walletConnect' || this.$store.state.localStorage.walletVersion == 'walletLink') {
                this.$store.commit('localStorage/set', ['accounts', []])
                await this.provider.disconnect()
              }
            }

          }
        } else {
          if (this.$store.state.localStorage.walletVersion == 'walletConnect' || this.$store.state.localStorage.walletVersion == 'walletLink') {
            await this.provider.disconnect()
          }
          this.$store.commit('localStorage/set', ['accounts', []])
        }
        this.loading = false
      },
      async logout() {
        this.loading = true
        await this.$auth.logout()
        this.$store.commit('localStorage/set', ['accounts', []])
        if (this.$store.state.localStorage.walletVersion == 'walletConnect' || this.$store.state.localStorage.walletVersion == 'walletLink') {
          await this.$connector.disconnect()
        }
        this.loading = false
      }
    },
    computed: {
      ...mapState({
        accounts: state => state.localStorage.accounts,
        selectedAccount: state => state.localStorage.selectedAccount,
        chainId: state => state.localStorage.chainId,
      }),
      mainAccount() {
        if (this.accounts) {
          return this.accounts[this.selectedAccount]
        } else {
          return null
        }
      }
    }
  }

</script>

<style>

</style>
