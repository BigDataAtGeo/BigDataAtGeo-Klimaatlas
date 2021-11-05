<template>
  <div>
    <div id="layout">
      <div id="selection-container">
        <SettingsMobile v-click-outside-app="closeMenu"/>
      </div>

      <div id="projectionmap-container">
        <ProjectionMap :mobile="true"/>
      </div>

      <div id="widgets-container" ref="widgets">
        <div id="widgets-container-inner">
          <WidgetShell v-if="selectedCells.length!==0" widgetName="Wetter (openweathermap.org)">
            <WeatherCarousel/>
          </WidgetShell>

          <WidgetShell v-if="this.variable" widgetName="Variablenbeschreibung">
            <InformationText :headline="variable.var" :text="variable.description"></InformationText>
          </WidgetShell>

          <WidgetShell widgetName="Timeline" v-show="selectedCells.length!==0 && selectionUri">
            <VariableLineChart/>
          </WidgetShell>

          <WidgetShell :widgetName="this.infoWidgetName" v-if="selectedStations.length!==0">
            <StationsInformationenCarousel></StationsInformationenCarousel>
          </WidgetShell>

          <WidgetShell :widgetName="this.dataWidgetName" v-if="selectedStations.length!==0" :hideHandler=toggle :showDefault=false>
            <LiveLineCarousel/>
          </WidgetShell>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsSelection from "./Widgets/SettingsSelection";
import SettingsMobile from "./Widgets/SettingsMobile"
import VariableLineChart from "./Widgets/CellLineChart";
import ProjectionMap from "./Widgets/ProjectionMap";
import WidgetShell from "./Widgets/WidgetShell";
import WeatherCarousel from "./Widgets/WeatherCarousel";
import InformationText from "./Widgets/InformationText";
import LiveLineCarousel from "@/components/Widgets/StationLineChartCarousel";
import StationsInformationenCarousel from "@/components/Widgets/StationsInformationenCarousel";
import {mapState, mapMutations} from "vuex";

export default {
  name: "LayoutMobile",
  components: {
    SettingsSelection,
    VariableLineChart,
    ProjectionMap,
    WidgetShell,
    WeatherCarousel,
    LiveLineCarousel,
    InformationText,
    SettingsMobile,
    StationsInformationenCarousel
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      isResizing: false,
      resizeStart: null,
      widgetsContainerStyle: {},
    }
  },
  computed: {
    ...mapState(["selectedCells", "selectedStations", "activeStation", "variable", "selectionUri", "lineChartHidden", "widgetWidth"]),
    
    infoWidgetName: function(){
      let stations = this.selectedStations;
      let active = stations[this.activeStation];

      if(active == undefined && this.activeStation > 0){
        active = stations[this.activeStation-1]
      } else if(active == undefined){
         return "Informationen zur Messstation"  
      }

      return "Informationen zur Messstation (" + active.name + ")";
    },
    dataWidgetName: function(){
      let stations = this.selectedStations;
      let active = stations[this.activeStation];

      if(active == undefined && this.activeStation > 0){
        active = stations[this.activeStation-1]
      } else if(active == undefined){
         return "Daten zur Messstation"  
      }

      return "Daten zur Messstation (" + active.name + ")";
    }
  },
  mounted() {
    // reload old widgets container width from local storage
    const oldWidgetContainerWidth = localStorage.getItem("widgetsContainerWidth");
    if (oldWidgetContainerWidth !== null) {
      this.widgetsContainerStyle = JSON.parse(oldWidgetContainerWidth);
    }
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    })

    this.setWidgetWidth(this.windowWidth)
  },

  watch: {
    windowWidth: function(){
      this.setWidgetWidth(this.windowWidth);
    } ,
  },

  methods: {
    ...mapMutations(["setWidgetWidth", "setLineChartHidden"]),

    onResize() {
      this.windowWidth = window.innerWidth;
    },
    toggle(state){
      /* Is used in StationLineChart, so it should only load new data when necessary */
      this.setLineChartHidden(state);
    },
     closeMenu() {
      this.$root.$emit("closeMenu"); // emitted event
    }
  },
  directives: {
    "click-outside-app": {
      // This is used to close the Settings on Mobile, when a click is outside of the Settings-Container
      bind: function(el, binding) {
        const eventHandler = event => {
          if (!el.contains(event.target) && el !== event.target) {
            binding.value(event);
          }
        };
        el.__vueClickEventHandler__ = eventHandler;
        document.addEventListener("click", eventHandler);
      },
      unbind: function(el) {
        document.removeEventListener("click", el.__vueClickEventHandler__);
      }
    }
  },
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>

.fullscreen_ {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow:hidden;
}

#layout{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    
    pointer-events: none;
    overflow-x: hidden;
    
    display: flex;
    flex-flow: column;
  }

  #layout > * {
    pointer-events: auto;
  }

   #selection-container {
    z-index: 1040;
    position: fixed;
    width: 100%;
  }

  #projectionmap-container {
    z-index: -1;
    height: 75vh;
    width: 100vw;
  }


  #widgets-container {
    grid-area: widgets;
    pointer-events: none;
  }

  #widgets-container-inner {
    pointer-events: auto;
    z-index: 1030 !important; /* bootstrap row has 1030 */

    max-height: 100%;
    overflow-y: scroll;
  }

</style>
