<template>
  <div>
    <div id="projectionmap-container">
      <ProjectionMap/>
    </div>
    <div id="layout" v-bind:style="{ 'grid-template-columns': gridColumns}">
      <div id="selection-container">
        <SettingsSelection/>
      </div>

      <div id="widgets-container" >
        <WidgetShell v-if="selectedCells.length!==0" widgetName="Wetter">
          <WeatherCarousel/>
        </WidgetShell>

        <WidgetShell widgetName="Variablenbeschreibung">
          <VariableInfo :variable="variable"></VariableInfo>
        </WidgetShell>

        <WidgetShell widgetName="Timeline" v-show="selectedCells.length!==0">
          <Linegraph/>
        </WidgetShell>

        <WidgetShell widgetName="Sensordaten" v-if="this.$store.state.selectedSensors.length!=0">
          <LiveLineCarousel/>
        </WidgetShell>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsSelection from "./Widgets/SettingsSelection";
import Linegraph from "./Widgets/Linegraph";
import ProjectionMap from "./Widgets/ProjectionMap";
import WidgetShell from "./Widgets/WidgetShell";
import WeatherCarousel from "./Widgets/WeatherCarousel";
import VariableInfo from "./Widgets/VariableInfo";
import LiveLineCarousel from "@/components/Widgets/LiveLineCarousel";
import {mapState} from "vuex";

export default {
  name: "LayoutBrowser",
  components: {
    SettingsSelection,
    Linegraph,
    ProjectionMap,
    WidgetShell,
    WeatherCarousel,
    LiveLineCarousel,
    VariableInfo
  },
  data(){
    return{
      windowWidth:window.innerWidth
    }
  },
  computed: {
    ...mapState(["selectedCells", "variable"]),
    gridColumns(){
      if(this.windowWidth>1280) return '1fr minmax(20rem,25vw)'
      else return '1fr minmax(20rem,40vw)'
    },
  },
  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })
  },
  methods: {  
    onResize() {
      this.windowWidth = window.innerWidth;
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>

<style scoped>
#projectionmap-container {
  z-index: 1;
  width: 100vw;
  height: 100vh;
}

#layout {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1030;
  pointer-events: none;
  
  display: grid;
  grid-template-areas:
    "selection selection"
    ". widgets";
  grid-template-rows: auto 1fr;
  column-gap: 10px;
  row-gap: 10px;
}

#layout > * {
  pointer-events: all;
}

#selection-container {
  width: auto;
  margin: 0 auto;
  /* text-align: center; */
  grid-area: selection;
}

#widgets-container {
  grid-area: widgets;
  pointer-events: none;
  overflow-y: scroll;
}

#widgets-container > * {
  pointer-events: all;
  z-index: 1030 !important; /* bootstrap row has 1030 */
}

#timeline-container {
  text-align: right;
  
  height: 100%;
  width: 100%;

  grid-area: timeline;
}
</style>
