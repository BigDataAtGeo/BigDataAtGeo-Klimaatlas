import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectionUri: null,
    selectedCells: [],
    selectedStations: [],
    viewBoundingBox: null,
}

const mutations = {
    // Most widgets only listen to selection uri,
    // since we only care, if all three - scenario, variable, and timerange, are set
    setScenario(state, scenario) {
        state.scenario = scenario;
        updateSelectionUri(state);
    },
    setVariable(state, variable) {
        state.variable = variable;
        updateSelectionUri(state);
    },
    setTimerange(state, timerange) {
        state.timerange = timerange;
        updateSelectionUri(state);
    },


    // view bounding box is used to set the view of the leaflet projection map
    setViewBoundingBox(state, viewBoundBox) {
        state.viewBoundingBox = viewBoundBox;
    },

    // since we want to select multiple stations,
    // setStation selects one single station, and addStation adds a station to the selection
    setSelectedStation(state, station) {
        state.selectedStations = [station]
    },
    addSelectedStation(state, station) {
        // check if station is already added
        for (let x of state.selectedStations)
            if (x.id === station.id)
                return;
        state.selectedStations.push(station);
    },
    // remove one single station from the selection
    removeSelectedStation(state, station) {
        state.selectedStations = state.selectedStations.filter(x => x.id !== station.id);
    },

    // analogous to stations, we want to select multiple cells,
    // setCell selects one single cell, and addCell adds cells to the selection
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
    // remove on single cell from the selection
    removeSelectedCell(state, cell) {
        state.selectedCells = state.selectedCells.filter(x => x.id !== cell.id)
    },

    // clear selected cells and stations from the projection map
    clearSelection() {
        this.state.selectedCells = [];
        this.state.selectedStations = [];
    }
}

/**
 * Create new VuexStore instance
 * Parse url for shared state or else try to load state from local storage
 * @returns {*} VuexStore
 */
const createStore = () => {
    // check url for shared state, i. e. url contains ?state=...
    let stateInitializer;
    let uri = window.location.hash.substring(1);
    if (uri.startsWith("state=")) {
        stateInitializer = decodeURI(uri.substring(6))
        window.location.href = "#";
    } else { // try to load local storage else, it may be null
        stateInitializer = localStorage.getItem("bigdata@geo-store");
    }

    // if something exists (i. e. not null), initialize store with previous values
    if (stateInitializer) {
        const parsedState = JSON.parse(stateInitializer);
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

/**
 * Create an URI from scenario, variable, and timerange
 * @param state vuex store state
 */
const updateSelectionUri = (state) => {
    if (!state.scenario || !state.variable || !state.timerange) {
        state.selectionUri = null;
        return;
    }
    state.selectionUri = `${state.scenario}/${state.variable.var_id}/${state.timerange}`;
}

export default createStore();
