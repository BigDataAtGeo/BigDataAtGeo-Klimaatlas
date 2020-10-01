<template>
  <div v-if="$store.state.variable!=null">
    <h5>{{ this.variable.var }} bei Szenario {{ this.scenario }}</h5>
    <div style="text-align: center" v-if="isLoading&&!noCell">
      <div class="spinner-border text-primary loader" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div class="chart-container" style="position: relative; height:25rem" v-show="!isLoading && chartData">
      <line-chart id="line-chart"
                v-if="!isLoading && chartData"
                :chartData="chartData"
                :options="chartOptions"/>
    </div>
    
  </div>
</template>

<script>
import {mapState} from "vuex";
import axios from 'axios';
import LineChart from "./LineChart";
import * as d3 from "d3";
import {colorGenerate} from '../mixins/colorGenerate';

export default {
  name: "Linegraph",
  mixins: [colorGenerate],
  components: {LineChart},
  data() {
    return {
      chartData: null,
      chartOptions: null,
      loading: false,
      datasets: [],
      labels: [],
      selectedCellsOld: [],
      noCell: true,
      oldUri: "",
    };
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectedCells", "selectionUri"]),
    isLoading: {
      get() {
        return this.loading;
      },
      set(value) {
        this.loading = value;
      }
    },
    ids() {
      return this.$store.state.ids;
    },

  },
  watch: {
    selectionUri(val) {
      if (this.uriSplitter(this.oldUri) !== this.uriSplitter(this.selectionUri)) {
        this.chartData = null;
        this.chartOptions = null;
        this.datasets = [];
        this.labels = [];
        this.addCompleteChartdata(this.selectedCells);
        this.oldUri = this.selectionUri;
      }
    },
    selectedCells: {
      deep:true,
      handler(val){
        this.loadChartdata(val);
      }
    }
    
  },
  methods: {
    uriSplitter(value) {
      var uriSplit = value.split('/');
      if (uriSplit.length < 2) return " ";
      return uriSplit[0] + uriSplit[1];
    },
    loadChartdata(val) {
      if (val.length > 0) {
        this.isLoading = true;
        var id = val[val.length - 1].properties.id;
        var added = true;
        var index = 0;
        this.noCell = false;
        for (var i = 0; i < this.selectedCellsOld.length; i++) {
          if (this.selectedCells.includes(this.selectedCellsOld[i])) ;
          else {
            added = false;
            index = i;
          }
        }
        if (added) {
          //   BDATG_ORIGIN + '/all_times/' + id + '/' + this.scenario + '/' + this.variable)
          axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${id}/${this.scenario}/${this.variable.var_id}`)
              .catch(function (error) {
                console.error('fetch data error: failed to load JSON from server', error)
                this.isLoading = false;
              }.bind(this)).then(function (response) {
            //check if cell didnt get removed while waiting for api response
            if (this.$store.state.ids.indexOf(id) != -1) {
              var dataset = {data: response.data.data.values, fill: false,};
              this.datasets.push(dataset);
              this.setColors();
              this.labels.push(response.data.data.keys);
              this.drawTimeline(response.data.data.keys);
              if (this.datasets.length == this.selectedCells.length) {
                this.isLoading = false;
              }
            }
          }.bind(this));
        } else if (this.selectedCells.length == 1) {
          this.datasets.splice(0, this.datasets.length);
          this.datasets.splice(0, this.datasets.length);

          axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${id}/${this.scenario}/${this.variable.var_id}`)
              .catch(function (error) {
                console.error('fetch data error: failed to load JSON from server', error)
                this.isLoading = false;
              }.bind(this)).then(function (response) {
            //check if cell didnt get removed while waiting for api response
            if (this.$store.state.ids.indexOf(id) != -1) {
              var dataset = {data: response.data.data.values, fill: false,};
              this.datasets.push(dataset);
              this.setColors();
              this.labels.push(response.data.data.keys);
              this.drawTimeline(response.data.data.keys);
              if (this.datasets.length == this.selectedCells.length) {
                this.isLoading = false;
              }
            }
          }.bind(this));
        } else {
          this.datasets.splice(index, 1);
          this.labels.splice(index, 1);
          this.setColors();
          this.drawTimeline(this.labels[0]);
          if (this.datasets.length == this.selectedCells.length) {
            this.isLoading = false;
          }
        }
        this.selectedCellsOld = Array.from(this.selectedCells);
      } else {
        this.datasets = [];
        this.selectedCellsOld = [];
        this.isLoading = true;
        this.noCell = true;
      }
    },
    addCompleteChartdata(allCells) {
      if (allCells.length != 0) {
        this.isLoading = true;
        this.noCell = false;
        for (var i = 0; i < allCells.length; i++) {
          var id = allCells[i].properties.id;
          axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${id}/${this.scenario}/${this.variable.var_id}`)
              .catch(function (error) {
                console.error('fetch data error: failed to load JSON from server', error)
                this.isLoading = false;
              }.bind(this)).then(function (response) {
            //check if cell didnt get removed while waiting for api response
            if (this.$store.state.ids.indexOf(id) != -1) {
              var dataset = {data: response.data.data.values, fill: false,};
              this.datasets.push(dataset);
              this.setColors();
              this.labels.push(response.data.data.keys);
              this.drawTimeline(response.data.data.keys);
              if (this.datasets.length == this.selectedCells.length) {
                this.isLoading = false;
              }
            }
          }.bind(this));
        }
        this.selectedCellsOld = Array.from(this.selectedCells);
      } else {
        this.noCell = true;
      }
    },
    setColors() {
      for (var i = 0; i < this.datasets.length; i++) {
        this.datasets[i].borderColor = this.generateColor(this.ids[i], 0);
      }
    },
    drawTimeline(data) {
      this.chartData = {
        labels: data,
        datasets: Array.from(this.datasets),
      };
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
              callback: (value, index, values)=>{
                        return value + ' '; //+ this.variable.unit;
                    }
            }
          }]
        },
        tooltips: {
          callbacks: {
            label: (tooltipItem) => {
              const value = (Math.round(tooltipItem.yLabel * 100) / 100).toLocaleString("de-DE");
              return value+' '+ this.variable.unit;
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 0;
}

#line-chart {
  width: 100%;
  height: 100%;
  }
</style>
