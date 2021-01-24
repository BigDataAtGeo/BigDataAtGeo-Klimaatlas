<template>
  <div class="container">
    <div id="display-sensor-container">
      <div class="form-group d-flex flex-row align-items-center" id="choose-variable-container">
        <div class="flex">
          <button class="btn remove-sensor-button"
                  v-on:click="removeSelectedSensor(sensor)"
                  :style="{backgroundColor: sensor.color, color: 'white'}">
            {{ sensor.name }} <span
              class="h5">&times;</span>
          </button>
        </div>
        <div v-if="this.rawData" class="flex-grow-1">
          <select class="form-control form-control-sm" id="variable-select" v-model="selectedChannel">
            <option disabled selected value="">Variable auswählen</option>
            <option v-for="channel of relevantChannels()" :key="channel.id" v-bind:value="channel">
              {{ channel.translation }}
            </option>
          </select>
        </div>
      </div>
      <line-chart id="line-chart"
                  v-if="chartData"
                  :chartData="chartData"
                  :options="chartOptions"/>
      <div v-if="!rawData" class="flex-row text-center align-self-center justify-content-center">
        <div class="spinner-border text-primary loader" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
      <div id="choose-date-container" v-if="rawData">
        <div class="input-group input-group-md mb-3">
          <div class="input-group-prepend">
            <span class="input-group-text">Von:</span>
          </div>
          <input type="date" class="form-control"
                 :value="getLineTimeAsString('startTime')"
                 @input="selectTimeFromInput($event, 'startTime')">
          <div class="input-group-prepend">
            <span class="input-group-text">Bis:</span>
          </div>
          <input type="date" class="form-control"
                 :value="getLineTimeAsString('endTime')"
                 @input="selectTimeFromInput($event, 'endTime')">
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
    sensor: {
      required: true,
      type: Object,
    },
  },
  data() {
    return {
      chartData: null,
      chartOptions: null,
      lineTimes: {},
      lineData: {},
      rawData: null,
      line: null,
      defaultTimespanInMS: 1000 * 60 * 60 * 24 * 7,
      aggregation: false,
      selectedChannel: null,
      sensorVariables: {
        "5TE El permittivity": "Permittivität",
        "5TE Soil temperature": "Bodentemperatur",
        "Dew Point": "Taupunkt",
        "HC Air temperature": "Lufttemperatur",
        "Precipitation": "Niederschlag",
        "Solar radiation": "Solarstrahlung",
        "Wind speed max": "Maximale Windgeschwindigkeit",
        "Wind speed": "Windgeschwindigkeit"
      },
      aggregationColors: {
        "sum": "#000000",
        "avg": "#000000",
        "min": "#26BCE1",
        "max": "#FF821D",
      }
    }
  },
  mounted() {
    EvaAPI.fetchFieldClimateDailyData(this.sensor.id).then(rawData => {
      this.rawData = rawData.data;
      for (let i = 0; i < this.rawData.dates.length; i++) {
        this.rawData.dates[i] = new Date(this.rawData.dates[i])
      }
    })
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectedSensors"]),
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
    selectedChannel: function () {
      // this.setLine();
      this.setLineData();
      this.drawGraph();
    }
  },
  methods: {
    ...mapMutations(["removeSelectedSensor"]),
    setLine() {
      if (!this.lineTimes.hasOwnProperty(this.selectedChannel.name)) {
        // let endTime = Date.now();
        // if (this.selectedChannel.lastUpdated)
        //   endTime = this.selectedChannel.lastUpdated;
        this.lineTimes[this.selectedChannel.name] = {
          startTime: new Date(Date.now() - this.defaultTimespanInMS),
          endTime: new Date(),
        };
      }
      this.line = {
        "feedId": "fieldclimate",
        "sourceId": this.sensor.id,
        "channel": this.selectedChannel.name,
        "component": "value",
        "id": "fieldclimate:" + this.sensor.id + ":" + this.selectedChannel.name + ":value",
        "color": this.sensor.color
      };
    },
    setLineData() {
      this.lineData[this.selectedChannel.id] = [];
      for (let aggregation of Object.keys(this.rawData.data[this.selectedChannel.id].aggr)) {
        const color = this.aggregationColors[aggregation] || "#000000";
        const line = {
          label: aggregation,
          data: [],
          backgroundColor: color,
          borderColor: color,
          borderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 5,
          fill: false,
        };

        let startTime, endTime;
        // Extract relevant data and timestamp
        for (let i = 0; i < this.rawData.dates.length; i++) {
          const value = this.rawData.data[this.selectedChannel.id].aggr[aggregation][i];
          // set start time to the first non-null index
          if (!startTime && value)
            startTime = this.rawData.dates[i];
          // set end time iteratively to the last non-null index
          if (value)
            endTime = this.rawData.dates[i];
          // push x (which is t for time) and y value
          line.data.push({
            t: this.rawData.dates[i],
            y: this.rawData.data[this.selectedChannel.id].aggr[aggregation][i]
          })
        }
        this.lineTimes[this.selectedChannel.id] = {
          startTime: startTime,
          endTime: endTime,
        }
        this.lineData[this.selectedChannel.id].push(line);
      }
    },

    drawGraph() {
      this.chartData = {
        datasets: this.lineData[this.selectedChannel.id],
      };
      this.chartOptions = {
        title: {
          display: true,
          // fontSize: 20,
          text: this.selectedChannel.translation,
        },
        legend: {
          display: true,
        },
        animation: {
          duration: 0 // general animation time
        },
        hover: {
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
              min: this.lineTimes[this.selectedChannel.id].startTime,
              max: this.lineTimes[this.selectedChannel.id].endTime,
              // fontSize: 16,
            }
          }],
          yAxes: [{
            gridLines: {
              lineWidth: 2,
            },
            scaleLabel: {
              display: this.selectedChannel.unit !== "",
              labelString: this.selectedChannel.unit ? "In " + this.selectedChannel.unit : "",
              // fontSize: 20,
            },
            // ticks: {
            //     fontSize: 16,
            // }
          }]
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
      if (!this.selectedChannel || !this.lineTimes.hasOwnProperty(this.selectedChannel.id)) {
        const date = timeKey === "endTime" ? this.rawData.dates[this.rawData.dates.length - 1] : this.rawData.dates[0];
        return date.toISOString().split('T')[0];
      }
      return this.lineTimes[this.selectedChannel.id][timeKey].toISOString().split('T')[0];
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
          timeKey === "startTime" && selectedTime >= this.lineTimes[this.selectedChannel.id].endTime ||
          timeKey === "endTime" && selectedTime <= this.lineTimes[this.selectedChannel.id].startTime) {
        return;
      }

      this.lineTimes[this.selectedChannel.id][timeKey] = selectedTime;
      this.drawGraph();
    },

    chartDragComplete(chart) {
      this.lineTimes[this.selectedChannel.id].startTime = new Date(chart.chart.scales["x-axis-0"].min);
      this.lineTimes[this.selectedChannel.id].endTime = new Date(chart.chart.scales["x-axis-0"].max);
      this.drawGraph();
    },
    parseLineData(data, lineId) {
      // Find the config that corresponds to lineId in order to know
      // which channel/component we are looking for in the data
      // var lineConfig = this.lines.find(line => line.id === lineId);

      const result = {
        label: lineId,
        data: [],
        // backgroundColor: lineConfig.color,
        // borderColor: this.line.color,
        borderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 5,
      };

      // Extract relevant data and timestamp
      for (let element of data) {
        result.data.push({
          t: new Date(element.timestamp),
          // convert to number with '+'
          y: +element.channels[this.line.channel][this.line.component]
        })
      }

      //sort results by time
      // result.sort((a, b) => a.date.getTime() - b.date.getTime());

      return result;
    },
    /**
     * Filter all available channels of the current sensor to only return relevant ones definied by *this.sensorVariables*
     * @returns [{name, translation, index} for each relevant channel]
     */
    relevantChannels() {
      const relevantChannels = new Set();
      for (const channelName of Object.keys(this.rawData.data)) {
        const channel = this.rawData.data[channelName];
        if (this.sensorVariables.hasOwnProperty(channel.name)) {
          channel.id = channelName;
          channel.translation = this.sensorVariables[channel.name] + " (" + channel.ch + ")";
          relevantChannels.add(channel);
        }
      }
      return relevantChannels;
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

#display-sensor-container {
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

.remove-sensor-button {
  padding: 5px;
  font-size: 15px;
}
</style>
