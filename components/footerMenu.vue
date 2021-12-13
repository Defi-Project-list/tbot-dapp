<template>
  <b-navbar fixed-bottom :mobile-burger="false" centered :class="$device.isAndroid?'mb-5':''">
    <template #start>
      <floatingMenu />
    </template>
  </b-navbar>
</template>

<script>
export default {
  data(){
    return{

    }
  }
}
</script>
