<template>
  <div>
    <p class="title is-5">Unstake</p>
    <form>

      <b-field>

        <b-input placeholder="0.0 TBOT" type="text" expanded v-model="amountToUnstake" />

        <p class="control">
          <b-button type="is-primary" label="MAX" />
        </p>

      </b-field>

    </form>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button v-if="staked !== constants.Zero" class="mx-6" type="is-success" size="is-medium" @click="unStake" :disabled="loading" expanded>
        Unstake</b-button>
        <b-button v-else class="mx-6" type="is-success" size="is-medium" disabled expanded>
        Nothing to unstake</b-button>
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import {constants} from 'ethers'

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
      unStake(){

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
