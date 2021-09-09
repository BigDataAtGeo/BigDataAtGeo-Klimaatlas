<script>
import {Line} from 'vue-chartjs'

export default {
  /**
   * This widget extends the chartjs line chart
   * It is used to display single line charts, and updates itself, if either the data or the chart options change
   */
  extends: Line,
  props: {
    chartData: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    },
    styles: {
      type: Object,
      default: null
    }
  },
  watch: {
    chartData() {
      this.renderChart(this.chartData, this.options, this.styles);
    },
    chartOptions() {
      this.renderChart(this.chartData, this.options, this.styles);
    },
    style(){
      this.renderChart(this.chartData, this.options, this.styles);
    }
  },
  mounted() {
    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options, this.styles);
  },
}
</script>

