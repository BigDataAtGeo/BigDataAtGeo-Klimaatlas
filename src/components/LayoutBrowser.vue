<template>
  <div id="layout">
    <div class="fixed-top" id="selection-container">
      <SettingsSelection/>
    </div>

    <div class="fixed-top" id="projectionmap-container">
      <ProjectionMap/>
    </div>
    <div class="float-right" id="widgets-container">
      <WidgetShell widgetName="Graph (Live)" class="row justify-content-end rounded p-0 focus-on-hover">
        <LiveLineCarousel/>
      </WidgetShell>
      <!--        <WidgetShell widgetName="WetterGraph" class="row justify-content-end rounded p-0">-->
      <!--            <Linegraph/>-->
      <!--        </WidgetShell>-->
      <WidgetShell v-if="selectedCells.length!==0" widgetName="Wetter (Live)"
                   class="row justify-content-end rounded p-0 focus-on-hover">
        <WeatherCarousel/>
      </WidgetShell>
      <WidgetShell widgetName="Variable" class="row justify-content-end rounded p-0 focus-on-hover">
        <VariableInfo :variable="variable"></VariableInfo>
      </WidgetShell>
    </div>

    <div class="fixed-bottom focus-on-hover" id="timeline-container">
      <Linegraph/>
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
  computed: {
    ...mapState(["selectedCells", "variable"])
  },
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
#layout {
  width: 100vw;
  height: 100vh;
  max-width: none;
}

#selection-container {
  z-index: 2;
  margin-top: 5px;
  margin-left: auto;
  margin-right: auto;
  width: 80vw;
  height: auto;
}

#timeline-container {
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 10px;
  max-height: 35vh;
  max-width: 80vw;
}

#projectionmap-container {
  z-index: 1;
  width: 100vw;
  height: 100vh;
}

#widgets-container {
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-self: end;
  width: 25vw;
  margin-right: 1vh;
  margin-top: 10vh;
}

#widgets-container .row {
  z-index: 2;
  margin-bottom: 1vh;
  justify-content: right;
}

.focus-on-hover:hover {
  z-index: 2000 !important;
}
</style>
