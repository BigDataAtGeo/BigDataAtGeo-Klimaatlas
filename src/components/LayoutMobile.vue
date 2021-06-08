<template>
  <div @mouseup="resizeWidgetsEnd($event)"
       @mousemove="isResizing ? resizeWidgets($event) : null">
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

          <WidgetShell widgetName="Sensordaten" v-if="selectedStations.length!==0">
            <LiveLineCarousel/>
          </WidgetShell>

          <div id="drag" @mousedown="resizeWidgetsStart($event)"></div>
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
import {mapState} from "vuex";

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
    SettingsMobile
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

  #drag {
    display: none;
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
