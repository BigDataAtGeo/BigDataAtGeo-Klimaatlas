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

<style>
  .loader {
    border: 0.3em solid #f3f3f3; /* Light grey */
    border-top: 0.3em solid #3498db; /* Blue */
    border-radius: 50%;
    width: 1.45em;
    height: 1.45em;
    animation: spin 2s linear infinite;
    z-index: 9999;
    display: inline-block;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .center-loader {
    position: absolute;
    top: calc(50% - 100px);
    left: calc(50% - 100px);
    width: 200px;
    height: 200px;
    z-index: 9999;
  }

  .loader .center-loader {
    width: 200px;
    height: 200px;
  }

  .center-loader-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.5;
    z-index: 99;
    background-color: black;
  }

  .blurry {
    filter: blur(3px);
  }
</style>
