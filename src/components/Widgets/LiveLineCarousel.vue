<template>
  <div>
    <!--<carousel :perPage="1" :autoplay="false"
              :mouse-drag="false"
              :pagination-padding="5"
              :pagination-position="'top'"
              :adjustable-height="true"
              :navigate-to="[navigateTo, true]"
              paginationColor="#A9A9A9">
      <slide class="full-width" v-for="sensor in selectedSensors" :key="sensor.id">
        <LiveLinegraph :sensor="sensor"/>
      </slide>
    </carousel> -->
    <vueper-slides :touchable=false :arrows=false class="no-shadow" fixedHeight="27rem" :bullets-outside="$store.state.selectedSensors.length!=1" :key="selectedSensors.length">
    <vueper-slide v-for="sensor in selectedSensors" :key="sensor.id" >
      <template v-slot:content>
        <LiveLinegraph :sensor="sensor"/>
      </template>
    </vueper-slide>
  </vueper-slides>
  </div>

</template>

<script>
import LiveLinegraph from "@/components/Widgets/LiveLinegraph";
import {mapState} from "vuex";
import { VueperSlides, VueperSlide } from 'vueperslides'
import 'vueperslides/dist/vueperslides.css'

export default {
  components: {LiveLinegraph, VueperSlides, VueperSlide},
  data(){
    return {
      navigateTo: null,
    }
  },
  computed: {
    ...mapState(["selectedSensors"])
  },
  watch: {
    selectedSensors: function() {
      this.navigateTo = this.selectedSensors.length;
    }
  }
}
</script>

