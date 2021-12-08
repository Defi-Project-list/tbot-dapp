<template>
  <div class="section">
    <div class="container is-max-desktop">
      <div class="columns">
        <div class="column is-narrow is-flex is-flex-direction-column is-justify-content-center">
          <img src="~assets/images/gift.png" alt="Present" height="60px" width="60px">
        </div>
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                Send and Receive the Gift of TBOT
              </p>
              <p class="subtitle is-6">
                Here you can use our smart contracts to create your own airdrops.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Start Claim Gift Box -->
      <div class="box">
        <p class="title is-5">My Gifts</p>

        <div v-if="!gifts.isZero()" class="is-flex is-justify-content-center">
          <p class="title is-5 has-text-centered">
            You have
            {{ parseFloat(utils.formatEther(gifts)).toLocaleString('en-US', {minimumFractionDigits: 6}) }} TBOT waiting
            for you.
          </p>
        </div>

        <div v-if="!gifts.isZero()" class="is-flex is-justify-content-center px-6-desktop mt-5">
          <b-button class="mx-6-desktop" type="is-success" size="is-medium" :loading="loading" :disabled="loading" @click="claim" expanded>
            Get Gifts</b-button>
        </div>

        <div v-else class="is-flex is-justify-content-center px-6-desktop mt-5">
          <p class="title is-6 has-text-centered has-text-grey-light">
            You have not received any gifts yet. Stay tuned.
          </p>
        </div>



      </div>

      <!-- Start Add Gift Box -->
      <div class="box">
        <p class="title is-5">Gift TBOT</p>
        <div v-if="myGifts.length" class="mb-5">
          <div v-for="(g, index) in myGifts" :key="index" class="mb-2">
            <b-field grouped group-multiline>
              <b-field expanded>
                <b-input :disabled="loading" v-model="g.wallet" placeholder="0x..." />
              </b-field>
              <b-field>
                <b-input :disabled="loading"  v-model="g.amount" @keypress.native="isNumber($event,g.amount)" type="text"
                  placeholder="0.0 TBOT" />
              </b-field>
              <p class="control">
                <b-button :disabled="loading" type="is-danger" icon-right="delete" @click="deleteLineToGifts(index)" />
              </p>
            </b-field>
          </div>
        </div>

        <div class="is-flex is-justify-content-center is-flex-direction-column is-align-items-center">
          <p class="title is-5 has-text-centered" v-if="!myGifts.length">
            Start by adding a wallet
          </p>
          <b-button class="mx-6-desktop" type="is-primary" size="is-small" icon-left="plus"
            :disabled="loading || !canAddWallet || myGifts.length >= 25" @click="addLineToGifts">
            Add wallet address</b-button>
        </div>

        <div class="is-flex is-justify-content-center px-6-desktop mt-5">
          <b-button class="mx-6-desktop" type="is-primary is-light" size="is-medium" expanded @click="connectWallet"
            v-if="!walletVersion || !mainAccount">
            Connect Wallet</b-button>

          <b-button v-else-if="allowance.isZero()" class="mx-6-desktop" type="is-success" size="is-medium"
            :disabled="loading || !canAddWallet || myGifts.length == 0" expanded @click="approve" :loading="loading">
            Approve</b-button>

          <b-button v-else-if="myGifts.length == 0" class="mx-6-desktop" type="is-success" size="is-medium" disabled
            expanded>Add wallet address</b-button>

          <b-button v-else-if="balance.lt(sumGifts)" class="mx-6-desktop" type="is-warning" size="is-medium" disabled
            expanded>Not enough balance</b-button>

          <b-button v-else class="mx-6-desktop" type="is-success" size="is-medium" :loading="loading" :disabled="loading || !canAddWallet"
            expanded @click="sendGifts">Send Gifts</b-button>
        </div>
      </div>

      <!-- Start Previous Gift Box -->
      <div class="box" >
        <p class="title is-5">Prevoius Gifts Sent</p>

        <div class="is-flex is-justify-content-center px-6-desktop mt-5">
          <p class="title is-6 has-text-centered has-text-grey-light" v-if="sentGifts.length == 0">
            You have not sent any gifts yet.
          </p>
          <div v-else>
            <b-table :data="giftsData" :columns="columns" striped mobile-cards ></b-table>
          </div>
        </div>
      </div>
    </div>



  </div>
</template>

