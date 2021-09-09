<template>
  <div class="container-bg" v-bind:id="widgetId">
    <div @click="hideWidget" v-if="showWidget" class="container-header text-secondary">
      <b-icon icon="caret-down-fill"></b-icon>
      {{ widgetName }}
    </div>

    <div @click="hideWidget" v-else class="container-header text-secondary">
      <b-icon icon="caret-right-fill"></b-icon>
      {{ widgetName }}
    </div>

    <div v-show="showWidget" id="widgetContent">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  /**
   * This widget wraps other widgets to hide their content on click
   */

  data: function () {
    return {
      showWidget: this.showDefault,
      widgetId: this.widgetName.replace(/\W/, "")
    }
  },
  mounted(){
    if(this.hideHandler)
        this.hideHandler(!this.showWidget);
  },
  methods: {
    hideWidget() {
      this.showWidget = !this.showWidget;
      if(this.hideHandler)
        this.hideHandler(!this.showWidget);
    }
  },

  props: {
    widgetName: {
      type: String,
      required: true,
      default: 'widgetName'
    },
    /* This Handler is e.g. used to disable fetching of LineChartData, when the Widget is hidden. */
    hideHandler: {
      type: Function,
    },
    /* This optional Prop allows to set if a widget is hiddden or shown after the Page is loaded */
    showDefault: {
      type: Boolean,
      required: false,
      default: true,
    },
  }
}
</script>

<style scoped>
.container-header {
  width: 100%;
  padding: 15px;
  cursor: pointer;
}

.container-bg {
  box-sizing: border-box;
  background-color: white;
  box-shadow: rgba(65, 69, 73, 0.3) 0px 1px 2px 0px, rgba(65, 69, 73, 0.15) 0px 3px 6px 2px;
}

@media only screen and (min-width: 768px) {
  .container-bg {
    background-color: rgba(255, 255, 255, 0.95);
    border-radius: 8px 0 0 8px;
    border-left: 8px #6c757d solid;
    margin-bottom: 10px;
  }

  .container-bg::before {
    content: "\2847";
    position: absolute;
    top: -12px;
    bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    left: -9px;
    font-size: 24px;
    color: white;
  }
}

#widgetContent {
  width: 100%;
  /* min-height: 8vh; */
  overflow: hidden;
  margin: 0;
  padding: 0px 20px 20px 20px;
}

</style>
