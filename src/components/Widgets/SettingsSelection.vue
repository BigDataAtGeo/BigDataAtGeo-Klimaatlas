<template>
    <div class="container">
        <div class="row align-items-center" v-if="this.index.variables!=null&&this.index.scenarios!=null">
            <div class="col-md-1 pr-0 pb-0 pt-0">
                <img src="assets/BDAGlogo.svg" width="60px" height="60px">
            </div>
            <div class="col-md-1" id="colElement">
                <label for="select-variable" class="h5">Variable</label>
                <div class="float-right">
                    <b-button v-b-modal.modal-1 class="btn btn-light p-0" v-if="this.$store.state.variable!=null"><b-icon icon="question-circle"></b-icon></b-button>
                        <b-modal id="modal-1" size="lg" :title="this.$store.state.variable.var" :hide-footer="true" >
                    <span v-html="this.$store.state.variable.description"></span>
                    </b-modal>
                </div>
            </div>
            <div class="col-md-2 form-group" id="colElement">
                <select id="select-variable" class="form-control form-control-sm" @change="setVariable" :disabled="index.variables === null">
                    <option v-for="variable in index.variables" :value="variable.var_id" :key="variable.var_id">{{ variable.var }}</option>
                </select>
            </div>
            <div class="col-md-1 d-flex justify-content-end" id="colElement">
                    <label for="select-scenario" class="h5">Szenario</label>
            </div>
            <div class="col-md-1 form-group" id="colElement">
                <select id="select-scenario" class="form-control form-control-sm" @change="setScenario" :disabled="index.scenarios === null" >
                    <option v-for="scenario in index.scenarios" :key="scenario">{{ scenario }}</option>
                </select>
            </div>
            <div class="col-md-1 d-flex justify-content-end" id="colElement">
                <label for="select-timerange" class="h5">Timerange</label>
            </div>
            <div class="col-md-4 form-group" id="colElement">
                <input id="select-timerange" type="range" @input="liveSlider" class="form-control-range form-control-sm" @change="setTimerange" :value="timerangeValue" min="0" :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1" :disabled="index.variables === null">
                <br>
                <div id="timerangeLabels">
                    <label class="float-left">{{minRange}}</label>
                    <label class="float-right">{{maxRange}}</label>
                </div>
            </div>
            <div class="col-md-1" id="colElement">
                <span class="h6">Aktuell: </span><br>
                <span class="h6">{{selectedTimerange}}</span>
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
                    "timeranges": null,
                    
                },
                "timerangeValue":null,
            }
        },
        ready: function(){
            this.timerangeValue=valueStart();
        },
        computed: {
            ...mapState(["scenario", "variable", "timerange"]),
            minRange: function(){
                var value= this.index.timeranges[0].toString();
                return value.slice(0,4);
            },
            maxRange: function(){
                var value=this.index.timeranges[this.index.timeranges.length-1];
                return value.slice(-4);
            }
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
                this.timerangeValue=e.target.value;
                const timerange = this.index.timeranges[e.target.value];
                this.selectedTimerange = timerange;
            },
            valueStart: function(){
                var year = new Date().getYear()
                var year =year-50;
                return year;
            }
        },
        mounted() {
            axios.get(process.env.VUE_APP_BDATA_API + "/index")
                .then((response) => {
                    //setting timerange to actual year
                    var year = new Date().getYear()
                    var year =year-70;
                    this.index = response.data;
                    this.$store.commit("setScenario", this.index.scenarios[0]);
                    this.$store.commit("setVariable", this.index.variables[0]);
                    this.$store.commit("setTimerange", this.index.timeranges[year]);
                    this.selectedTimerange = this.index.timeranges[year];
                })
                .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
        }
    }
</script>

<style scoped lang="scss">
#colElement{
    padding: 5px;
}
#timerangeLabels{
    padding-top:-8%;
    margin-top: -5%;
}
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
