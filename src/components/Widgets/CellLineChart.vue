<template>
  <div v-if="variable!=null">
    <h5>{{ variable.var }} bei Szenario {{ scenario }}</h5>
    <div style="text-align: center" v-if="isLoading">
      <div class="spinner-border text-primary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="chart-container" style="position: relative; height:25rem" v-show="!isLoading">
      <line-chart id="line-chart"
                  v-if="chartData"
                  :chartData="chartData"
                  :options="chartOptions"/>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import axios from 'axios';
import LineChart from "./LineChart";
import 'chartjs-plugin-zoom';
import {colorGenerate} from '../mixins/colorGenerate';

export default {
  /**
   * This is used to display historical data of the currently selected variable for multiple selected cells on the map
   */

  name: "VariableLineChart",
  mixins: [colorGenerate],
  components: {LineChart},
  data() {
    return {
      chartData: null,
      chartOptions: null,
      loading: false,
      labels: [],
      datasets: []
    };
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectedCells", "selectionUri"]),

    // isLoading is used to display the spinning wheel indicator, it must be a computed property
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
    // Chartdata gets updated when SelectionURI changes i.e. when "Variable" is changed
    selectionUri(oldValue, newValue) {
      this.datasets = [];
      this.loadChartData();
    },

    //Chartdata gets updated if a cell gets removed or added
    selectedCells(oldValue, newValue) {
      this.loadChartData()
    }
  },
  mounted() {
    //when created and a Cell was saved in the localstorage ChartData gets updated
    if (this.selectedCells.length > 0 && this.selectionUri)
      this.loadChartData();
  },
  methods: {
    /**
     * First remove datasets of cells which are no longer in selectedCells
     * Then load new datasets for newly selected cells
     */
    loadChartData() {
      this.isLoading = true;
      // remove datasets of old cells
      this.datasets = this.datasets.filter(dataset => this.selectedCells.find(cell => cell.id === dataset.id))

      // load potential new datasets
      const promises = [];
      for (const cell of this.selectedCells) {
        // if we cannot find data for the cell in our local datasets, load it from remote
        if (!this.datasets.find(dataset => dataset.id === cell.id)) {
          promises.push(axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${cell.id}/${this.scenario}/${this.variable.var_id}`)
              .catch(function (error) {
                console.error('fetch data error: failed to load JSON from server', error)
              }).then((response) => {
                // if this is the first dataset to load, we set the chart ticks to its labels (all datasets have the same labels)
                if (this.labels.length === 0)
                  this.labels = response.data.data.keys;
                return {
                  data: response.data.data.values,
                  borderColor: cell.color,
                  fill: false,
                  id: cell.id,
                };
              }));
        }
      }
      // wait for all datasets to load / promises to resolve, then redraw the graph once
      Promise.all(promises).then(datasets => {
        for (const dataset of datasets) {
          this.datasets.push(dataset);
        }
        this.drawTimeline();
        this.isLoading = false;
      });
    },

    drawTimeline() {
      this.chartOptions = {
        title: {
          display: true,
          fontSize: 20,
          // text: `${this.variable.var} bei Szenario ${this.scenario} (Koordinaten: ${this.selectedCells[0].latlng.lat.toFixed(2)}/${this.selectedCells[0].latlng.lng.toFixed(2)})`
          // text: `${this.variable.var} bei Szenario ${this.scenario}`
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            gridLines: {
              lineWidth: 2,
            },
            scaleLabel: {
              display: true,
              fontSize: 20,
              labelString: 'Zeitraum'
            }, ticks: {
              fontSize: 16,
            }
          }],
          yAxes: [{
            gridLines: {
              lineWidth: 2,
            },
            scaleLabel: {
              display: true,
              labelString: this.variable.var + ' [in ' + this.variable.unit + ']',
              fontSize: 14
            },
            ticks: {
              suggestedMin: this.variable.min,
              suggestedMax: this.variable.max,
              fontSize: 16,
              callback: (value, index, values) => {
                //ticks get rounded to enable smooth y-axis zoom
                if (Math.floor(value) === value) {
                  return value + ' ';
                }
              }
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem) => {
              const value = (Math.round(tooltipItem.yLabel * 100) / 100).toLocaleString("de-DE");
              return value + ' ' + this.variable.unit;
            }
          }
        },
        plugins: {
          zoom: {
            zoom: {
              enabled: true,
              sensitivity: 0.2,
              mode: 'x',
            },
            pan: {
              enabled: true,
              mode: 'x',
            }
          }
        }
      }
      this.chartData = {
        labels: this.labels,
        datasets: this.datasets,
      }
    }
  }
}
</script>
