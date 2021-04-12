<template>
  <div class="container">
    <div v-if="station.text">{{ station.text }}</div>
    <div id="display-station-container">
      <div class="form-group d-flex flex-row align-items-center" id="choose-variable-container">
        <div class="flex">
          <button class="btn remove-station-button"
                  v-on:click="removeSelectedStation(station)"
                  :style="{backgroundColor: station.color, color: 'white'}">
            {{ station.name }} <span
              class="h5">&times;</span>
          </button>
        </div>
        <b-dropdown v-if="this.parsedData" text="Variablen Wählen"
                    class="flex-grow-1 m-md-2 liveline-dropdown z-order-front">
          <b-dropdown-item v-for="channel of Object.values(parsedData)" :key="channel.translation"
                           class="d-flex align-items-center">
            <label @click.stop="" class="d-flex align-self-center">
              <input type="checkbox" :value="channel" v-model="selectedChannels"
                     class="mr-2">
              {{ channel.translation }}
            </label>
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <line-chart id="line-chart"
                  v-if="chartData"
                  :chartData="chartData"
                  :options="chartOptions"/>
      <div v-if="!parsedData" class="flex-row text-center align-self-center justify-content-center">
        <div class="spinner-border text-primary loader" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div id="choose-date-container" v-if="parsedData">
        <div class="input-group input-group-md mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">Von:</span>
          </div>
          <input type="date" class="form-control"
                 :value="getLineTimeAsString('start')"
                 @input="selectTimeFromInput($event, 'start')">
<!--          <input type="date" class="form-control"-->
<!--                 @input="selectTimeFromInput($event, 'start')">-->
          <div class="input-group-prepend">
            <span class="input-group-text">Bis:</span>
          </div>
          <input type="date" class="form-control"
                 :value="getLineTimeAsString('end')"
                 @input="selectTimeFromInput($event, 'end')">
<!--          <input type="date" class="form-control"-->
<!--                 @input="selectTimeFromInput($event, 'end')">-->
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import {mapMutations, mapState} from "vuex";
import {EvaAPI} from "@/eva/eva-api";
import LineChart from "./LineChart";
import 'chartjs-plugin-zoom';
import {colorGenerate} from "@/components/mixins/colorGenerate";

