<template>
  <div>
    <p class="title is-5">Stake TBOT</p>
    <form>

      <b-field>

        <b-input placeholder="0.0 TBOT"
          type="text"
          v-model="amount"
          expanded
          :disabled="loading || allowance.isZero() || !walletVersion"
          @keypress.native="isNumber"
        />
        <p class="control">
          <b-button type="is-primary" label="MAX" @click="setMax" :disabled="loading || allowance.isZero() || !walletVersion"/>
        </p>

      </b-field>

    </form>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button class="mx-6" type="is-primary is-light" size="is-medium" expanded @click="connectWallet" v-if="!walletVersion || !mainAccount">
      Connect Wallet</b-button>
      <b-button class="mx-6" type="is-success" size="is-medium" expanded @click="approve()" v-else-if="allowance.isZero()" :loading="loading">
      Approve</b-button>
      <b-button class="mx-6" type="is-success" size="is-medium" expanded @click="stake()" :disabled="!hasBalance || amount == ''" v-else :loading="loading">
        <span v-if="amount == ''" >Enter an amount</span>
        <span v-else-if="!hasBalance" >Not enough balance</span>
        <span v-else>Stake</span>
        </b-button>

    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import walletSelector from '../walletSelector.vue'
  import {utils, constants, providers, Contract} from 'ethers'

  export default {
    data(){
      return{
        loading:false,
        amount:'',
        constants,
        utils
      }
    },
    computed:{
      ...mapState(['allowance', 'balance']),
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      }),
      hasBalance(){
        if(this.amount == ''){
          return this.balance.gte(constants.Zero)
        }else{
          return this.balance.gte(utils.parseEther(this.amount))
        }

      }
    },
    methods:{
      async approve(){
        this.loading = true

        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        }else if (this.walletVersion == 'walletLink'){
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/IERC20.json')

        const signer = provider.getSigner()
        const contract = new Contract(this.$config.gerContract, abi, signer)

        const signedTransaction = await contract.approve(this.$config.stakingContract, utils.parseEther('1000000')).catch(err=>{
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

        this.amount = ''
        this.loading = false

      },
      async stake(){
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

        const signedTransaction = await contract.stake(utils.parseEther(this.amount)).catch(err=>{
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

        this.amount = ''
        this.loading = false

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
      isNumber(e) {
        // console.log($event.keyCode); //keyCodes value
        let keyCode = (e.keyCode ? e.keyCode : e.which)

        // only allow number and one dot
        if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || this.amount.indexOf('.') != -1)) { // 46 is dot
          e.preventDefault()
        }

      },
      setMax(){
        //set max balance
        this.amount = utils.formatEther(this.balance)
      }
    }
  }

</script>
