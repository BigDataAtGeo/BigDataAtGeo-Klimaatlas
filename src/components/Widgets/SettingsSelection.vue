<template>
  <div class="container">
    <div class="row align-items-center rounded" v-if="this.index.variables!=null&&this.index.scenarios!=null">
      <div class="col-md-2 col-element">
        <b-dropdown id="selection-menu-dropdown" class="m-md-2">
          <template v-slot:button-content>
            <b-icon icon="list"></b-icon>
          </template>
          <b-dropdown-item v-b-modal.modal-2 v-if="variable!=null">
            <b-icon icon="gear-fill"></b-icon> Einstellungen
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.m3>
            <b-icon icon="info-circle-fill"></b-icon> Datengrundlage
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.modal-welcome>
            <b-icon icon="question-circle-fill"></b-icon> Steuerung
          </b-dropdown-item>
        </b-dropdown>
        <img src="assets/BDAGlogo.svg" alt="BigData@Geo Logo" width="50px" height="60px">
      </div>
      <div class="col-md-1 col-element">
        <label for="select-variable" class="h5">Variable</label>
      </div>
      <div class="col-md-2 form-group col-element">
        <select id="select-variable" class="form-control form-control-sm" @change="setVariable"
                :disabled="index.variables === null" :value="$store.state.variable.var_id">
          <option v-for="variable in index.variables" :value="variable.var_id" :key="variable.var_id">{{
              variable.var
            }}
          </option>
        </select>
      </div>
      <div class="col-md-1 d-flex justify-content-end col-element">
        <label for="select-scenario" class="h5">Szenario</label>
      </div>
      <div class="col-md-1 form-group col-element">
        <select id="select-scenario" class="form-control form-control-sm" @change="setScenario"
                :disabled="index.scenarios === null" :value="$store.state.scenario">
          <option v-for="scenario in index.scenarios" :key="scenario">{{ scenario }}</option>
        </select>
      </div>
      <div class="col-md-1 d-flex justify-content-end col-element">
        <label for="select-timerange" class="h5">Zeitspanne</label>
      </div>
      <div class="col-md-3 form-group col-element">
        <input id="select-timerange" type="range" @input="liveSlider" class="form-control-range form-control-sm"
               @change="setTimerange" :value="timerangeValue" min="0"
               :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1" :disabled="index.variables === null">
        <br>
        <div id="timerangeLabels">
          <label class="float-left">{{ minRange }}</label>
          <label class="float-right">{{ maxRange }}</label>
        </div>
      </div>
      <div class="col-md-1 col-element">
        <div>
          <span class="h6">Aktuell:</span>
          <br>
          <span class="h6">{{ selectedTimerange }}</span>
        </div>
      </div>
    </div>
    <b-modal id="modal-2" :title="'Einstellungen'" size="xl" :hide-footer="true" :hide-header="true">
      <div class="row pb-5 d-flex justify-content-center">
        <div class="text-center">
          <h2>Einstellungen</h2>
        </div>
      </div>
      <div class="row pb-5 align-items-center">
        <div class="col-md-1 d-flex justify-content-end col-element"></div>
        <div class="col-md-2 col-element">
          <label for="modal-select-variable" class="h5">Variable</label>
        </div>
        <div class="col-md-4 form-group col-element">
          <select id="modal-select-variable" class="form-control form-control-sm col-element" @change="setVariable"
                  :disabled="index.variables === null" :value="$store.state.variable.var_id">
            <option v-for="variable in index.variables" :value="variable.var_id" :key="variable.var_id">{{
                variable.var
              }}
            </option>
          </select>
        </div>
        <div class="col-md-1 d-flex justify-content-end col-element"></div>
        <div class="col-md-1 d-flex justify-content-end col-element">
          <label for="modal-select-scenario" class="h5">Szenario</label>
        </div>
        <div class="col-md-1 form-group col-element">
          <select id="modal-select-scenario" class="form-control form-control-sm" @change="setScenario"
                  :disabled="index.scenarios === null" :value="$store.state.scenario">
            <option v-for="scenario in index.scenarios" :key="scenario">{{ scenario }}</option>
          </select>
        </div>
      </div>
      <div class="row align-items-center justify-content-center pb-5">
        <div class="col-md-1 d-flex justify-content-end col-element">
          <label for="modal-select-timerange" class="h5">Zeitspanne</label>
        </div>
        <div class="col-md-4 form-group col-element">
          <input id="modal-select-timerange" type="range" @input="liveSlider" class="form-control-range form-control-sm"
                 @change="setTimerange" :value="timerangeValue" min="0"
                 :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1"
                 :disabled="index.variables === null">
          <br>
          <div id="modal-timerangeLabels">
            <label class="float-left">{{ minRange }}</label>
            <label class="float-right">{{ maxRange }}</label>
          </div>
        </div>
        <div class="col-md-2 col-element">
          <div class="pl-3 float-left"><span class="h6">Aktuell: </span><br>
            <span class="h6">{{ selectedTimerange }}</span></div>
        </div>
      </div>
      <div class="row align-items-center ">
        <div class="col-md-12 text-center"><h4 class="pb-3">Ausgewählte Zellen:</h4></div>
        <div v-for="(cell,index) in this.selectedCells" :key="index" class="col-md-6 text-center pt-0 pb-0">
          <h5>
            <b-icon icon="square-fill" :style="{color: generateColor(cell.properties.id,0)}"></b-icon>
            {{ index }}: {{ cell.latlng.lat | round }} , {{ cell.latlng.lng | round }}
          </h5>
        </div>
      </div>
      <div class="row pt-2 flex-row-reverse">
        <div class="col-md-2">
          <b-button class="btn" @click="$bvModal.hide('modal-2')">Schließen</b-button>
        </div>
        <div class="col-md-4">
          <b-button class="btn" v-on:click="resetSettings">Einstellungen und Zellen zurücksetzten</b-button>
        </div>
        <div class="col-md-2"><a href="https://www.uni-wuerzburg.de/sonstiges/impressum/">Impressum</a></div>
        <div class="col-md-2"><a href="https://www.uni-wuerzburg.de/sonstiges/datenschutz/">Datenschutz</a></div>
      </div>
    </b-modal>
    <b-modal id="m3" :title="'Datengrundlage'" size="xl" :hide-footer="true">
      <Datengrundlage/>
    </b-modal>
  </div>
