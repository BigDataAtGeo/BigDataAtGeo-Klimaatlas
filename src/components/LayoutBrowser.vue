<template>
  <div @mouseup="resizeWidgetsEnd($event)"
       @mousemove="isResizing ? resizeWidgets($event) : null">
    <div id="layout">
      <div id="selection-container">
        <SettingsSelection/>
      </div>

      <div id="projectionmap-container">
        <ProjectionMap/>
      </div>

      <div id="widgets-container" ref="widgets" v-bind:style="windowWidth > 768 ? widgetsContainerStyle : null">
        <WidgetShell v-if="selectedCells.length!==0" widgetName="Wetter (openweathermap.org)">
          <WeatherCarousel/>
        </WidgetShell>

        <WidgetShell v-if="this.variable" widgetName="Variablenbeschreibung">
          <InformationText :headline="variable.var" :text="variable.description"></InformationText>
        </WidgetShell>

        <WidgetShell widgetName="Timeline" v-show="selectedCells.length!==0 && selectionUri">
          <VariableLineChart/>
        </WidgetShell>

        <WidgetShell widgetName="Sensordaten" v-if="selectedStations.length!==0">
          <LiveLineCarousel/>
        </WidgetShell>

        <div id="drag" @mousedown="resizeWidgetsStart($event)"></div>
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
import {mapState} from "vuex";

export default {
  name: "LayoutBrowser",
  components: {
    SettingsSelection,
    VariableLineChart,
    ProjectionMap,
    WidgetShell,
    WeatherCarousel,
    LiveLineCarousel,
    InformationText
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
    ...mapState(["selectedCells", "selectedStations", "variable", "selectionUri"]),
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
    onResize() {
      this.windowWidth = window.innerWidth;
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
     * Ends the widget container resizing listener and saves changes to local storage
     * @param event HTML mouse event (mouseup)
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
      const dx = this.resizeStart - event.x; // new additional width
      const containerWidth = parseInt(getComputedStyle(this.$refs.widgets).width); // old width
      this.widgetsContainerStyle = {"width": (containerWidth + dx) + "px !important"}; // bound by vue
      this.resizeStart = event.x; // save new width for next delta
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
    pointer-events: all;
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

  #widgets-container > * {
    pointer-events: all;
    z-index: 1030 !important; /* bootstrap row has 1030 */
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
    pointer-events: all;
  }

  #selection-container {
    width: auto;
    margin: 0 auto;
    /* text-align: center; */
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

  #widgets-container > * {
    position: relative;
    pointer-events: all;
    z-index: 1030 !important; /* bootstrap row has 1030 */
  }

  #drag {
    background-color: transparent;
    position: fixed;
    top: 0;
    width: 1.5rem;
    height: 100%;
    cursor: w-resize;
    pointer-events: all;
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
