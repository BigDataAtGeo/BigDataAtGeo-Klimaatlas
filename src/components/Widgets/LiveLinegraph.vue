<template>
  <div class="container">
    <div v-if="sensorNames.hasOwnProperty(sensor.id)" id="display-sensor-container">
      <div class="form-group d-flex flex-row align-items-center" id="choose-variable-container">
        <div class="flex">
          <button class="btn remove-sensor-button"
                  v-on:click="removeSelectedSensor(sensor)"
                  :style="{backgroundColor: sensor.color, color: 'white'}">
            {{ sensorNames.hasOwnProperty(sensor.id) ? sensorNames[sensor.id] : sensor.id }} <span
              class="h5">&times;</span>
          </button>
        </div>
        <div class="flex-grow-1">
          <select class="form-control form-control-sm" id="variable-select" v-model="selectedChannel">
            <option disabled selected value="">Variable auswählen</option>
            <option v-for="channel of relevantChannels()" :key="channel.id" v-bind:value="channel">{{
                channel.translation
              }}
            </option>
          </select>
        </div>
      </div>
      <line-chart id="line-chart"
                  v-if="chartData"
                  :chartData="chartData"
                  :options="chartOptions"/>
      <div id="choose-date-container" v-if="chartData">
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
    <div v-else>
      <h3>Unbekannte Sensor-ID '{{ sensor.id }}'</h3>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from "vuex";
import {EvaAPI} from "@/eva/eva-api";
import LineChart from "./LineChart";
import 'chartjs-plugin-zoom';

export default {
  name: "LiveLinegraph",
  components: {LineChart},
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
      line: null,
      defaultTimespanInMS: 1000 * 60 * 60 * 24 * 7,
      aggregation: false,
      selectedChannel: null,
      sensorNames: {
        "00206B4B": "Obbach",
        "000017DD": "Bürgstadt",
        "000017E0": "Herchsheim",
        "00208227": "Willmars",
        "00208200": "Uniwald",
        "00205EA1": "Oberrimbach",
      },
      sensorVariables: {
        "5TE El permittivity": "Permittivität",
        "5TE Soil temperature": "Bodentemperatur",
        "5TE Water content": "Volumetrischer Wassergehalt",
        "Dew Point": "Taupunkt",
        "HC Air temperature": "Lufttemperatur",
        "Precipitation": "Niederschlag",
        "Solar radiation": "Solarstrahlung",
        "Wind speed max": "Maximale Windgeschwindigkeit",
        "Wind speed": "Windgeschwindigkeit"
      }
    }
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
      this.setLine();
      this.loadLineDate();
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
    loadLineDate() {
      EvaAPI.fetchDataByTimespan(
          this.line.feedId,
          this.line.sourceId,
          this.line.channel,
          this.lineTimes[this.selectedChannel.name].startTime,
          this.lineTimes[this.selectedChannel.name].endTime,
          !this.aggregation)
          .then(data => {
            this.lineData[this.selectedChannel.name] = this.parseLineData(data.data.data, this.line.id)
          }).then(() => this.drawGraph());
    },
    drawGraph() {
      this.chartData = {
        datasets: [this.lineData[this.selectedChannel.name]],
      };
      this.chartOptions = {
        title: {
          display: true,
          // fontSize: 20,
          text: this.sensorVariables[this.selectedChannel.name],
        },
        legend: {
          display: false,
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
              min: new Date(this.lineTimes[this.selectedChannel.name].startTime),
              max: new Date(this.lineTimes[this.selectedChannel.name].endTime),
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
      return this.selectedChannel
          && this.lineTimes.hasOwnProperty(this.selectedChannel.name)
          && this.lineTimes[this.selectedChannel.name][timeKey].toISOString().split('T')[0];
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
          timeKey === "startTime" && selectedTime >= this.lineTimes[this.selectedChannel.name].endTime ||
          timeKey === "endTime" && selectedTime <= this.lineTimes[this.selectedChannel.name].startTime) {
        return;
      }
      // simply redraw graph if a smaller time range is selected
      if (timeKey === "startTime" && selectedTime >= this.lineTimes[this.selectedChannel.name].startTime ||
          timeKey === "endTime" && selectedTime <= this.lineTimes[this.selectedChannel.name].endTime) {
        this.lineTimes[this.selectedChannel.name][timeKey] = selectedTime;
        this.drawGraph();
      } else { // else load additional data, then redraw
        this.lineTimes[this.selectedChannel.name][timeKey] = selectedTime;
        this.loadLineDate(this.lineTimes[this.selectedChannel.name].startTime, this.lineTimes[this.selectedChannel.name].endTime);
      }
    },
    chartDragComplete(chart) {
      const startTime = new Date(chart.chart.scales["x-axis-0"].min);
      const endTime = new Date(chart.chart.scales["x-axis-0"].max);
      if (startTime < this.lineTimes[this.selectedChannel.name].startTime || endTime > this.lineTimes[this.selectedChannel.name].endTime) {
        this.lineTimes[this.selectedChannel.name].startTime = startTime;
        this.lineTimes[this.selectedChannel.name].endTime = endTime;
        this.loadLineDate(startTime, endTime);
      }
    },
    parseLineData(data, lineId) {
      // Find the config that corresponds to lineId in order to know
      // which channel/component we are looking for in the data
      // var lineConfig = this.lines.find(line => line.id === lineId);

      const result = {
        label: lineId,
        data: [],
        // backgroundColor: lineConfig.color,
        borderColor: this.line.color,
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
      const relevantChannels = []
      let index = 0;
      for (let channel of this.sensor.channels) {
        if (this.sensorVariables.hasOwnProperty(channel.name)) {
          channel.translation = this.sensorVariables[channel.name];
          relevantChannels.push(channel);
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
