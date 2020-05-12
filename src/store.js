import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectedCell: null,
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
    setSelectedCell(state, cell) {
        state.selectedCell = cell;
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
