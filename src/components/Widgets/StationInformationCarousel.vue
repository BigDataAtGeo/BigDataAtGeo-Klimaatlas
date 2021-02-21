<template>
  <div>
    <vueper-slides :touchable=false :arrows=false class="no-shadow" fixedHeight="3.5rem"
                   :bullets-outside="selectedSensors.length!==1" :key="selectedSensors.length">
      <vueper-slide v-for="sensor in selectedSensors" :key="sensor.id">
        <template v-slot:content>
          <InformationText :headline="'Test'" :text="'Test'"/>
        </template>
      </vueper-slide>
      <template v-slot:bullet="{ active, slideIndex, index }">
        <i class="default-bullet" v-bind:style="getBulletStyle(slideIndex, active)"></i>
      </template>
    </vueper-slides>
  </div>
</template>

<script>
import {mapState} from "vuex";
import {VueperSlides, VueperSlide} from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'
import InformationText from "@/components/Widgets/InformationText";

export default {
  components: {InformationText, VueperSlides, VueperSlide},
  data() {
    return {
      navigateTo: null,
    }
  },
  computed: {
    ...mapState(["selectedSensors"]),
  },
  watch: {
    selectedSensors: function () {
      this.navigateTo = this.selectedSensors.length;
    }
  },
  methods: {
    getBulletStyle(sensorIndex, active) {
      const sensorColor = this.selectedSensors[sensorIndex].color;
      return {
        backgroundColor: sensorColor,
        boxShadow: "box-shadow: 0 0 1px " + sensorColor + ", 0 0 3px " + sensorColor,
        border: active ? "2px solid #454545" : "0"
      }
    },
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

