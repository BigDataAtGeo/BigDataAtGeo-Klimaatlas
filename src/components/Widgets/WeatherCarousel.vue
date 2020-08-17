<template>
<div>
  <carousel :perPage="1" :autoplay="false">
    <slide >
      <WeatherLive :CellIndex="-1" />
    </slide>
    <slide v-for="(cell,index) in this.$store.state.selectedCells" :key="cell.properties.id" >
      <WeatherLive :CellIndex="index" />
    </slide>
  </carousel>
</div>
  
</template>

<script>
import WeatherLive from "./WeatherLive";

export default {
    components:{WeatherLive}
}
</script>

<style>

</style>