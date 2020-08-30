<template>
  <div id="content" class="pb-2">
    <h5>{{ this.variable.var }} </h5>
    <span v-html="this.variable.description"></span>
  </div>
</template>

<script>
export default {
  name: "variableInfo",
  props: {
    variable: {
      type: Object,
      required: true
    }
  }
}
</script>

<style scoped>
#content {
  max-height: 40vh;
  overflow-y: auto;
}

div >>> td {
  min-width: 5vw;
  padding: 5px;
}
</style>