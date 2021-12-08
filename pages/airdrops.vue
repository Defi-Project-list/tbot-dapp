<template>
  <div class="section">
    <div class="container is-max-desktop">
      <div class="columns">
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                Claim your TBOT Promo Rewards
              </p>
              <p class="subtitle is-6">
                If you've participated on any of the TBOT contests or promos, you might be elegible for rewards, check it here.
              </p>
            </div>
          </div>
        </div>

      </div>

      <!-- Start Staking Box -->
      <div class="box">
    <p class="title is-5">Claim Rewards</p>

    <div class="is-flex is-justify-content-center">
      <p class="title is-5 has-text-centered">
        Total Promo Rewards: {{ parseFloat(utils.formatEther(rewards)).toLocaleString('en-US', {minimumFractionDigits: 6}) }} TBOT
      </p>
    </div>



    <div class="is-flex is-justify-content-center px-6-desktop mt-5">
      <b-button v-if="!rewards.isZero()" class="mx-6-desktop" type="is-success" size="is-medium" :loading="loading" @click="claim" expanded>
        Claim Rewards</b-button>
        <b-button v-else class="mx-6-desktop" type="is-success" size="is-medium" disabled expanded>
        No available rewards</b-button>
    </div>



      </div>
    </div>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { utils, constants, Contract, providers } from 'ethers'

  export default {
    data(){
      return {
        utils,
        interval: null,
        rewards: constants.Zero,
        loading:false
      }
    },
    computed:{
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      })
    },
    methods:{
      async getBalance(){
        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        }else if (this.walletVersion == 'walletLink'){
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/Airdrop.json')

        if(provider){
          const contract = new Contract(this.$config.airdropContract, abi, provider)

          try {
            this.rewards = await contract.airdrop(this.mainAccount)
          } catch (error) {
            console.log(error)
            this.rewards = constants.Zero
          }
        }


      },
      async claim(){

         this.loading = true

        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        }else if (this.walletVersion == 'walletLink'){
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/Airdrop.json')

        const signer = provider.getSigner()
        const contract = new Contract(this.$config.airdropContract, abi, signer)

        const signedTransaction = await contract.getAirdrop().catch(err=>{
          console.log(err)

          this.loading = false
        })

        if(signedTransaction){
          console.log("TX: ",signedTransaction)

          const progressMessage = this.$buefy.snackbar.open({
              message: `
              <div class="is-flex is-align-content-center">
              <div class="lds-ring mr-2"><div></div><div></div><div></div><div></div></div> Pending Transaction.
              <a class="has-text-white ml-1" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank"><i class="mdi mdi-open-in-new"></i></a></div>`,
              position: 'is-top',
              actionText:null,
              indefinite: true,
              queue:false
          })


          const txReceipt = await signedTransaction.wait().catch(err=>{
            console.log(err)
            this.loading = false
          })
          progressMessage.close()

          console.log(txReceipt)

          if(txReceipt){
            this.$buefy.notification.open({
                    message: `Transaction Success!<br>
                    <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank">View on Etherscan <i class="mdi mdi-open-in-new"></i></a>`,
                    duration: 10000,
                    progressBar: true,
                    closable: false,
                    hasIcon:true,
                    type: 'is-success',
                    pauseOnHover: true
                })
          }else{
            this.$buefy.notification.open({
                    message: `Transaction Error!<br>
                    <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank">View on Etherscan  <i class="mdi mdi-open-in-new"></i></a>`,
                    duration: 10000,
                    progressBar: true,
                    closable: false,
                    hasIcon:true,
                    type: 'is-danger',
                    pauseOnHover: true
                })
          }
        }

        // Update Balance information
        await this.getBalance()
        this.loading = false

      }
    },
    mounted(){
      this.interval = setInterval(async () => {
        if(this.mainAccount){
          await this.getBalance()
        }
      }, 120000)
    },
    beforeDestroy(){
      clearInterval(this.interval)
    },
    async fetch(){
      if(this.mainAccount){
          await this.getBalance()
        }

    }
  }

</script>