export default {
  name: "LiveLinegraph",
  components: {LineChart},
  mixins: [colorGenerate],
  props: {
    station: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      chartData: null,
      chartOptions: null,
      lineData: {},
      selectedTime: {start: null, end: null},
      parsedData: null,
      rawDates: null,
      line: null,
      defaultTimespanInMS: 1000 * 60 * 60 * 24 * 7,
      aggregation: false,
      selectedChannels: [],
      sensorVariables: {
        "5TE El permittivity": "Permittivität",
        "5TE Soil temperature": "Bodentemperatur",
        "Dew Point": "Taupunkt",
        "HC Air temperature": "Lufttemperatur",
        "Precipitation": "Niederschlag",
        "Solar radiation": "Solarstrahlung",
        // "Wind speed max": "Maximale Windgeschwindigkeit",
        "Wind speed": "Windgeschwindigkeit",
        "PI54a (VWC)": "PI54a VWC",
        "5TE Water content": "5TE Wassergehalt"
      },
      sensorColors: {
        "5TE El permittivity": [255, 165, 50],
        "5TE Soil temperature": [255, 150, 150],
        "Dew Point": [75, 75, 255],
        "HC Air temperature": [50, 50, 50],
        "Precipitation": [0, 0, 255],
        "Solar radiation": [255, 200, 0],
        "Wind speed": [150, 150, 150],
        "PI54a (VWC)": [255, 0, 0],
        "5TE Water content": [0, 0, 100]
      },
      defaultChannels: new Set(["PI54a (VWC)", "Precipitation", "5TE Soil temperature"]),
      // default is line graph
      barCharts: new Set(["Precipitation"])
    }
  },
  mounted() {
    EvaAPI.fetchFieldClimateDailyData(this.station.id).then(rawData => {
      this.rawDates = rawData.data.dates;
      this.parsedData = this.parseData(rawData.data)
      this.setDefaultChannels();
    })
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectedStations"]),
    isLoading: {
      get() {
        return this.loading;
      },
      set(value) {
        this.loading = value;
      }
    },
  },
  watch: {
    selectedChannels: function () {
      this.setLineData();
      this.drawGraph();
    }
  },
  methods: {
    ...mapMutations(["removeSelectedStation"]),
    setLineData() {
      this.lineData = [];

      this.selectedTime.start = Date.now();
      this.selectedTime.end = 0;

      for (const selectedChannel of this.selectedChannels) {
        const aggregations = Object.keys(selectedChannel.aggr);
        const minIndex = aggregations.findIndex(x => x === "min");
        const maxIndex = aggregations.findIndex(x => x === "max");
        const color = this.sensorColors.hasOwnProperty(selectedChannel.name) ? this.sensorColors[selectedChannel.name] : [0, 0, 0];
        for (let aggregation of aggregations) {
          // const color = this.aggregationColors[aggregation] || "#000000";

          const label = selectedChannel.translation + " (" + aggregation + ")"
          let rgba;
          if (aggregation !== "min" && aggregation !== "max")
            rgba = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + 1 + ")";
          else
            rgba = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + .4 + ")"

          const line = {
            label: label,
            data: selectedChannel.aggr[aggregation],
            channel: selectedChannel,
            backgroundColor: rgba,
            borderColor: rgba,
            borderWidth: 1,
            pointRadius: 1,
            pointHitRadius: 5,
            fill: false,
            type: "scatter",
          };

          if (this.barCharts.has(selectedChannel.name))
            line.type = "bar";

          if (aggregation === "min" || aggregation === "max")
            line.pointRadius = 0;
          // if (minIndex > 0 && maxIndex > 0 && aggregation === "max")
          //   line.fill = minIndex;

          const startTime = selectedChannel.aggr[aggregation][0].t;
          const endTime = selectedChannel.aggr[aggregation][selectedChannel.aggr[aggregation].length - 1].t;

          this.selectedTime.start = Math.min(this.selectedTime.start, startTime);
          this.selectedTime.end = Math.max(this.selectedTime.end, endTime.Ticks);

          this.lineData.push(line);
        }
      }
    },

    drawGraph() {
      this.chartData = {
        datasets: this.lineData,
      };
      const yAxes = [];
      const existingAxes = {};
      for (const line of this.lineData) {
        if (existingAxes.hasOwnProperty(line.channel.name)) {
          line.yAxisID = existingAxes[line.channel.name];
          continue
        }
        existingAxes[line.channel.name] = yAxes.length;
        line.yAxisID = existingAxes[line.channel.name];
        yAxes.push({
          id: existingAxes[line.channel.name],
          gridLines: {
            display: existingAxes.size === 1,
            lineWidth: 1
          },
          position: yAxes.length === 2 ? "left" : "right",
          scaleLabel: {
            display: true,
            fontColor: line.backgroundColor,
            labelString: this.sensorVariables[line.channel.name] + (line.channel.unit ? " in " + line.channel.unit : ""),
          },
          ticks: {
            fontColor: line.backgroundColor,
            padding: -5,
          }
        })
      }

      this.chartOptions = {
        title: {
          display: true,
          // fontSize: 20,
          text: this.selectedChannels.length === 1 ? this.selectedChannels[0].translation : "Mehrere Variablen",
        },
        legend: {
          display: false,
        },
        animation: {
          duration: 0 // general animation time
        },
        hover: {
          mode: "nearest",
          animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0,
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              minUnit: "day",
            },
            distribution: 'linear',
            scaleLabel: {
              display: true,
              // fontSize: 20,
              labelString: 'Zeitraum'
            },
            ticks: {
              source: "auto",
              min: this.selectedTime.start,
              max: this.selectedTime.end,
              // fontSize: 16,
            }
          }],
          yAxes: yAxes
        },
        plugins: {
          zoom: {
            zoom: {
              enabled: true,
              // drag: {
              //     animationDuration: 1000
              // },
              mode: 'x',
              onZoomComplete: chart => this.chartDragComplete(chart)
            },
            pan: {
              enabled: true,
              mode: 'x',
              onPanComplete: chart => this.chartDragComplete(chart)
            }
          }
        }
      }
    },
    /**
     * If a selectedChannel or and its start/end time exists, return a valid HTML date input value, else null
     * @param timeKey should be 'startTime' or 'endTime'
     */
    getLineTimeAsString(timeKey) {
      if (this.selectedChannels.length === 0 || !this.selectedTime.start || !this.selectedTime.end) {
        let date = timeKey === "end" ? this.rawDates[this.rawDates.length - 1] : this.rawDates[0];
        // Safari cannot parse date strings of the form "2018-07-05 00:00:00", we thus need to remove the time component
        date = date.split(" ")[0];
        return new Date(date).toISOString().split('T')[0];
      }
      return new Date(this.selectedTime[timeKey]).toISOString().split('T')[0];
    },
    /**
     * Process the date input event and update the graph appropriate to the selected time range
     * @param event HTML input change event
     * @param timeKey should be 'startTime' or 'endTime'
     */
    selectTimeFromInput(event, timeKey) {
      const selectedTime = event.target.valueAsDate;
      // exit if the selected time specifies an invalid time range
      if (selectedTime === null ||
          timeKey === "start" && selectedTime >= this.selectedTime.end ||
          timeKey === "end" && selectedTime <= this.selectedTime.start) {
        return;
      }

      this.selectedTime[timeKey] = selectedTime.getTime();
      this.drawGraph();
    },

    chartDragComplete(chart) {
      this.selectedTime.start = new Date(chart.chart.scales["x-axis-0"].min);
      this.selectedTime.end = new Date(chart.chart.scales["x-axis-0"].max);
      this.drawGraph();
    },

    /**
     */
    parseData(rawData) {
      const parsedData = {}
      // for each sensor/channel
      for (const channel of Object.values(rawData.data)) {
        // if we dont care about the sensor, skip it
        if (!this.sensorVariables.hasOwnProperty(channel.name))
          continue
        // translate english to german name
        const translation = this.translateChannel(channel);
        // to group the data, we check if some date for the sensor already exists
        if (!parsedData.hasOwnProperty(translation)) {
          parsedData[translation] = {
            aggr: {},
            unit: channel.unit,
            name: channel.name,
            customName: channel.name_custom,
            translation: translation
          }
        }
        // for each aggregation append new data
        for (const aggregation of Object.keys(channel.aggr)) {
          if (!parsedData[translation].aggr.hasOwnProperty(aggregation))
            parsedData[translation].aggr[aggregation] = [];
          for (let i = 0; i < channel.aggr[aggregation].length; i++) {
            if (channel.aggr[aggregation][i]) {
              parsedData[translation].aggr[aggregation].push({
                t: new Date(rawData.dates[i]).getTime(),
                y: channel.aggr[aggregation][i]
              });
            }
          }
        }
      }
      // sort all data points by time
      for (const channel of Object.values(parsedData)) {
        for (const aggregation of Object.keys(channel.aggr))
          channel.aggr[aggregation] = channel.aggr[aggregation].sort(
              (a, b) => (a.t > b.t) ? 1 : ((b.t > a.t) ? -1 : 0)
          )
      }

      return parsedData;
    },

    translateChannel(channel) {
      let description = this.sensorVariables[channel.name];
      if (channel.name_custom)
        description += " " + channel.name_custom;
      return description;
    },

    setDefaultChannels() {
      const selectedChannels = [];
      for (const channel of Object.values(this.parsedData).reverse()) {
        if (this.defaultChannels.has(channel.name))
          selectedChannels.push(channel);
      }
      this.selectedChannels = selectedChannels;
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  max-width: none;
  /*max-height: 100%;*/
  padding: 0;
}

.liveline-dropdown /deep/ .dropdown-menu {
  max-height: 15rem;
  overflow-y: auto;
  z-index: 10000;
  width: 100%;
  padding: 0;
}

.liveline-dropdown /deep/ .dropdown-item {
  padding-left: 0.5rem;
  height: 100%;
  font-size: .75em;
}


#display-station-container {
  height: 27rem;
  display: grid;
  grid-template-rows: 1fr 20rem 1fr;
  grid-template-areas:
      "select-variable"
      "graph"
      "select-date";
}

#choose-variable-container {
  grid-area: select-variable;
}

#line-chart {
  grid-area: graph;
}

#choose-date-container {
  grid-area: select-date;
}

.remove-station-button {
  padding: 5px;
  font-size: 15px;
}

</style>
