<template>
<div class="container">
    <span>Variable: {{ variable }}</span><br>
    <span>Szenario: {{ scenario }}</span>
</div>
</template>

<script>
    import {mapState} from "vuex";

    export default {
        name: "WidgetMap",
        computed: {
            ...mapState(["scenario", "variable", "timerange"])
        },
    }
</script>

<style scoped>
div.container {
    background-color: lightblue;
    width: 100%;
    height: 100%;
    max-width: none;
    padding: 0;
}
</style>
