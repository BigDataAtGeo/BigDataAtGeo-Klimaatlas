<template>
  <b-container class="container-bg p-0 rounded">
    <b-row align-h="end" class="justify-content-right">
      <b-col class=""> 
        <b-button @click="hideWidget" v-if="showWidget" class="btn btn-secondary" id="button">
          {{widgetName}} <b-icon icon="box-arrow-in-up-right"></b-icon>  
        </b-button>
        <b-button  @click="hideWidget" v-else  class="btn btn-secondary" id="button">
          {{widgetName}} <b-icon icon="box-arrow-in-down-left"></b-icon>   
        </b-button>
      </b-col>
    </b-row>
    <b-row v-if="showWidget" id="widgetContent">
      <b-col>
        <slot ></slot>
      </b-col>
    </b-row>
  </b-container>
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
#button{
  width: 150px;
  height: 4vh;
  margin-bottom: 5px;
}
.container-bg{
  background-color: rgba(179, 174, 174, 0.774);
}
#widgetContent{
  width: 21vw;
  min-height: 15vh;
  overflow: hidden;
}
</style>