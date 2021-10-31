<template>
  <div>
    <p class="title is-5">Claim Rewards</p>

    <div class="is-flex is-justify-content-center">
      <p class="title is-5">
        Total Rewards: {{ parseFloat(utils.formatEther(rewards)).toLocaleString('en-US', {minimumFractionDigits: 6}) }} TBOT
      </p>
    </div>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button v-if="rewards !== constants.Zero" class="mx-6" type="is-success" size="is-medium" :disabled="loading" @click="claimRewards" expanded>
        Claim Rewards</b-button>
        <b-button v-else class="mx-6" type="is-success" size="is-medium" disabled  expanded>
        No claimable rewards</b-button>
    </div>
    <!-- <div class="is-flex is-justify-content-center px-6 mt-2">
      <b-button class="mx-6" type="is-primary" size="is-medium" expanded>
        Vest Rewards</b-button>
    </div> -->
  </div>
</template>

<script>
  import {utils, constants} from 'ethers'
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
      claimRewards(){

      }
    },
    computed:{
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId
      })
    }
  }

</script>
