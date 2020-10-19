import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectionUri: null,
    ids: [],
    selectedCells: [],
    selectedSensors: [],
    polygons: [],
    colors: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    addSelectedSensor(state, data) {
        if (data.replace) {
            state.selectedSensors = [data.sensor]
        } else {
            for (let x of state.selectedSensors)
                if (x.id === data.sensor.id)
                    return;
            state.selectedSensors.push(data.sensor);
        }
    },
    removeSelectedSensor(state, sensor) {
        state.selectedSensors = state.selectedSensors.filter(x => x.id !== sensor.id);
    },
    setSelectedCell(state, cellFeature) {
        //remove all multiple selected cells
        if (state.selectedCells.length === 1 && state.selectedCells[0] === cellFeature.updatedCell) {
            state.selectedCells.splice(0, 1);
            state.polygons.splice(0, 1);
            state.ids.splice(0, 1);
            state.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        } else {
            state.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            state.polygons.length = 0;
            state.selectedCells.length = 0;
            state.ids.length = 0;
            state.ids.push(cellFeature.updatedCell.properties.id);
            state.polygons.push(cellFeature.polygon);
            state.selectedCells.push(cellFeature.updatedCell);
        }
    },
    addSelectedCell(state, cellFeature) {
        //check if array already contains cell
        var cell = cellFeature.updatedCell;
        var polygon = cellFeature.polygon;
        if (state.selectedCells.indexOf(cell) !== -1) {
            //if cell was already selected remove form list
            this.commit("removeSelectedCell",cellFeature.updatedCell)
        } else {
            //selectedCell gets added
            state.ids.push(cellFeature.updatedCell.properties.id)
            state.selectedCells.push(cell);
            state.polygons.push(polygon);
        }
    },
    removeSelectedCell(state, cell) {
        var index = state.selectedCells.indexOf(cell);
        state.ids.splice(index, 1);
        state.selectedCells.splice(index, 1);
        state.polygons.splice(index, 1);
        var cellID = cell.properties.id;
        while (state.colors[cellID % 10] !== cell.properties.id && cellID - 11 !== cell.properties.id) {
            cellID++;
        }
        state.colors[cellID % 10] = 0;
    },
    resetCells() {
        this.state.ids = [];
        this.state.selectedCells = [];
        this.state.selectedSensors = [];
        this.state.polygons = [];
        this.state.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
    if (!state.scenario || !state.variable || !state.timerange)
        return;
    state.selectionUri = `${state.scenario}/${state.variable.var_id}/${state.timerange}`;
}

export default createStore();
