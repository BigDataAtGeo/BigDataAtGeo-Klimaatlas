<template>
<div id="content">
  <!--<carousel :perPage="1" :autoplay="false" paginationColor="#A9A9A9">
    <slide v-for="(cell,index) in this.$store.state.selectedCells" :key="cell.properties.id" >
      <WeatherLive :CellIndex="index" />
    </slide>
  </carousel>-->
  <vueper-slides :touchable=false :arrows=false class="no-shadow" fixedHeight="17rem" :bullets-outside="$store.state.selectedCells.length!=1" :key="reRender" >
    <vueper-slide v-for="(cell,index) in this.$store.state.selectedCells"  :key="cell.properties.id" :style="'background-color: white;'">
      <template v-slot:content>
        <WeatherLive :CellIndex="index"/>
      </template>
    </vueper-slide>
    <template v-slot:bullet="{active, slideIndex}" >
      <b-icon icon="square-fill" :style="[ active ? 'width: 18px; height: 18px;' : 'width: 9px; height: 9px;']+'color:'+ generateColor(selectedCells[slideIndex].properties.id,0)+';'"></b-icon>
    </template>
  </vueper-slides>
</div>
  
</template>

<script>
import WeatherLive from "./WeatherLive";
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import {colorGenerate} from '../mixins/colorGenerate';
import {mapState} from 'vuex';

export default {
    components:{WeatherLive, VueperSlides, VueperSlide},
    mixins: [colorGenerate],
    computed: {
            ...mapState(["selectedCells"]),
            cellLength(){
              return this.selectedCells.length
            }
    },        
    watch:{
      cellLength: function(newVal,oldVal) {
        if(newVal<oldVal){
          this.reRender+=1;
        }
      }
    },
    data:function(){
      return {
        reRender:0,
        oldVal:[]
      }
    }
}
</script>

<style scoped>

</style>