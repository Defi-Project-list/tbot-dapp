<template>
  <div class=" modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">Connect Your Wallet</p>
      <b-button icon-left="close" type="is-ghost" class="close " @click="$emit('close')" />
    </header>
    <div class="modal-card-body">
      <b-loading :is-full-page="false" v-model="isConnecting"></b-loading>
      <div class="message">
        <div class="message-body">
          <p>By connecting a wallet, you acknowledge that you have read, understand and agreed the TBOT Project <a
              href="https://tbot-docs.us-east-1.linodeobjects.com/TBOTDisclaimer.pdf" target="_blank">disclaimer</a>.</p>
        </div>
      </div>
      <div class="is-flex is-flex-direction-column mt-2">

        <!-- <b-button size="is-medium" expanded v-if="hasMetamask && $device.isSafari && $device.isIos" tag="a" href="https://metamask.app.link/dapp/app.tbot.fi">
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/metamask.png" alt="Metamask">
            <strong>Open in Metamask</strong>
          </div>
        </b-button> -->

        <b-button size="is-medium" expanded v-if="hasMetamask" @click="connectMetamask">
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/metamask.png" alt="Metamask">
            <strong>Metamask</strong>
          </div>
        </b-button>

        <b-button size="is-medium" expanded v-else>
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/metamask.png" alt="Install Metamask">
            <strong>Install Metamask</strong>
          </div>
        </b-button>

        <b-button size="is-medium" class="mt-2" expanded @click="connectWalletConnect">
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/trust-wallet.png" alt="Trust Wallet">
            <strong>Trust Wallet</strong>
          </div>
        </b-button>

        <b-button size="is-medium" class="mt-2" expanded @click="connectWalletConnect">
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/wallet-connect.png" alt="Wallet Connect">
            <strong>Wallet Connect</strong>
          </div>
        </b-button>

        <b-button size="is-medium" class="mt-2" expanded @click="connectMetamask(true)" v-if="$device.isMobileOrTablet && $eth">
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/coinbase.png" alt="Wallet Link">
            <strong>Coinbase Wallet Browser</strong>
          </div>
        </b-button>

        <b-button size="is-medium" class="mt-2" expanded @click="connectWalletLink" v-else>
          <div class="is-flex is-align-items-center">
            <img class="mr-2" width="20px" height="20px" src="~/assets/images/coinbase.png" alt="Wallet Link">
            <strong>Coinbase Wallet</strong>
          </div>
        </b-button>

        <b-button type="is-ghost" icon-left="help-circle-outline" class="mt-3">
          How to connect
        </b-button>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    mapState
  } from 'vuex'

  export default {
    data() {
      return {
        isConnecting: false
      }
    },
    methods: {
      async connectMetamask(wl = false) {
        this.isConnecting = true
        if (this.$eth) {

          const chain = await this.$eth.request({
            method: 'eth_chainId'
          })
          // --Step 1: Get and check chain
          if (chain) {
            // Validating chainId against the stored chains
            const validChain = this.availableChains.some(el => {
              return el.hex === chain
            })
            // Save the current chain if it's available, otherwise throw error
            if (validChain) {
              this.$store.commit('localStorage/set', ['chainId', chain])
            } else {
              this.somethingWrong("Please select a valid Ethereum Network and try again")
              return
            }

          } else {
            this.$store.commit('localStorage/set', ['accounts', []])
            this.somethingWrong("Something went wrong, please try again or choose another wallet.")
            return
          }

          // --Step 2: Get and check accounts
          const accounts = await this.$eth.request({
            method: 'eth_requestAccounts'
          }).catch(err => {
            console.log(err)
            this.isConnecting = false
          })

          if (accounts) {
            this.$store.commit('localStorage/set', ['accounts', accounts])
          } else {
            this.$store.commit('localStorage/set', ['chainId', null])
            this.somethingWrong("Something went wrong, please try again or choose another wallet.")
            return
          }

          this.isConnecting = false

          this.$store.commit('localStorage/set', ['walletVersion', 'metamask'])
          this.$emit('close')

        } else {
          // It should't get here
          if (wl) {
            this.somethingWrong(
              "It seems that you are not inside Coinbase Wallet DApp Browser. Please try again."
            )
          } else {
            this.somethingWrong(
              "It seems that you don't have Metamask installed, click <a href='#'>here</a> for instructions or choose another wallet."
            )
          }

        }

      },
      async connectWalletConnect() {
        this.isConnecting = true
        await this.$connector.enable().catch(async (err) => {
          console.log(err)
          this.$store.commit('localStorage/set', ['accounts', []])
          window.location.reload()
        })
        // console.log(this.$connector)
        // Validating chainId against the stored chains
        const validChain = this.availableChains.some(el => {
          return el.decimal === this.$connector.chainId
        })
        // Save the current chain if it's available, otherwise throw error
        if (validChain) {
          this.$store.commit('localStorage/set', ['accounts', this.$connector.wc.accounts])
          this.$store.commit('localStorage/set', ['chainId', this.$connector.wc.chainId])
        } else {
          this.somethingWrong("Please select a valid Ethereum Network and try again")
          window.location.reload()
        }

        this.$store.commit('localStorage/set', ['walletVersion', 'walletConnect'])

        this.isConnecting = false
        this.$emit('close')

      },
      async connectWalletLink() {
        this.isConnecting = true

        // --Step 2: Get and check accounts
        const accounts = await this.$walletlink.send('eth_requestAccounts').catch(err => {
          console.log(err)
          // this.somethingWrong("Something went wrong, please try again or choose another wallet.")
          window.location.reload()
          // this.isConnecting = false
        })

        if (accounts) {
          const chainId = await this.$walletlink.send('eth_chainId')
          this.$store.commit('localStorage/set', ['accounts', accounts])
          this.$store.commit('localStorage/set', ['chainId', chainId])
        } else {
          this.$store.commit('localStorage/set', ['chainId', null])
          this.somethingWrong("Something went wrong, please try again or choose another wallet.")
          return
        }

        this.isConnecting = false

        this.$store.commit('localStorage/set', ['walletVersion', 'walletLink'])
        this.$emit('close')

      },
      somethingWrong(msg) {
        this.$buefy.dialog.alert({
          title: 'Error',
          message: msg,
          type: 'is-danger',
          hasIcon: true,
          icon: 'toy-brick-search-outline',
          ariaRole: 'alertdialog',
          ariaModal: true
        })
        this.isConnecting = false
      },

    },
    computed: {
      ...mapState({
        accounts: state => state.localStorage.accounts,
        selectedAccount: state => state.localStorage.selectedAccount,
        availableChains: 'availableChains'
      }),
      hasMetamask() {
        if (this.$eth) {
          return true
        } else {
          return false
        }
      },
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
