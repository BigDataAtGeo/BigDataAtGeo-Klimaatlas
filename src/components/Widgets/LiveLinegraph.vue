<template>
  <div class="container">
    <div v-if="sensorVariables.hasOwnProperty(sensor.id)">
      <div class="form-group d-flex flex-row align-items-center">
        <div class="flex">
          <button class="btn remove-sensor-button"
                  v-on:click="removeSelectedSensor(sensor)"
                  :style="{backgroundColor: sensor.color, color: 'white'}">
            {{ sensorNames.hasOwnProperty(sensor.id) ? sensorNames[sensor.id] : sensor.id }} <span class="h5">&times;</span>
          </button>
        </div>
        <div class="flex-grow-1">
          <select class="form-control form-control-sm" id="variable-select" v-model="selectedChannel">
            <option disabled selected value="">Variable auswählen</option>
            <option v-for="(channel,index) of sensor.channels" :key="index" v-bind:value="channel">{{
                channel.name
              }}
            </option>
          </select>
        </div>
      </div>
      <line-chart id="line-chart"
                  v-if="chartData"
                  :chartData="chartData"
                  :options="chartOptions"/>
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
      defaultTimespan: 60 * 24 * 7,
      startTime: null,
      endTime: null,
      aggregation: false,
      selectedChannel: null,
      sensorNames: {
        "00206B4B": "Obbach",
        "000017E0": "Schwanberg",
        "000017DD": "Bürgstadt",
        "000017DE": "Herchsheim",
      },
      sensorVariables: {
        "00206B4B": {},
        "000017E0": {},
        "000017DD": {},
        "000017DE": {},
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
        this.lineTimes[this.selectedChannel.name] = {
          startTime: new Date(Date.now() - this.defaultTimespan * 60 * 1000),
          endTime: Date.now(),
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
          text: this.selectedChannel.name,
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

.remove-sensor-button {
  padding: 5px;
  font-size: 15px;
}
</style>
