<template>
  <div>
    <p class="title is-5">Unstake TBOT</p>
    <form>

      <b-field>

        <b-input
          placeholder="0.0 TBOT"
          type="text"
          expanded
          v-model="amountToUnstake"
          :disabled="loading || !walletVersion"
          @keypress.native="isNumber"
           />

        <p class="control">
          <b-button type="is-primary" label="MAX" @click="setMax" :disabled="loading || !walletVersion" />
        </p>

      </b-field>

    </form>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button class="mx-6" type="is-primary is-light" size="is-medium" expanded @click="connectWallet" v-if="!walletVersion">
      Connect Wallet</b-button>
      <b-button v-else-if="!staked.isZero()" class="mx-6" type="is-success" size="is-medium" @click="unStake" :loading="loading" expanded>
        Unstake</b-button>
        <b-button v-else class="mx-6" type="is-success" size="is-medium" disabled expanded>
        Nothing to unstake</b-button>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import walletSelector from '../walletSelector.vue'
  import {constants, providers, utils, Contract} from 'ethers'

  export default {
    data(){
      return {
        loading:false,
        constants,
        amountToUnstake:''
      }
    },
    props:[
      'staked'
    ],
    methods:{
      async unStake(){
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

        const signedTransaction = await contract.withdraw(utils.parseEther(this.amountToUnstake)).catch(err=>{
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

          if(txReceipt){
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

        this.amountToUnstake = ''
        this.loading = false
      },
      isNumber(e) {
        // console.log($event.keyCode); //keyCodes value
        let keyCode = (e.keyCode ? e.keyCode : e.which)

        // only allow number and one dot
        if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || this.amountToUnstake.indexOf('.') != -1)) { // 46 is dot
          e.preventDefault()
        }

      },
      setMax(){
        //set max balance
        this.amountToUnstake = utils.formatEther(this.staked)
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
    },
    computed:{
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      }),
    }
  }

</script>
