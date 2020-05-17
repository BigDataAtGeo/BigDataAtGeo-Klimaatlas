<template>
  <b-container class="container-bg p-2 rounded">
    <b-row align-h="end" class="justify-content-right">
      <b-col class=""> 
        <b-button @click="hideWidget" v-if="showWidget" class="btn btn-secondary" id="button">
          {{widgetName}} <b-icon icon="box-arrow-in-down-right"></b-icon>  
        </b-button>
        <b-button  @click="hideWidget" v-else  class="btn btn-secondary" id="button">
          {{widgetName}} <b-icon icon="box-arrow-in-up-left"></b-icon>   
        </b-button>
      </b-col>
    </b-row>
    <b-row v-if="showWidget" >
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
  width: 16vh;
  height: 4vh;
}
.container-bg{
  background-color: rgba(122, 122, 122, 0.568);
  max-width: 20vh;
}
</style>