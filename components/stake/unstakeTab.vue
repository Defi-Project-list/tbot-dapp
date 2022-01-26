<template>
  <div>
    <p class="title is-5">Unstake TBOT</p>

    <div class="message is-warning" v-if="!staked.isZero() && !time.isZero()">
      <div class="message-body">
        <p class="title is-5">
          WARNING. It's not safe to Unstake
        </p>
        <p class="subtitle is-6">
          Your <strong>rewards</strong> are still in Time Lock. If you unstake now you will <strong>lose</strong> them.
          <br>
          <countdown :time="millisecondsLeft" @end="onCountdownEnd"
          v-slot="{ days, hours, minutes, seconds }">
          {{days}} days, {{hours}} hours, {{minutes}} minutes, {{seconds}} seconds to safely unstake.
        </countdown>
        </p>
      </div>
    </div>

    <form>

      <b-field>

        <b-input
          placeholder="0.0 TBOT"
          type="text"
          expanded
          v-model="amountToUnstake"
          :disabled="loading || !walletVersion || staked.isZero()"
          @keypress.native="isNumber"
           />

        <p class="control">
          <b-button type="is-primary" label="MAX" @click="setMax" :disabled="loading || !walletVersion || staked.isZero()" />
        </p>

      </b-field>

    </form>

    <div class="is-flex is-justify-content-center px-6-desktop mt-5">
      <b-button class="mx-6-desktop" type="is-primary is-light" size="is-medium" expanded @click="connectWallet" v-if="!walletVersion">
      Connect Wallet</b-button>
      <b-button v-else-if="!staked.isZero()" class="mx-6-desktop" :type="time.isZero()?'is-success':'is-warning'" size="is-medium"
      @click="unStake"
      :loading="loading"
      expanded
      :disabled="amountToUnstake == '' || utils.parseEther(amountToUnstake).gt(staked)">
        <span v-if="amountToUnstake == ''" >Enter an amount</span>
        <span v-else-if="utils.parseEther(amountToUnstake).gt(staked)">Not enough balance</span>
        <span v-else>Unstake</span>
        </b-button>
        <b-button v-else class="mx-6-desktop" type="is-success" size="is-medium" disabled expanded>
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
        utils,
        amountToUnstake:'',
        counting: true,
      }
    },
    props:[
      'staked',
      'time', 
      'rewards'
    ],
    methods:{
      async unStake(){
        this.loading = true

        if(!this.rewards.isZero()){
          this.$buefy.dialog.alert({
                    title: 'Error',
                    message: 'You have pending rewards to claim, please claim before unstaking, otherwise your rewards will be timelocked again.',
                    type: 'is-danger',
                    hasIcon: true,
                    icon: 'close-octagon',
                    iconPack: 'fa',
                    ariaRole: 'alertdialog',
                    ariaModal: true
                })
          this.loading = false
          return
        }

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
      onCountdownEnd() {
        this.counting = false
      }
    },
    computed:{
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      }),
      millisecondsLeft(){
        return this.time.toNumber()*1000
      }
    }
  }

</script>
