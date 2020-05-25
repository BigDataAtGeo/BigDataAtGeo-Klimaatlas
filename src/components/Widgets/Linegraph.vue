<template>
    <div class="container d-flex justify-content-center">
        <div class="align-self-center" v-if="isLoading">
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

    export default {
        name: "Linegraph",
        components: {LineChart},
        data() {
            return {
                chartData: null,
                chartOptions: null,
                loading: false,
            };
        },
        computed: {
            ...mapState(["scenario", "variable", "timerange", "selectedCell", "selectionUri"]),
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
            selectionUri(val) {
                this.chartData = null;
                this.chartOptions = null;
            },
            selectedCell(val) {
                this.$forceNextTick(() => {
                    this.chartData = null;
                    this.isLoading = true;
                });
                // BDATG_ORIGIN + '/all_times/' + id + '/' + this.scenario + '/' + this.variable)
                axios.get(`${process.env.VUE_APP_BDATA_API}/all_times/${val.properties.id}/${this.scenario}/${this.variable.var_id}`)
                    .catch(function (error) {
                        console.error('fetch data error: failed to load JSON from server', error)
                        this.isLoading = false;
                    }.bind(this)).then(function (response) {
                    this.drawTimeline(response.data.data);
                    this.isLoading = false;
                }.bind(this));
            }
        },
        methods: {
            drawTimeline(data) {
                this.chartData = {
                    labels: data.keys,
                    datasets: [
                        {
                            data: data.values,
                            borderColor: "black",
                            fill: false,
                        }
                    ]
                };
                this.chartOptions = {
                    title: {
                        display: true,
                        fontSize: 20,
                        text: `${this.variable.var} bei Szenario ${this.scenario} (Koordinaten: ${this.selectedCell.latlng.lat.toFixed(2)}/${this.selectedCell.latlng.lng.toFixed(2)})`
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
