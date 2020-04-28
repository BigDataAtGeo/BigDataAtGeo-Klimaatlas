<template>
    <div class="container">
        <div class="row">
            <div class="col-md-4">
                <span>Variable: {{ variable }}</span><br>
                <span>Szenario: {{ scenario }}</span>
            </div>
            <div class="col-md-4">
                <label for="select-variable">Variable</label>
                <select id="select-variable" @change="setVariable">
                    <option v-for="variable in index.variables" :value="variable.var_id" :key="variable.var_id">{{ variable.description }}</option>
                </select>
            </div>
            <div class="col-md-4">
                <label for="select-scenario">Szenario</label>
                <select id="select-scenario" @change="setScenario">
                    <option v-for="scenario in index.scenarios" :value="scenario">{{ scenario }}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<script>
    import {mapState} from 'vuex';

    export default {
        name: 'SettingsSelection',
        data() {
            return {
                "index": {
                    "scenarios": {
                        "type": [Array, String]
                    },
                    "variables": {
                        "type": [Array, Object]
                    },
                    "timeranges": {
                        "type": [Array, String]
                    }
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
                this.$store.commit("setVariable", e.target.value)
            },
            setTimerange(e) {
                this.$store.commit("setTimerange", e.target.value)
            },
        },
        mounted() {
            fetch(process.env.VUE_APP_BDATA_API + "/index")
                .then(stream => stream.json())
                .then((data) => {
                    this.index = data;
                })
                .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
        }
    }
</script>

<style scoped lang="scss">
div.container {
    background-color: lightyellow;
    width: 100%;
    height: 100%;
    max-width: none;
    padding: 0;
}
select, option {
    max-width: 30vw;
}
</style>
