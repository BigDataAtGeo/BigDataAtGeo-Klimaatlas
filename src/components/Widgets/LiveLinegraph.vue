<template>
    <div class="container">
        <!--    <line-chart id="line-chart"-->
        <!--                :chartData="null"-->
        <!--                :options="null"/>-->
    </div>
</template>

<script>
    import {mapState} from "vuex";
    import 'chartjs-plugin-zoom';
    import LineChart from "./LineChart";
    // import {EvaLiveConnection} from "../../eva/eva-live-connection";
    // import {EvaAuth} from "../../eva/eva-auth";

    export default {
        name: "LiveLinegraph",
        components: {LineChart},
        data() {
            return {
                chartData: null,
                chartOptions: null,
                loading: true,
                evaLiveConnection: null,
                evaApi: null,
                evaAuth: null // new EvaAuth()
            };
        },
        computed: {
            ...mapState(["scenario", "variable", "timerange", "selectedCell"]),
            isLoading: {
                get() {
                    return this.loading;
                },
                set(value) {
                    this.loading = value;
                }
            },
        },
        mounted() {
            // new EvaLiveConnection((newData, origin) => {
            // console.log(newData, origin);
            // });
        },
        methods: {
            drawGraph(data) {
                // this.chartData = {
                //     labels: data.keys,
                //     datasets: [
                //         {
                //             data: data.values,
                //             borderColor: "black",
                //             fill: false,
                //         }
                //     ]
                // };
                this.chartOptions = {
                    title: {
                        display: true,
                        fontSize: 20,
                        // text: `${this.variable.var} bei Szenario ${this.scenario} (Koordinaten: ${this.selectedCell.latlng.lat.toFixed(2)}/${this.selectedCell.latlng.lng.toFixed(2)})`
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
                    plugins: {
                        zoom: {
                            zoom: {
                                enabled: true,
                                mode: 'x',
                            },
                            pan: {
                                enabled: true,
                                mode: 'x',
                            }
                        }
                    }
                }
            },
        }
    }
</script>

<style scoped>
    div {
        background-color: lightsalmon;
        width: 100%;
        height: 100%;
        max-width: none;
        padding: 0;
    }
</style>
