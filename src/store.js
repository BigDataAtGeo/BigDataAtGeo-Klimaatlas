import Vue from 'vue'
import Vuex from 'vuex'
import {polygon} from 'leaflet'

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
        if (state.selectedCells.length == 1 && state.selectedCells[0] == cellFeature.updatedCell) {
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
        localStorage.polygons = JSON.stringify(state.polygons);
        localStorage.selectedCells = JSON.stringify(state.selectedCells);
    },
    addSelectedCell(state, cellFeature) {
        //check if array already contains cell
        var cell = cellFeature.updatedCell;
        var polygon = cellFeature.polygon;
        if (state.selectedCells.indexOf(cell) != -1) {
            //if cell was already selected remove form list
            var index = state.selectedCells.indexOf(cell);
            state.ids.splice(index, 1);
            state.selectedCells.splice(index, 1);
            state.polygons.splice(index, 1);
            var cellID = cellFeature.updatedCell.properties.id;
            while (state.colors[cellID % 10] != cellFeature.updatedCell.properties.id && cellID - 11 != cellFeature.updatedCell.properties.id) {
                cellID++;
            }
            state.colors[cellID % 10] = 0;
        } else {
            //selectedCell gets added
            state.ids.push(cellFeature.updatedCell.properties.id)
            state.selectedCells.push(cell);
            state.polygons.push(polygon);
        }
        localStorage.polygons = JSON.stringify(state.polygons);
        localStorage.selectedCells = JSON.stringify(state.selectedCells);
    },
    resetCells() {
        this.state.ids.length = 0;
        this.state.selectedCells.length = 0;
        this.state.selectedSensors = [];
        this.state.polygons.length = 0;
        this.state.colors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        localStorage.clear();
        localStorage.setItem("welcome-message", true);
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
    modules: {},
})
