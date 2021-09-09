<template>
  <div>
    <vueper-slides :touchable=false :arrows=false class="no-shadow" fixedHeight="30rem"
                   :bullets-outside="selectedStations.length!==1" :key="selectedStations.length" @slide="setActive('slide', $event)" @ready="setActive('slide', $event)" >
      <vueper-slide v-for="station in selectedStations" :key="station.id">
        <template v-slot:content>
          <LiveLinegraph :station="station"/>
        </template>
      </vueper-slide>
      <template  v-slot:bullet="{ active, slideIndex, index }">
        <i v-b-tooltip.hover.bottom :title='getStationName(index)' class="default-bullet" v-bind:style="getBulletStyle(slideIndex, active)"></i>
      </template>
    </vueper-slides>
  </div>

</template>

<script>
import LiveLinegraph from "@/components/Widgets/StationLineChart";
import {mapMutations, mapState} from "vuex";
import {VueperSlides, VueperSlide} from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
  /**
   * This widget wraps line charts for each selected station in a slide show
   */

  components: {LiveLinegraph, VueperSlides, VueperSlide},

  computed: {
    ...mapState(["selectedStations", "activeStation"])
  },

  methods: {
    ...mapMutations(["setActiveStation"]),
    /**
     * Set the bullet point styling for each slide
     * Indicate if a slide is selected, i. e. active, by showing a thick border
     * @param stationIndex
     * @param active
     */
    getBulletStyle(stationIndex, active) {
      const stationColor = this.selectedStations[stationIndex].color;
      return {
        backgroundColor: stationColor,
        boxShadow: "box-shadow: 0 0 1px " + stationColor + ", 0 0 3px " + stationColor,
        border: active ? "2px solid #454545" : "0"
      }
    },

    getStationName(stationIndex) {
      return this.selectedStations[stationIndex-1].name;
    },

    setActive(eventName, params) {
      let index = params.currentSlide.index;
      this.setActiveStation(index);
  }
  }
}
</script>

<style scoped>
.default-bullet {
  width: 15px;
  height: 15px;
  border-radius: 15px;
  transition: .4s ease-in-out;
  box-sizing: border-box;
}
</style>

