<template>
  <div>
    <p class="title is-5">Stake TBOT</p>
    <form>

      <b-field>

        <b-input placeholder="0.0 TBOT" type="text" expanded />
        <p class="control">
          <b-button type="is-primary" label="MAX" />
        </p>

      </b-field>

    </form>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button class="mx-6" type="is-primary is-light" size="is-medium" expanded @click="connectWallet" v-if="!walletVersion">
      Connect Wallet</b-button>
      <b-button class="mx-6" type="is-success" size="is-medium" expanded @click="approve()" v-else-if="allowance=='0'">
      Approve</b-button>
      <b-button class="mx-6" type="is-success" size="is-medium" expanded @click="stake()" :disabled="canStake" v-else>
        <span v-if="canStake">Stake</span><span v-else>Enter an amount</span></b-button>

    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import walletSelector from '../walletSelector.vue'

  export default {
    data(){
      return{}
    },
    computed:{
      ...mapState(['allowance']),
      ...mapState({
        mainAccount: state => state.localStorage.accounts[state.localStorage.selectedAccount],
        chainId: state => state.localStorage.chainId,
        walletVersion: state => state.localStorage.walletVersion
      }),
      canStake(){

      }
    },
    methods:{
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

      }
    }
  }

</script>
