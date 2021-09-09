<template>
  <div>
        <StationsInformationen :station="selectedStations[this.activeStation]" :index_prop=1 />
  </div>
</template>

<script>
import StationsInformationen from "@/components/Widgets/StationsInformationen";
import {mapState} from "vuex";

export default {
  components: {StationsInformationen},

  computed: {
    ...mapState(["selectedStations", "activeStation"])
  },

  methods: {
    
    getStation(){
      return this.selectedStations[this.activeStation];
    },
    setIndex(profile){
      this.index = profile;
    }
  }
}
</script>

<style scoped>

.full-height {
  height: 100%;
}

</style>

