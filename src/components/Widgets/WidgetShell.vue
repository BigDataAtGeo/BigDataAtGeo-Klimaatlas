<template>
  <div class="container-bg">
    <div @click="hideWidget" v-if="showWidget" class="container-header text-secondary">
        <b-icon icon="caret-down-fill"></b-icon> {{widgetName}}
    </div>
    <div @click="hideWidget" v-else  class="container-header text-secondary">
      <b-icon icon="caret-right-fill"> </b-icon> {{widgetName}}
    </div>
    <div v-if="showWidget" id="widgetContent">
      <slot></slot>
    </div>
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
  },
  props:{
    widgetName:{
      type:String,
      required:true,
      default:'widgetName'
    }
  }
}
</script>

<style scoped>
.container-header{
  width: 100%;
  padding: 15px;
  cursor: pointer;
}

.container-bg{
  box-sizing: border-box;

  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px 0px 0px 8px;
  box-shadow: rgba(65, 69, 73, 0.3) 0px 1px 2px 0px, rgba(65, 69, 73, 0.15) 0px 3px 6px 2px;

  margin-bottom: 10px;
}

#widgetContent{
  width: 100%;
  /* min-height: 8vh; */
  overflow: hidden;
  margin: 0;
  padding: 0px 20px 20px 20px;
}
</style>
