import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectionUri: null,
    selectedCells: [],
    selectedSensors: [],
    viewBoundingBox: null,
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
    setViewBoundingBox(state, viewBoundBox) {
        state.viewBoundingBox = viewBoundBox;
    },
    setSelectedSensor(state, sensor) {
        state.selectedSensors = [sensor]
    },
    addSelectedSensor(state, sensor) {
        // check if sensor is already added
        for (let x of state.selectedSensors)
            if (x.id === data.sensor.id)
                return;
        state.selectedSensors.push(sensor);
    },
    removeSelectedSensor(state, sensor) {
        state.selectedSensors = state.selectedSensors.filter(x => x.id !== sensor.id);
    },
    setSelectedCell(state, cell) {
        state.selectedCells = [cell];
    },
    addSelectedCell(state, cell) {
        // check if cell is already added
        for (let x of state.selectedCells)
            if (x.id === cell.id)
                return;
        state.selectedCells.push(cell)
    },
    removeSelectedCell(state, cell) {
        state.selectedCells = state.selectedCells.filter(x => x.id !== cell.id)
    },
    resetCells() {
        this.state.selectedCells = [];
        this.state.selectedSensors = [];
        localStorage.removeItem("bigdata@geo-store");
    }
}

/**
 * Create new VuexStore instance
 * Parse url for shared state or else try to load state from local storage
 * @returns {*} VuexStore
 */
const createStore = () => {
    // check url for shared state
    let preState;
    let uri = window.location.hash.substring(1);
    if (uri.startsWith("state=")) {
        preState = decodeURI(uri.substring(6))
        window.location.href = "#";
    } else { // try to load local storage else
        preState = localStorage.getItem("bigdata@geo-store");
    }

    // if something exists, initialize store with previous values
    if (preState) {
        const parsedState = JSON.parse(preState);
        for (const key in parsedState) {
            if (state.hasOwnProperty(key)) {
                state[key] = parsedState[key];
            } else {
                console.error("vuex state does not have property '" + key + "'");
            }
        }
    }

    const store = new Vuex.Store({
        state,
        mutations,
        actions: {},
        modules: {},
    });
    // write store changes to local storage
    store.subscribe((mutation, state) => {
        localStorage.setItem("bigdata@geo-store", JSON.stringify(state));
    });
    return store;
};

const updateSelectionUri = (state) => {
    if (!state.scenario || !state.variable || !state.timerange) {
        state.selectionUri = null;
        return;
    }
    state.selectionUri = `${state.scenario}/${state.variable.var_id}/${state.timerange}`;
}

export default createStore();
