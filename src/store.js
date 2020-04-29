import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectedCells: [],
    selectionUri: null,
}

const mutations = {
    setScenario(state, scenario) {
        state.scenario = scenario;
        updateSelectionUri(state)
    },
    setVariable(state, variable) {
        state.variable = variable;
        updateSelectionUri(state)
    },
    setTimerange(state, timerange) {
        state.timerange = timerange;
        updateSelectionUri(state)
    },
    addCell(state, cell) {
        state.selectedCells.push(cell)
    }
}

const updateSelectionUri = (state) => {
    if (!state.scenario || !state.variable || !state.timerange)
        return;
    state.selectionUri = `${state.scenario}/${state.variable.var_id}/${state.timerange}`;
}

export default new Vuex.Store({
    state,
    mutations,
    actions: {},
    modules: {}
})
