<template>
  <div id="content" class="pb-2">
    <h5>{{ this.headline }} </h5>
    <span v-html="this.text"></span>
  </div>
</template>

<script>
/**
 * This widget is used to display a headline and associated text, i. e. variable name and its description
 */
export default {
  name: "InformationText",
  props: {
    headline: {
      required: true
    },
    text: {
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
