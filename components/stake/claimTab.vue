<template>
  <div>
    <p class="title is-5">Claim Rewards</p>

    <div class="is-flex is-justify-content-center">
      <p class="title is-5">
        Total Rewards: {{rewards}} TBOT
      </p>
    </div>

    <div class="is-flex is-justify-content-center px-6 mt-5">
      <b-button class="mx-6" type="is-success" size="is-medium" expanded>
        Claim Rewards</b-button>
    </div>
    <div class="is-flex is-justify-content-center px-6 mt-2">
      <b-button class="mx-6" type="is-primary" size="is-medium" expanded>
        Vest Rewards</b-button>
    </div>
  </div>
</template>

<script>
  export default {
    data(){
      return{}
    },
    props:[
      'rewards'
    ]
  }

</script>
