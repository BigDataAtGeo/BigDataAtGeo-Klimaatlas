<template>
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-1 pr-0 pb-0 pt-0">
                <img src="..\..\assets\BDAGlogo.svg" width="60px" height="60px">
            </div>
            <div class="col-md-1">
                <label for="select-variable" class="h5">Variable</label>
            </div>
            <div class="col-md-2 form-group">
                <select id="select-variable" class="form-control form-control-sm" @change="setVariable" :disabled="index.variables === null">
                    <option v-for="variable in index.variables" :value="variable.var_id" :key="variable.var_id">{{ variable.var }}</option>
                </select>
            </div>
            <div class="col-md-1">
                <label for="select-scenario" class="h5">Szenario</label>
            </div>
            <div class="col-md-2 form-group">
                <select id="select-scenario" class="form-control form-control-sm" @change="setScenario" :disabled="index.scenarios === null" >
                    <option v-for="scenario in index.scenarios" :key="scenario">{{ scenario }}</option>
                </select>
            </div>
            <div class="col-md-1">
                <label for="select-timerange" class="h5">Timerange</label>
            </div>
            <div class="col-md-3 form-group">
                <input id="select-timerange" type="range" @input="liveSlider" class="form-control-range form-control-sm" @change="setTimerange" min="0" :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1" :disabled="index.variables === null">
            </div>
            <div class="col-md-1">
                <span>{{selectedTimerange}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import axios from 'axios';

    export default {
        name: 'SettingsSelection',
        data() {
            return {
                "selectedTimerange": null,
                "index": {
                    "scenarios": null,
                    "variables": null,
                    "timeranges": null
                }
            }
        },
        computed: {
            ...mapState(["scenario", "variable", "timerange"])
        },
        methods: { // https://vuex.vuejs.org/guide/forms.html
            // ...mapMutations(["setVariable"])
            setScenario(e) {
                this.$store.commit("setScenario", e.target.value)
            },
            setVariable(e) {
                const variable = this.index.variables.find(variable => variable.var_id === e.target.value);
                this.$store.commit("setVariable", variable)
            },
            setTimerange(e) {
                const timerange = this.index.timeranges[e.target.value];
                this.selectedTimerange = timerange;
                this.$store.commit("setTimerange", timerange)
            },
            liveSlider(e){
                const timerange = this.index.timeranges[e.target.value];
                this.selectedTimerange = timerange;
            }
        },
        mounted() {
            axios.get(process.env.VUE_APP_BDATA_API + "/index")
                .then((response) => {
                    this.index = response.data;
                    this.$store.commit("setScenario", this.index.scenarios[0]);
                    this.$store.commit("setVariable", this.index.variables[0]);
                    this.$store.commit("setTimerange", this.index.timeranges[0]);
                    this.selectedTimerange = this.index.timeranges[0];
                })
                .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
        }
    }
</script>

<style scoped lang="scss">
div.container {
    background-color: rgba(255, 255, 255, 0.75);
    width: 100%;
    height: 100%;
    max-width: none;
    padding: 0;
}
.row > div {
    padding: 10px 25px;
}
.form-group {
    margin: 0;
}
label {
    margin-top: auto;
    margin-bottom: auto;
}

</style>
