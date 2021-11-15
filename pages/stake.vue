<template>
  <div class="section">
    <div class="container is-max-desktop">
      <div class="columns">
        <div class="column">
          <div class="message">
            <div class="message-body">
              <p class="title is-5">
                Maxmize yield by staking TBOT
              </p>
              <p class="subtitle is-6">
                Stake your TBOT and get yield on TBOT tokens. Read more about our TBOT vault <a href="https://tbot.fi/introduction-to-staking/" target="_blank">here</a>.
              </p>
            </div>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div class="message is-info">
            <div class="message-body">
              <p class="title is-5">{{apy}}%</p>
              <p class="subtitle is-6">APY</p>
            </div>
          </div>
        </div>
        <div class="column is-one-quarter">
          <div class="message is-info">
            <div class="message-body">
              <p class="title is-5">{{time}} Days</p>
              <p class="subtitle is-6">Timelock</p>
            </div>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <div class="box">
            <p class="title is-5">TBOT Balance</p>
            <div class="subtitle is-flex">
              <img src="~/assets/images/tbot-token.png" width="24px" height="24px" alt="Balance">
              <p class="ml-2">
                {{ parseFloat(utils.formatEther(balance)).toLocaleString('en-US', {minimumFractionDigits: 5}) }}
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <p class="title is-5">TBOT Staked</p>
            <div class="subtitle is-flex">
              <img src="~/assets/images/tbot-token.png" width="24px" height="24px" alt="Staked">
              <p class="ml-2">
                {{ parseFloat(utils.formatEther(staked)).toLocaleString('en-US', {minimumFractionDigits: 5}) }}
              </p>
            </div>
          </div>
        </div>
        <div class="column">
          <div class="box">
            <p class="title is-5">TBOT Claimed</p>
            <div class="subtitle is-flex">
              <img src="~/assets/images/tbot-token.png" width="24px" height="24px" alt="Rewards">
              <p class="ml-2">
                {{ parseFloat(utils.formatEther(claimed)).toLocaleString('en-US', {minimumFractionDigits: 5}) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <!-- Start Staking Box -->
      <div class="box">
        <b-tabs type="is-toggle" expanded>
          <b-tab-item label="Stake TBOT">
            <stakeTab :staked="staked" :time="timeToUnlock" />
          </b-tab-item>

          <b-tab-item label="Unstake">
            <stakeUnstakeTab :staked="staked" :time="timeToUnlock" />
          </b-tab-item>

          <b-tab-item label="Rewards">
            <stakeClaimTab :rewards="rewards" :time="timeToUnlock" />
          </b-tab-item>
        </b-tabs>
      </div>
    </div>

  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { utils } from 'ethers'

  export default {
    data(){
      return {
        provider:null,
        utils,
        interval: null
      }
    },
    computed:{
      ...mapState(['balance', 'staked', 'unstaked', 'rewards', 'claimed', 'apy', 'allowance', 'time', 'timeToUnlock']),
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId
      })
    },
    methods:{

    },
    mounted(){
      this.interval = setInterval(async () => {
        if(this.mainAccount){
          await this.$store.dispatch('getStakingData', this.mainAccount)
        }
      }, 30000)
    },
    beforeDestroy(){
      clearInterval(this.interval)
    },
    async fetch(){
      await this.$store.dispatch('getStakingData', this.mainAccount)
    }
  }

</script>
