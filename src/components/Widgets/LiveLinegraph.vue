<template>
  <div class="container">
    <line-chart id="line-chart"
                v-if="chartData"
                :chartData="chartData"
                :options="chartOptions"/>
    <button v-for="sensor of this.selectedSensors" class="btn remove-sensor-button" :key="sensor.id"
            v-on:click="removeSelectedSensor(sensor)"
            :style="{backgroundColor: sensor.color, color: 'white'}">
      {{ sensor.id }} <span class="h5">&times;</span>
    </button>
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
  data() {
    return {
      chartData: null,
      chartOptions: null,
      lineData: {},
      lines: [],
      defaultTimespan: 60 * 24 * 7,
      startTime: null,
      endTime: null,
      aggregation: false,
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
    selectedSensors: function () {
      this.lines = []
      for (let sensor of this.selectedSensors) {
        this.lines.push({
          "feedId": "fieldclimate",
          "sourceId": sensor.id,
          "channel": "Precipitation",
          "component": "value",
          "id": "fieldclimate:" + sensor.id + ":Precipitation:value",
          "color": sensor.color
        })
      }
      this.loadLineDate();
    }
  },
  mounted() {
    this.endTime = Date.now();
    this.startTime = new Date(this.endTime - this.defaultTimespan * 60 * 1000);
  },
  methods: {
    ...mapMutations(["removeSelectedSensor"]),
    loadLineDate() {
      const promises = [];
      this.lines.forEach(line => {
        promises.push(EvaAPI.fetchDataByTimespan(line.feedId, line.sourceId, line.channel, this.startTime, this.endTime, !this.aggregation)
            .then(data => {
              this.lineData[line.id] = this.parseLineData(data.data.data, line.id)
            })
        );
      });
      Promise.all(promises).then(() => this.drawGraph());
    },
    drawGraph() {
      const datasets = []
      for (let line of this.lines) {
        datasets.push(this.lineData[line.id])
      }
      this.chartData = {
        datasets: datasets,
      };
      this.chartOptions = {
        title: {
          display: true,
          // fontSize: 20,
          text: "Niederschlag (mm)"
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
              display: true,
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
      if (startTime < this.startTime || endTime > this.endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.loadLineDate(startTime, endTime);
      }
    },
    parseLineData(data, lineId) {
      // Find the config that corresponds to lineId in order to know
      // which channel/component we are looking for in the data
      var lineConfig = this.lines.find(line => line.id === lineId);

      const result = {
        label: lineId,
        data: [],
        // backgroundColor: lineConfig.color,
        borderColor: lineConfig.color,
        borderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 5,
      };

      // Extract relevant data and timestamp
      for (let element of data) {
        result.data.push({
          t: new Date(element.timestamp),
          // convert to number with '+'
          y: +element.channels[lineConfig.channel][lineConfig.component]
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
