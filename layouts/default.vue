<template>
  <div class="container">
    <navbar />
    <Nuxt />
    <footerMenu v-if="$device.isMobile" />
    <div v-if="chainId" style="position: fixed;
      left: 0.5rem;
      bottom: 0.5rem;">
    <b-icon :icon="parseInt(chainId) == 1?'flash-circle':'alert'" size="is-small" :type="parseInt(chainId) == 1?'is-success':'is-warning'"></b-icon> <small v-if="parseInt(chainId) == 1">Mainet</small> <small v-else>Wrong Network</small>
    </div>
  </div>
</template>

<script>
import {mapState} from 'vuex'
export default {
  data () {
    return {
    }
  },
  computed:{
    ...mapState({
      accounts:state => state.localStorage.accounts,
      selectedAccount:state => state.localStorage.selectedAccount,
      chainId: state => state.localStorage.chainId,
      mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
      availableChains:'availableChains'})
  },
  methods:{
    somethingWrong(msg){
        this.$buefy.dialog.alert({
            title: 'Error',
            message: msg,
            type: 'is-danger',
            hasIcon: true,
            icon: 'toy-brick-search-outline',
            ariaRole: 'alertdialog',
            ariaModal: true
          })
      }
  },
  watch:{
    $route:function(to, from){
      document.querySelectorAll('.modal').forEach((modal) => {
        modal.__vue__?.$vnode?.context?.close()
      })
    }
  },
  mounted(){

  },
  created() {
    // Metamask
    if(this.$eth){
      this.$eth.on('accountsChanged', async (newAccounts)=>{
        if(newAccounts[this.selectedAccount]!=this.accounts[this.selectedAccount]){
          // await this.$auth.logout()
          this.$store.commit('localStorage/set',['accounts',newAccounts])
          this.$store.dispatch('checkBalance', this.mainAccount)
          this.$store.dispatch('getStakingData', this.mainAccount)
        }
      })

      this.$eth.on('chainChanged', async (newChain)=>{
          // await this.$auth.logout()
          // this.$store.commit('localStorage/set',['accounts',[]])
          this.$store.commit('localStorage/set',['chainId', newChain])
          this.$store.dispatch('checkBalance', this.mainAccount)
          this.$store.dispatch('getStakingData', this.mainAccount)
      })

      this.$eth.on('disconnect', async (err)=>{
          // await this.$auth.logout()
          // this.$store.commit('localStorage/set',['accounts',[]])
          console.log(err)
          this.$store.commit('localStorage/set', ['walletVersion', null])
          this.$store.dispatch('checkBalance', this.mainAccount)
          this.$store.dispatch('getStakingData', this.mainAccount)
      })
    }

    // WalletConnect
    this.$connector.on('accountsChanged', async(accounts) => {
      // await this.$auth.logout()
      this.$store.commit('localStorage/set',['accounts', accounts])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
    })

    this.$connector.on('chainChanged', async (chainId) => {
      // await this.$auth.logout()
      // this.$store.commit('localStorage/set',['accounts',[]])
      this.$store.commit('localStorage/set',['chainId', chainId])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
    })

    this.$connector.on('disconnect', async(code, reason) => {
      // await this.$auth.logout()
      this.$store.commit('localStorage/set',['accounts',[]])
      // this.$store.commit('localStorage/set',['chainId', null])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
      this.$store.commit('localStorage/set', ['walletVersion', null])
      console.log(code, reason)
    })

    // Wallet Link
    this.$walletlink.on('accountsChanged', async (accounts)=>{
      // await this.$auth.logout()
      this.$store.commit('localStorage/set',['accounts',accounts])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
      // this.$store.commit('localStorage/set',['chainId', null])
    })

    this.$connector.on('chainChanged', async (chainId) => {
      // await this.$auth.logout()
      // this.$store.commit('localStorage/set',['accounts',[]])
      this.$store.commit('localStorage/set',['chainId', chainId])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
    })

    this.$walletlink.on('disconnect', async (code, reason) => {
      // await this.$auth.logout()
      this.$store.commit('localStorage/set',['accounts',[]])
      // this.$store.commit('localStorage/set',['chainId', null])
      this.$store.dispatch('checkBalance', this.mainAccount)
      this.$store.dispatch('getStakingData', this.mainAccount)
      this.$store.commit('localStorage/set', ['walletVersion', null])
      console.log(code, reason)
    })

  },
  destroyed() {
    if(this.$eth){
      this.$eth.removeEventListener('accountsChanged')
      this.$eth.removeEventListener('chainChanged')
    }
    this.$connector.removeEventListener('accountsChanged')
    this.$connector.removeEventListener('chainChanged')
    this.$connector.removeEventListener('disconnect')

    this.$walletlink.removeEventListener('accountsChanged')
    this.$walletlink.removeEventListener('chainChanged')
    this.$walletlink.removeEventListener('disconnect')
  }
}
</script>

<style>

</style>