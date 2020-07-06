import Vue from 'vue'
import Vuex from 'vuex'
import { polygon } from 'leaflet'

Vue.use(Vuex)

const state = {
    scenario: null,
    variable: null,
    timerange: null,
    selectionUri: null,
    ids:[],
    selectedCells:[],
    polygons:[],
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
    setSelectedCell(state, cellFeature) {
        console.log(cellFeature);
        //remove all multiple selected cells
        if(state.selectedCells.length==1&&state.selectedCells[0]==cellFeature.updatedCell){
            state.selectedCells.splice(0,1);
            state.polygons.splice(0,1);
            state.ids.splice(0,1);
        }else{
            state.polygons.length=0;
            state.selectedCells.length=0;
            state.ids.push(cellFeature.updatedCell.properties.id)
            state.polygons.push(cellFeature.polygon);
            state.selectedCells.push(cellFeature.updatedCell);
        }
    },
    addSelectedCell(state,cellFeature){
        //check if array already contains cell
        var cell=cellFeature.updatedCell;
        var polygon=cellFeature.polygon;
        if(state.selectedCells.indexOf(cell)!=-1) {
            //if cell was already selected remove form list
            var index=state.selectedCells.indexOf(cell);
            state.ids.splice(index,1);
            state.selectedCells.splice(index,1);
            state.polygons.splice(index,1);
        }else{
            //selectedCell gets added
            state.ids.push(cellFeature.updatedCell.properties.id)
            state.selectedCells.push(cell);
            state.polygons.push(polygon);
        }
    },
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
