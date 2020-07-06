<template>
    <div class="container d-flex justify-content-center">
        <div class="align-self-center" v-if="isLoading&&!noCell">
            <div class="spinner-border text-primary loader" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
        <line-chart id="line-chart"
                    v-if="!isLoading && chartData"
                    :chartData="chartData"
                    :options="chartOptions"/>
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import axios from 'axios';
    import LineChart from "./LineChart";
    import * as d3 from "d3";
    import { colorGenerate } from '../mixins/colorGenerate';
    export default {
        name: "Linegraph",
        mixins:[colorGenerate],
        components: {LineChart},
        data() {
            return {
                chartData: null,
                chartOptions: null,
                loading: false,
                datasets:[],
                labels:[],
                selectedCellsOld:[],
                noCell:true,
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
            ids(){
                return this.$store.state.ids; 
            },
        },
        watch: {
            selectionUri(val) {
                this.chartData = null;
                this.chartOptions = null;
            },
            selectedCells(val) {   
            if(val.length>0){
                    this.isLoading = true;
                    var added=true;
                    var index=0;
                    this.noCell=false;
                    for (var i=0; i<this.selectedCellsOld.length;i++){
                        if(this.selectedCells.includes(this.selectedCellsOld[i]));
                        else{
                            added=false;
                        }
                    }
                    if(added){
                        //   BDATG_ORIGIN + '/all_times/' + id + '/' + this.scenario + '/' + this.variable)
                        axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${val[val.length-1].properties.id}/${this.scenario}/${this.variable.var_id}`)
                            .catch(function (error) {
                                console.error('fetch data error: failed to load JSON from server', error)
                                this.isLoading = false;
                            }.bind(this)).then(function (response) {
                                var dataset={data: response.data.data.values, fill: false,};
                                this.datasets.push(dataset);
                                this.setColors();      
                                this.labels.push(response.data.data.keys);
                                this.drawTimeline(response.data.data.keys);
                                this.isLoading = false;
                        }.bind(this));
                    }else if(this.selectedCells.length==1){
                        this.datasets.splice(0,this.datasets.length);
                        this.datasets.splice(0,this.datasets.length);
                        axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${val[val.length-1].properties.id}/${this.scenario}/${this.variable.var_id}`)
                            .catch(function (error) {
                                console.error('fetch data error: failed to load JSON from server', error)
                                this.isLoading = false;
                            }.bind(this)).then(function (response) {
                                var dataset={data: response.data.data.values, fill: false,};
                                this.datasets.push(dataset);
                                this.setColors();  
                                this.labels.push(response.data.data.keys);
                                this.drawTimeline(response.data.data.keys);
                                this.isLoading = false;
                        }.bind(this));
                    }
                    else{
                        this.datasets.splice(index,1);
                        this.labels.splice(index,1);
                        this.drawTimeline(this.labels[val.length-1]);
                        this.isLoading=false;
                    }
                    this.selectedCellsOld=Array.from(this.selectedCells);
                }else{
                    this.datasets=[];
                    this.selectedCellsOld=[];
                    this.isLoading = true;
                    this.noCell=true;
                }
            }
        },
        methods: {
            setColors(){
                for(var i=0;i<this.datasets.length;i++){
                    this.datasets[i].borderColor=this.generateColor(this.ids[i]);
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
                        text: `${this.variable.var} bei Szenario ${this.scenario} (Koordinaten: ${this.selectedCells[0].latlng.lat.toFixed(2)}/${this.selectedCells[0].latlng.lng.toFixed(2)})`
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
                                labelString: this.variable.var,
                                fontSize: 20,
                            },
                            ticks: {
                                suggestedMin: this.variable.min,
                                suggestedMax: this.variable.max,
                                fontSize: 16,
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return tooltipItem.yLabel;
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
        max-width: 100%;
        max-height: 100%;
        padding: 0;
    }

    #line-chart {
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.75);
    }
</style>
