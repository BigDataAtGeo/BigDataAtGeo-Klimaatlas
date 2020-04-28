import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: "",
    variable: "",
    timerange: ""
}

const mutations = {
    setScenario(state, scenario) { state.scenario = scenario },
    setVariable(state, variable) { console.log(variable); state.variable = variable },
    setTimerange(state, timerange) { state.timerange = timerange },
}

export default new Vuex.Store({
    state,
    mutations,
    actions: {},
    modules: {}
})