</template>

<script>
import {mapState} from 'vuex';
import {mapMutations} from 'vuex'
import axios from 'axios';
import {colorGenerate} from '../mixins/colorGenerate';
import Datengrundlage from "./Datengrundlage";

export default {
  name: 'SettingsSelection',
  mixins: [colorGenerate],
  components: {Datengrundlage},
  data() {
    return {
      "selectedTimerange": null,
      "index": {
        "scenarios": null,
        "variables": null,
        "timeranges": null,
      },
      "timerangeValue": null,
    }
  },
  created: function () {
    this.timerangeValue = this.valueStart();
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange"]),

    minRange: function () {
      var value = this.index.timeranges[0].toString();
      return value.slice(0, 4);
    },
    maxRange: function () {
      var value = this.index.timeranges[this.index.timeranges.length - 1];
      return value.slice(-4);
    },
    variableName: function () {
      return this.$store.state.variable.var;
    },
    selectedCells() {
      return this.$store.state.selectedCells;
    },
  },
  methods: { // https://vuex.vuejs.org/guide/forms.html
    // ...mapMutations(["setVariable"])
    setScenario(e) {
      this.$store.commit("setScenario", e.target.value)
      localStorage.scenario = e.target.value;
    },
    setVariable(e) {
      const variable = this.index.variables.find(variable => variable.var_id === e.target.value);
      this.$store.commit("setVariable", variable);
      localStorage.setItem('variables', JSON.stringify(variable));
    },
    setTimerange(e) {
      const timerange = this.index.timeranges[e.target.value];
      this.selectedTimerange = timerange;
      this.$store.commit("setTimerange", timerange)
      localStorage.timerange = timerange;
    },
    liveSlider(e) {
      this.timerangeValue = e.target.value;
      const timerange = this.index.timeranges[e.target.value];
      this.selectedTimerange = timerange;
    },
    valueStart() {
      if (localStorage.timerange) {
        var x = localStorage.timerange.substring(0, 4);
        var x = x - 1970;
        return x;
      }
      var year = new Date().getYear()
      var year = year - 70;
      return year;
    },
    resetSettings: function () {
      //resetting all the settings and celected cells
      var year = new Date().getYear()
      var year = year - 70;
      this.$store.commit("resetCells");
      this.$store.commit("setScenario", this.index.scenarios[0]);
      this.$store.commit("setVariable", this.index.variables[0]);
      this.selectedTimerange = this.index.timeranges[year];
      this.$store.commit("setTimerange", this.index.timeranges[year]);


    }

  },
  mounted() {
    axios.get(process.env.VUE_APP_BDATA_API + "/index")
        .then((response) => {
          //setting timerange to actual year
          var year = new Date().getYear()
          var year = year - 70;
          this.index = response.data;
          if (localStorage.scenario) {
            this.$store.commit("setScenario", localStorage.scenario);
          } else this.$store.commit("setScenario", this.index.scenarios[0]);
          if (localStorage.variables) {
            this.$store.commit("setVariable", JSON.parse(localStorage.getItem('variables')));
          } else this.$store.commit("setVariable", this.index.variables[0]);
          if (localStorage.timerange) {
            this.$store.commit("setTimerange", localStorage.timerange);
            this.selectedTimerange = localStorage.timerange;
          } else {
            this.selectedTimerange = this.index.timeranges[year];
            this.$store.commit("setTimerange", this.index.timeranges[year]);
          }
        })
        .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
  },
  filters: {
    round: function (value) {
      return value.toFixed(2);
    }
  }
}
</script>

<style scoped>
.col-element {
  padding: 5px;
}

#timerangeLabels {
  padding-top: -10%;
  margin-top: -8%;
}

div.container {
  background-color: rgba(255, 255, 255, 0.75);
  width: 100%;
  height: 100%;
  max-width: none;
  padding: 0;
}

#selection-menu-dropdown {
  padding-left: 25px;
}

.form-group {
  margin: 0;
}

label {
  margin-top: auto;
  margin-bottom: auto;
}

a {
  text-decoration: underline;
  color: gray;
  font-size: large;
}


</style>
