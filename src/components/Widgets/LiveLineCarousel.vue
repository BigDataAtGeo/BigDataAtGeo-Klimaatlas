<template>
  <div>
    <carousel :perPage="1" :autoplay="false"
              :mouse-drag="false"
              :pagination-padding="5"
              :pagination-position="'top'"
              :adjustable-height="true"
              :navigate-to="[navigateTo, true]">
      <slide class="full-width" v-for="sensor in selectedSensors" :key="sensor.id">
        <LiveLinegraph :sensor="sensor"/>
      </slide>
    </carousel>
  </div>

</template>

<script>
import LiveLinegraph from "@/components/Widgets/LiveLinegraph";
import {mapState} from "vuex";

export default {
  components: {LiveLinegraph},
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

