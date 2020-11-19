<template>
  <div @mouseup="resizeWidgetsEnd($event)"
       @mousemove="isResizing ? resizeWidgets($event) : null">
    <div id="projectionmap-container">
      <ProjectionMap/>
    </div>
    <div id="layout" v-bind:style="{ 'grid-template-columns': gridColumns}">
      <div id="selection-container">
        <SettingsSelection/>
      </div>

      <div id="widgets-container" ref="widgets" v-bind:style="widgetsContainerStyle">
        <WidgetShell v-if="selectedCells.length!==0" widgetName="Wetter (openweathermap.org)">
          <WeatherCarousel/>
        </WidgetShell>

        <WidgetShell widgetName="Variablenbeschreibung">
          <VariableInfo :variable="variable"></VariableInfo>
        </WidgetShell>

        <WidgetShell widgetName="Timeline" v-show="selectedCells.length!==0 && selectionUri">
          <Linegraph/>
        </WidgetShell>

        <WidgetShell widgetName="Sensordaten" v-if="selectedSensors.length!==0">
          <LiveLineCarousel/>
        </WidgetShell>

        <div id="drag" @mousedown="resizeWidgetsStart($event)"></div>
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
  data() {
    return {
      windowWidth: window.innerWidth,
      isResizing: false,
      resizeStart: null,
      widgetsContainerStyle: {},
    }
  },
  computed: {
    ...mapState(["selectedCells", "selectedSensors", "variable", "selectionUri"]),
    gridColumns() {
      if (this.windowWidth > 1280) return '1fr minmax(20rem,25vw)'
      else return '1fr minmax(20rem,40vw)'
    },
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
  pointer-events: all;
  z-index: 1030 !important; /* bootstrap row has 1030 */
}

#drag {
  background-color: transparent;
  position: absolute;
  top: 0;
  width: 1.5rem;
  height: 100%;
  cursor: w-resize;
  pointer-events: all;
  margin-left: -.75rem;
}

/*#timeline-container {*/
/*  text-align: right;*/

/*  height: 100%;*/
/*  width: 100%;*/

/*  grid-area: timeline;*/
/*}*/
</style>
