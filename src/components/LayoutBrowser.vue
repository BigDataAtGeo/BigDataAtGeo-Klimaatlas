<template>
<div id="layout">
    <div class="fixed-top" id="selection-container">
        <SettingsSelection/>
    </div>

    <div class="fixed-top" id="projectionmap-container">
        <ProjectionMap/>
    </div>
    <div class="float-right" id="widgets-container">
        <WidgetShell widgetName="Wetter (live)" class="row justify-content-end rounded p-0" >
            <LiveLinegraph/>
        </WidgetShell>
        <WidgetShell widgetName="WetterGraph" class="row justify-content-end rounded p-0">
            <Linegraph/>
        </WidgetShell>
    </div>

</div>
</template>

<script>
    import SettingsSelection from "./Widgets/SettingsSelection";
    import LiveLinegraph from "./Widgets/LiveLinegraph";
    import Linegraph from "./Widgets/Linegraph";
    import ProjectionMap from "./Widgets/ProjectionMap";
    import WidgetShell from "./Widgets/WidgetShell";

    export default {
        name: "LayoutBrowser",
        components: {SettingsSelection, LiveLinegraph, Linegraph, ProjectionMap, WidgetShell}
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
        display:flex;
        justify-content:center;
        flex-direction: column;
        max-width: 20vw;
    }
    #widgets-container .row {
        z-index: 2;
        margin-bottom: 1vh;
        justify-content: right;
        margin-right: 1vh ;
    }
</style>
