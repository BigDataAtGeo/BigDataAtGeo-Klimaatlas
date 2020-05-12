<template>
<div class="container">
    <span>Variable: {{ variable ? variable.var_id : "" }}</span><br>
    <span>Szenario: {{ scenario }}</span><br>
    <span>Timerange: {{ timerange }}</span><br>
    <span>Selected Cell: {{ selectedCell }}</span>
</div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "LiveLinegraph",
        computed: {
            ...mapState(["scenario", "variable", "timerange", "selectedCell"])
        },
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
