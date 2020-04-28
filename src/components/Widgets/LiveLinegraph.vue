<template>
<div class="container">
    <span>Variable: {{ variable }}</span><br>
    <span>Szenario: {{ scenario }}</span>
</div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "LiveLinegraph",
        computed: {
            ...mapState(["scenario", "variable", "timerange"])
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