<script>
  import {
    mapState
  } from 'vuex'
  import {
    utils,
    constants,
    Contract,
    providers
  } from 'ethers'
  import walletSelector from '../components/walletSelector'


  export default {
    data() {
      return {
        utils,
        interval: null,
        gifts: constants.Zero,
        loading: false,
        myGifts: [],
        sentGifts: [],
        columns:[{
            field: 'wallet',
            label: 'Address',
        },{
            field: 'amount',
            label: 'Amount',
        },]
      }
    },
    computed: {
      giftsData(){
        return this.sentGifts.map(el=>{
          return {
            wallet:el[0],
            amount:utils.formatEther(el[1]) + ' TBOT'
          }
        })
      },
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      }),
      ...mapState(['allowance', 'balance']),
      sumGifts() {
        if (this.myGifts.length > 0) {
          let total = 0
          for (const iterator of this.myGifts) {
            if (iterator.amount != '') {
              total = total + parseFloat(iterator.amount)
            }
          }
          return utils.parseEther(total.toString())

        } else {
          return constants.Zero
        }
      },
      canAddWallet() {
        if (this.myGifts.length > 0) {
          if (utils.isAddress(this.myGifts[this.myGifts.length - 1].wallet) &&
            this.myGifts[this.myGifts.length - 1].amount != ''
          ) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      }
    },
    methods: {
      async sendGifts() {

           this.loading = true

          let provider
          if (this.walletVersion == 'metamask') {
            provider = new providers.Web3Provider(this.$eth)
          } else if (this.walletVersion == 'walletConnect') {
            provider = new providers.Web3Provider(this.$connector)
          }else if (this.walletVersion == 'walletLink'){
            provider = new providers.Web3Provider(this.$walletlink)
          }

          const abi = require('~/assets/data/abi/Gifts.json')

          const signer = provider.getSigner()
          const contract = new Contract(this.$config.giftsContract, abi, signer)

          let addressList = []
          let amountList = []

          for (let index = 0; index < this.myGifts.length; index++) {
            const element = this.myGifts[index]
            addressList.push(element.wallet)
            amountList.push(utils.parseEther( parseFloat(element.amount).toString() ))

          }

          const signedTransaction = await contract.addGifts(addressList,amountList).catch(err=>{
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
          this.myGifts = []
          await this.getBalance()
          this.loading = false

      },
      addLineToGifts() {
        this.myGifts.push({
          wallet: '',
          amount: ''
        })
      },
      deleteLineToGifts(index) {
        this.myGifts.splice(index, 1)
      },
      async getBalance() {
        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        } else if (this.walletVersion == 'walletLink') {
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/Gifts.json')

        if (provider) {
          const contract = new Contract(this.$config.giftsContract, abi, provider)

          try {
            this.gifts = await contract.gifts(this.mainAccount)
            this.sentGifts = await contract.getDeposits(this.mainAccount)
          } catch (error) {
            console.log(error)
            this.gifts = constants.Zero
            this.sentGifts = []
          }
        }


      },
      async claim() {

           this.loading = true

          let provider
          if (this.walletVersion == 'metamask') {
            provider = new providers.Web3Provider(this.$eth)
          } else if (this.walletVersion == 'walletConnect') {
            provider = new providers.Web3Provider(this.$connector)
          }else if (this.walletVersion == 'walletLink'){
            provider = new providers.Web3Provider(this.$walletlink)
          }

          const abi = require('~/assets/data/abi/Gifts.json')

          const signer = provider.getSigner()
          const contract = new Contract(this.$config.giftsContract, abi, signer)

          const signedTransaction = await contract.getGifts().catch(err=>{
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

      },
      async approve() {
        this.loading = true

        let provider
        if (this.walletVersion == 'metamask') {
          provider = new providers.Web3Provider(this.$eth)
        } else if (this.walletVersion == 'walletConnect') {
          provider = new providers.Web3Provider(this.$connector)
        } else if (this.walletVersion == 'walletLink') {
          provider = new providers.Web3Provider(this.$walletlink)
        }

        const abi = require('~/assets/data/abi/IERC20.json')

        const signer = provider.getSigner()
        const contract = new Contract(this.$config.tbotContract, abi, signer)

        const signedTransaction = await contract.approve(this.$config.giftsContract, utils.parseEther('1000000'))
          .catch(err => {
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

        if (signedTransaction) {
          console.log("TX: ", signedTransaction)

          const progressMessage = this.$buefy.snackbar.open({
            message: `
              <div class="is-flex is-align-content-center">
              <div class="lds-ring mr-2"><div></div><div></div><div></div><div></div></div> Pending Transaction.
              <a class="has-text-white ml-1" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank"><i class="mdi mdi-open-in-new"></i></a></div>`,
            position: 'is-top',
            actionText: null,
            indefinite: true,
            queue: false
          })


          const txReceipt = await signedTransaction.wait().catch(err => {
            console.log(err)
            this.loading = false
          })
          progressMessage.close()

          console.log(txReceipt)

          if (txReceipt) {
            this.$buefy.notification.open({
              message: `Transaction Success!<br>
                    <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank">View on Etherscan <i class="mdi mdi-open-in-new"></i></a>`,
              duration: 10000,
              progressBar: true,
              closable: false,
              hasIcon: true,
              type: 'is-success',
              pauseOnHover: true
            })
          } else {
            this.$buefy.notification.open({
              message: `Transaction Error!<br>
                    <a class="has-text-white" href="https://etherscan.io/tx/${signedTransaction.hash}" target="_blank">View on Etherscan  <i class="mdi mdi-open-in-new"></i></a>`,
              duration: 10000,
              progressBar: true,
              closable: false,
              hasIcon: true,
              type: 'is-danger',
              pauseOnHover: true
            })
          }
        }

        // Update Balance and staking information
        await this.$store.dispatch('checkBalance', this.mainAccount)
        await this.$store.dispatch('checkAllowance', {
          wallet: this.mainAccount,
          contract: this.$config.giftsContract
        })

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
      isNumber(e, amount) {
        // console.log($event.keyCode); //keyCodes value
        let keyCode = (e.keyCode ? e.keyCode : e.which)

        // only allow numbers and one dot
        if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || amount.indexOf('.') != -1)) { // 46 is dot
          e.preventDefault()
        }

      }
    },
    mounted() {
      this.interval = setInterval(async () => {
        if (this.mainAccount) {
          await this.getBalance()
        }
      }, 120000)

    },
    beforeDestroy() {
      clearInterval(this.interval)
    },
    async fetch() {
      if (this.mainAccount) {
        await this.getBalance()
        await this.$store.dispatch('checkBalance', this.mainAccount)
        await this.$store.dispatch('checkAllowance', {
          wallet: this.mainAccount,
          contract: this.$config.giftsContract
        })
      }

    }
  }

</script>
