<template>
  <div>
    <p class="title is-5">Claim Rewards</p>

    <div class="is-flex is-justify-content-center">
      <p class="title is-5">
        Total Rewards: {{ parseFloat(utils.formatEther(rewards)).toLocaleString('en-US', {minimumFractionDigits: 6}) }} TBOT
      </p>
    </div>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button v-if="rewards !== constants.Zero" class="mx-6" type="is-success" size="is-medium" :loading="loading" @click="claimRewards" expanded>
        Claim Rewards</b-button>
        <b-button v-else class="mx-6" type="is-success" size="is-medium" disabled expanded>
        No claimable rewards</b-button>
    </div>
    <!-- <div class="is-flex is-justify-content-center px-6 mt-2">
      <b-button class="mx-6" type="is-primary" size="is-medium" expanded>
        Vest Rewards</b-button>
    </div> -->
  </div>
</template>

<script>
  import {utils, constants, Contract, providers} from 'ethers'
  import { mapState } from 'vuex'

  export default {
    data(){
      return{
        utils,
        loading:false,
        constants
      }
    },
    props:[
      'rewards'
    ],
    methods:{
      async claimRewards(){
        this.loading = true

        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        }else if (this.walletVersion == 'walletLink'){
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/Staking.json')

        const signer = provider.getSigner()
        const contract = new Contract(this.$config.stakingContract, abi, signer)

        const signedTransaction = await contract.getReward().catch(err=>{
          console.log(err)

          // this.$buefy.snackbar.open({
          //     message: 'Error Message: '+ err.error.message + '<br> Refresh your browser.',
          //     type: 'is-warning',
          //     position: 'is-top',
          //     indefinite: true,
          //     queue:false
          // })

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

          if(txReceipt.status == 1){
            this.$buefy.toast.open({
                message: `Transaction Success! <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank"><i class="mdi mdi-open-in-new"></i></a>`,
                type: 'is-success',
                duration: 5000
            })
          }else{
            this.$buefy.toast.open({
                message: `Transaction Error! <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank"><i class="mdi mdi-open-in-new"></i></a>`,
                type: 'is-danger',
                duration: 5000
            })
          }
        }

        // Update Balance and staking information
        await this.$store.dispatch('checkBalance', this.mainAccount)
        await this.$store.dispatch('getStakingData', this.mainAccount)

        this.loading = false
      }
    },
    computed:{
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      })
    }
  }

</script>
