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
        width: 5rem !important;
        height: 5rem !important;
    }

    .blurry {
        filter: blur(3px);
    }
</style>
