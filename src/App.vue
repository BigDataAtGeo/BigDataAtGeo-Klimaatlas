<template>
  <div id="app">
    <LayoutBrowser/>
  </div>
</template>

<script>
import LayoutBrowser from "./components/LayoutBrowser";

export default {
  name: 'App',
  components: {
    LayoutBrowser
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
