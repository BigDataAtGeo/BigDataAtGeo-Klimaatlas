<template>
  <form class="form-inline settings-container" v-if="variable!=null">
    <div class="form-row">
      <div class="col-auto element">
        <a href="https://bigdata-at-geo.eu/">
          <img src="assets/BDAGlogo.svg" alt="BigData@Geo Logo" height="60px">
        </a>
      </div>
      <div class="col-auto form-group element">
        <label for="select-variable" class="h6">Variable:</label>
        <select id="select-variable" class="custom-select" @change="setVariable"
                :disabled="index.variables === null">
          <option v-for="varOption in index.variables"
                  :value="varOption.var_id"
                  :key="varOption.var_id"
                  :selected="variable && variable.var_id === varOption.var_id">{{
              varOption.var
            }}
          </option>
        </select>
      </div>
      <div class="col-auto form-group element">
        <label for="select-scenario" class="h6">Szenario:</label>
        <select id="select-scenario" class="custom-select" @change="setScenario"
                :disabled="index.scenarios === null" :value="scenario">
          <option v-for="scenarioOption in index.scenarios"
                  :key="scenarioOption"
                  :selected="scenario && scenario === scenarioOption"
          >{{ scenarioOption }}</option>
        </select>
      </div>
      <div class="col-auto form-group element">
        <label for="select-timerange" class="h6">Zeitspanne:</label>
        <label class="small">{{ minRange }}</label>
        <b-form-input id="select-timerange" @input="liveSlider" type="range" @change="setTimerange"
                      :value="timerangeValue" min="0" :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1"
                      :disabled="index.variables === null"></b-form-input>
        <label class="small">{{ maxRange }}</label>
      </div>
      <div class="col-auto form-group element">
        <label for="selected-timerange" class="h6">Aktuell:</label>
        <span id="selected-timerange">{{ selectedTimerange ? selectedTimerange.replace("-", "&#8211;") : "" }}</span>
      </div>
      <div class="col-auto form-group element">
        <b-dropdown right variant="outline-secondary" class="m-md-2">
          <template v-slot:button-content>
            <!-- <b-icon icon="list"></b-icon> -->
            Menü
          </template>
          <b-dropdown-item v-b-modal.modal-welcome>
            <b-icon icon="question-circle-fill"></b-icon>
            Willkommensbildschirm
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.m3>
            <b-icon icon="info-circle-fill"></b-icon>
            Datengrundlage
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item href="https://www.uni-wuerzburg.de/sonstiges/impressum/">
            <b-icon icon="person-lines-fill"></b-icon>
            Impressum
          </b-dropdown-item>
          <b-dropdown-item href="https://www.uni-wuerzburg.de/sonstiges/datenschutz/">
            <b-icon icon="shield-lock-fill"></b-icon>
            Datenschutz
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item   v-on:click="shareConfiguration">
            <b-icon icon="reply-fill"></b-icon>
            Einstellungen teilen
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item variant="danger" v-on:click="resetSettings">
            <b-icon icon="gear"></b-icon>
            Einstellungen und ausgewählte Zellen zurücksetzen
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item href="https://ec.europa.eu">
            <img src="assets/EFRE-Foerderhinweis.svg" alt="EFRE Förderungshinweis" height="40px">
          </b-dropdown-item>
        </b-dropdown>
      </div>
      <b-modal id="m3" :title="'Datengrundlage'" size="xl" :hide-footer="true">
        <Datengrundlage/>
      </b-modal>
      <b-modal id="share-configuration" :title="'Konfiguration teilen'" size="s" :hide-footer="true" centered>
        <input type="text" class="form-control" placeholder="Config-URL" :value="shareConfig">
        <div class="alert alert-success text-center" role="alert">
          Im Clipboard gespeichert
        </div>
      </b-modal>
    </div>
  </form>
</template>

<script>
import {mapState} from 'vuex';
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
      shareConfig: "",
    }
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange"]),

    minRange: function () {
      if (this.index.timeranges === null)
        return 0;
      var value = this.index.timeranges[0].toString();
      return value.slice(0, 4);
    },
    maxRange: function () {
      if (this.index.timeranges === null)
        return 0;
      var value = this.index.timeranges[this.index.timeranges.length - 1];
      return value.slice(-4);
    },
    variableName: function () {
      return this.variable.var;
    },
    selectedCells() {
      return this.selectedCells;
    },
  },
  methods: { // https://vuex.vuejs.org/guide/forms.html
    // ...mapMutations(["setVariable"])
    setScenario(e) {
      this.$store.commit("setScenario", e.target.value)
    },
    setVariable(e) {
      const variable = this.index.variables.find(variable => variable.var_id === e.target.value);
      this.$store.commit("setVariable", variable);
    },
    setTimerange(value) {
      this.selectedTimerange = this.index.timeranges[value];
      this.$store.commit("setTimerange", this.selectedTimerange)
    },
    liveSlider(value) {
      this.timerangeValue = value;
      const timerange = this.index.timeranges[value];
      this.selectedTimerange = timerange;
    },
    valueStart() {
      if (this.timerange) {
        let index = parseInt(this.timerange.substring(0, 4));
        index -= 1970;
        return index;
      }
      return new Date().getYear() - 70;
    },
    shareConfiguration() {
      this.shareConfig = location.href + "#state=" + encodeURI(JSON.stringify(this.$store.state));
      navigator.clipboard.writeText(this.shareConfig);
      this.$bvModal.show("share-configuration");
    },
    resetSettings: function () {
      const choice = confirm("Alle Einstellungen und ausgewählte Zellen werden zurückgesetzt. Sind Sie wirklich sicher, dass Sie die Plattform zurücksetzen wollen?");
      if (choice) {
        //resetting all the settings and celected cells
        const year = new Date().getYear() - 70;
        this.$store.commit("resetCells");
        this.$store.commit("setScenario", this.index.scenarios[0]);
        this.$store.commit("setVariable", this.index.variables[0]);
        this.selectedTimerange = this.index.timeranges[year];
        this.timerangeValue = year;
        this.$store.commit("setTimerange", this.index.timeranges[year]);
      }
    }
  },
  mounted() {
    axios.get(process.env.VUE_APP_BDATA_API + "/index")
        .then((response) => {
          //setting timerange to actual year
          var year = (new Date()).getYear() - 70;
          this.index = response.data;
          if (!this.scenario)
            this.$store.commit("setScenario", this.index.scenarios[0]);
          if (!this.variable)
            this.$store.commit("setVariable", this.index.variables[0]);
          if (!this.timerange) {
            this.selectedTimerange = this.index.timeranges[year];
            this.$store.commit("setTimerange", this.index.timeranges[year]);
          } else {
            this.selectedTimerange = this.timerange;
          }
        })
        .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
    this.timerangeValue = this.valueStart();
  },
  filters: {
    round: function (value) {
      return value.toFixed(2);
    }
  }
}
</script>

<style scoped>
.settings-container {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 0 0 8px 8px;
  box-shadow: rgba(65, 69, 73, 0.3) 0px 1px 2px 0px, rgba(65, 69, 73, 0.15) 0px 3px 6px 2px;
  padding: 5px 10px;
  display: inline-block;
}

.element {
  padding: 0px 10px !important;
}

#select-timerange {
  width: auto;
  min-width: 200px;
}

#selected-timerange {
  width: 6em;
}

.form-group {
  display: flex;
  align-items: center;
}

label {
  padding: 0px 5px;
}

a {
  text-decoration: underline;
  color: gray;
  font-size: large;
}


</style>
