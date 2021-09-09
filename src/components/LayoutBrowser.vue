<template>
  <div @mouseup="resizeWidgetsEnd($event)" 
       @mousemove="isResizing ? resizeWidgets($event) : null" @touchend="resizeWidgetsEnd($event)" 
       @touchmove="isResizing ? resizeWidgetsTouch($event) : null">
    <div id="layout">
      <div id="selection-container">
        <SettingsSelection/>
      </div>

      <div id="projectionmap-container">
        <ProjectionMap/>
      </div>

      <div id="widgets-container" ref="widgets" v-bind:style="windowWidth > 768 ? widgetsContainerStyle : null">
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

          <WidgetShell :widgetName="this.dataWidgetName" v-if="selectedStations.length!==0" :hideHandler=toggle :showDefault=true>
            <LiveLineCarousel/>
          </WidgetShell>

          <div id="drag" @mousedown="resizeWidgetsStart($event)" @touchstart="resizeWidgetsStartTouch($event)" ></div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SettingsSelection from "./Widgets/SettingsSelection";
import VariableLineChart from "./Widgets/CellLineChart";
import ProjectionMap from "./Widgets/ProjectionMap";
import WidgetShell from "./Widgets/WidgetShell";
import WeatherCarousel from "./Widgets/WeatherCarousel";
import InformationText from "./Widgets/InformationText";
import LiveLineCarousel from "@/components/Widgets/StationLineChartCarousel";
import {mapState, mapMutations} from "vuex";
import StationsInformationenCarousel from "@/components/Widgets/StationsInformationenCarousel";

export default {
  name: "LayoutBrowser",
  components: {
    StationsInformationenCarousel,
    SettingsSelection,
    VariableLineChart,
    ProjectionMap,
    WidgetShell,
    WeatherCarousel,
    LiveLineCarousel,
    InformationText,
  },
  data() {
    return {
      windowWidth: window.innerWidth,
      isResizing: false,
      resizeStart: null,
      widgetsContainerStyle: {},
      millisAtLastResize: 0,
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
  },
  methods: {
    ...mapMutations(["setWidgetWidth", "setLineChartHidden"]),

    toggle(state){
      this.setLineChartHidden(state);
    },

    onResize() {
      this.windowWidth = window.innerWidth;

      if(this.widgetWidth > this.windowWidth){
        let newWidth = 0.8 * this.windowWidth
        this.setWidgetWidth(newWidth)
        this.widgetsContainerStyle = {"width": (newWidth) + "px !important"}; // bound by vue
      }
    },

    /**
     * Enables the widget container resizing listener by setting isResizing to true and saves the mouse start position
     * @param event HTML mouse event (mousedown)
     */
    resizeWidgetsStart(event) {
      event.preventDefault(); // prevent text selection
      this.isResizing = true; // enable resizing listener
      this.resizeStart = event.x;
    },

    /**
     * Enables the widget container resizing listener by setting isResizing to true and saves the Touch start position
     * @param event HTML mouse event (touchstart)
     */
    resizeWidgetsStartTouch(event) {
      event.preventDefault(); // prevent text selection
      this.isResizing = true; // enable resizing listener
      this.resizeStart = event.touches[0].clientX;
    },

    /**
     * Calculates and sets a new widget container width from the mouse's delta x
     * @param event HTML touch event (touchmove)
     */
    resizeWidgetsTouch(event){
      this.millisAtLastResize = Date.now();
      const dx = this.resizeStart - event.changedTouches[0].clientX; // new additional width
      const containerWidth = parseInt(getComputedStyle(this.$refs.widgets).width); // old width
      this.widgetsContainerStyle = {"width": (containerWidth + dx) + "px !important"}; // bound by vue
      this.resizeStart = event.changedTouches[0].clientX; // save new width for next delta
      setTimeout(() => {
        if( Date.now() - this.millisAtLastResize > 80){
          this.setWidgetWidth(containerWidth + dx)
        }
      }, 100);
    },

    /**
     * Ends the widget container resizing listener and saves changes to local storage
     * @param event HTML mouse / touch event (mouseup / touchend)
     */
    resizeWidgetsEnd(event) {
      this.isResizing = false; // disable resizing listener
      localStorage.setItem("widgetsContainerWidth", JSON.stringify(this.widgetsContainerStyle));
    },

    /**
     * Calculates and sets a new widget container width from the mouse's delta x
     * @param event HTML mouse event (mousemove)
     */
    resizeWidgets(event) {
      this.millisAtLastResize = Date.now();
      const dx = this.resizeStart - event.x; // new additional width
      const containerWidth = parseInt(getComputedStyle(this.$refs.widgets).width); // old width
      this.widgetsContainerStyle = {"width": (containerWidth + dx) + "px !important"}; // bound by vue
      this.resizeStart = event.x; // save new width for next delta
      setTimeout(() => {
        if( Date.now() - this.millisAtLastResize > 80){
          this.setWidgetWidth(containerWidth + dx)
        }
      }, 100);
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>

@media only screen and (max-width: 768px) {
  #layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    pointer-events: none;
    overflow-x: hidden;

    display: flex;
    flex-flow: column;
    /*grid-template-rows: auto 1fr;*/
  }

  #layout > * {
    pointer-events: auto;
  }

  #selection-container {
    z-index: 1040;
  }

  #projectionmap-container {
    z-index: -1;
    height: 360px;
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

  #drag {
    display: none;
  }
}

@media only screen and (min-width: 768px) {
  #projectionmap-container {
    z-index: -1;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
    grid-template-columns: 1fr minmax(20rem,25vw);
    column-gap: 10px;
    row-gap: 10px;
  }

  #layout > * {
    pointer-events: auto;
  }

  #selection-container {
    width: auto;
    margin: 0 auto;
    grid-area: selection;
    z-index: 1040;
  }

  #widgets-container {
    grid-area: widgets;
    pointer-events: none;
    position: absolute;
    height: inherit;
    right: 0;
    overflow-y: scroll;
  }

  #widgets-container-inner {
    position: relative;
    pointer-events: auto;
    z-index: 1030 !important; /* bootstrap row has 1030 */

    max-height: 100%;
    overflow-y: scroll;
  }

  #drag {
    background-color: transparent;
    position: fixed;
    top: 0;
    width: 1.5rem;
    height: 100%;
    cursor: w-resize;
    pointer-events: auto;
    /*margin-left: -.75rem;*/
  }
}

/*#timeline-container {*/
/*  text-align: right;*/

/*  height: 100%;*/
/*  width: 100%;*/

/*  grid-area: timeline;*/
/*}*/
</style>
