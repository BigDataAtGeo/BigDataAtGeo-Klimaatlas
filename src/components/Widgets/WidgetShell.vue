<template>
  <div>
      <Button @click="hideWidget" v-if="showWidget">Min</Button>
      <Button @click="hideWidget" v-else>Max</Button>
      <div v-if="showWidget" >
        <slot></slot>
      </div>
      <div></div>
  </div>
</template>

<script>
export default {
    data: function(){
    return {
      showWidget:true
    }
  },
  methods:{
    hideWidget(){
      if(this.showWidget){
        this.showWidget=false
      }else{
        this.showWidget=true
      }
    }
  }
}
</script>

<style scoped>
</style>