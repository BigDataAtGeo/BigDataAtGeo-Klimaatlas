<script>
    import {Line} from 'vue-chartjs'

    export default {
        extends: Line,
        props: {
            chartData: {
                type: Object,
                default: null
            },
            options: {
                type: Object,
                default: null
            }
        },
        watch: {
            chartData() {
                this.renderChart(this.chartData, this.options);
            },
            chartOptions() {
                this.renderChart(this.chartData, this.options);
            },
        },
        mounted() {
            // this.chartData is created in the mixin.
            // If you want to pass options please create a local options object
            this.renderChart(this.chartData, this.options);
        },
    }
</script>

