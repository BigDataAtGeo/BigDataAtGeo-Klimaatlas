<template>
<div id="layout">
    <div class="fixed-top" id="selection-container">
        <SettingsSelection/>
    </div>

    <div class="fixed-top" id="projectionmap-container">
        <ProjectionMap/>
    </div>

    <div class="float-right" id="widgets-container">
        <div class="row">
            <LiveLinegraph/>
        </div>
        <div class="row">
            <Linegraph/>
        </div>
    </div>

</div>
</template>

<script>
    import SettingsSelection from "./Widgets/SettingsSelection";
    import LiveLinegraph from "./Widgets/LiveLinegraph";
    import Linegraph from "./Widgets/Linegraph";
    import ProjectionMap from "./Widgets/ProjectionMap";

    export default {
        name: "LayoutBrowser",
        components: {SettingsSelection, LiveLinegraph, Linegraph, ProjectionMap}
    }
</script>

<style>
body {
    margin: 0;
    padding: 0;
    overflow: hidden;
}
</style>

<style scoped>
    #layout {
        width: 100vw;
        height: 100vh;
        max-width: none;
    }

    #selection-container {
        z-index: 2;
        margin-top: 5px;
        margin-left: auto;
        margin-right: auto;
        width: 80vw;
        height: auto;
    }
    #projectionmap-container {
        z-index: 1;
        width: 100vw;
        height: 100vh;
    }
    #widgets-container {
        height: 100vh;
        display: flex;
        justify-content: center;
        flex-direction: column;
    }
    #widgets-container .row {
        z-index: 2;
        width: 20vw;
        height: 35vh;
    }
</style>
