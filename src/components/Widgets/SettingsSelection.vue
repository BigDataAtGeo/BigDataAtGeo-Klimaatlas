<template>
  <form class="form-inline settings-container" v-if="variable!=null">
    <div class="form-row">
      <!-- Logo -->
      <div class="col-auto element">
        <a href="https://bigdata-at-geo.eu/">
          <img src="assets/BDAGlogo.svg" alt="BigData@Geo Logo" height="60px">
        </a>
      </div>

      <!-- EU-Logo -->
      <div class="col-auto element">
        <a href="https://ec.europa.eu">
           <img src="assets/EFRE-Foerderhinweis.svg" alt="EFRE Förderungshinweis" height="50px">
        </a>
      </div>

      <!-- Variable Input -->
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

      <!-- Scenario Input -->
      <div class="col-auto form-group element">
        <label for="select-scenario" class="h6">Szenario:</label>
        <select id="select-scenario" class="custom-select" @change="setScenario"
                :disabled="index.scenarios === null" :value="scenario">
          <option v-for="scenarioOption in index.scenarios"
                  :key="scenarioOption"
                  :selected="scenario && scenario === scenarioOption"
          >{{ scenarioOption }}
          </option>
        </select>
      </div>

      <!-- Timerange Input -->
      <div class="col-auto form-group element">
        <label for="select-timerange" class="h6">Zeitspanne:</label>
        <label class="small">{{ minRange }}</label>
        <b-form-input id="select-timerange" @input="liveSlider" type="range" @change="setTimerange"
                      :value="timerangeValue" min="0" :max="index.timeranges ? index.timeranges.length - 1 : 0" step="1"
                      :disabled="index.variables === null"></b-form-input>
        <label class="small">{{ maxRange }}</label>
      </div>

      <!-- Currently selected Timerange -->
      <div class="col-auto form-group element">
        <label for="selected-timerange" class="h6">Aktuell:</label>
        <span id="selected-timerange">{{ selectedTimerange ? selectedTimerange.replace("-", "&#8211;") : "" }}</span>
      </div>

      <!-- Menu Dropdown -->
      <div class="col-auto form-group element">
        <b-icon icon="search" class="mr-2 cursor-pointer size-rem-1-25" v-b-modal.search-location></b-icon>
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
          <b-dropdown-item v-b-modal.modal-copyright>
            <b-icon icon="info-circle-fill"></b-icon>
            Copyright-Hinweise
          </b-dropdown-item>
          <b-dropdown-item href="https://github.com/BigDataAtGeo/BigDataAtGeo-Klimaatlas" target="_blank">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-git" viewBox="0 0 16 16">
              <path d="M15.698 7.287 8.712.302a1.03 1.03 0 0 0-1.457 0l-1.45 1.45 1.84 1.84a1.223 1.223 0 0 1 1.55 1.56l1.773 1.774a1.224 1.224 0 0 1 1.267 2.025 1.226 1.226 0 0 1-2.002-1.334L8.58 5.963v4.353a1.226 1.226 0 1 1-1.008-.036V5.887a1.226 1.226 0 0 1-.666-1.608L5.093 2.465l-4.79 4.79a1.03 1.03 0 0 0 0 1.457l6.986 6.986a1.03 1.03 0 0 0 1.457 0l6.953-6.953a1.031 1.031 0 0 0 0-1.457"/>
            </svg>  
            Source Code
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item v-on:click="shareConfiguration">
            <b-icon icon="reply-fill"></b-icon>
            Einstellungen teilen
          </b-dropdown-item>
          <b-dropdown-item v-b-modal.modal-feedback>
            <b-icon icon="envelope-fill"></b-icon>
            Kontakt
          </b-dropdown-item>
          <b-dropdown-divider></b-dropdown-divider>
          <b-dropdown-item variant="danger" v-on:click="resetSettings">
            <b-icon icon="gear"></b-icon>
            Einstellungen und ausgewählte Zellen zurücksetzen
          </b-dropdown-item>
        </b-dropdown>
      </div>

      <!-- Datengrundlage Modal -->
      <b-modal id="m3" :title="'Datengrundlage'" size="xl" :hide-footer="true">
        <Datengrundlage/>
      </b-modal>

      <!-- Copyright Modal -->
      <b-modal id="modal-copyright" :title="'Copyright Hinweis'" size="xl" :hide-footer="true">
        <copyright-notice/>
      </b-modal>

      <!-- Feedback Modal -->
      <b-modal id="modal-feedback" :title="'Kontakt'" size="xl" :hide-footer="true" :hide-header="false">
        <Kontaktformular/>
      </b-modal>

      <!-- Share State Modal -->
      <b-modal id="share-configuration" :title="'Konfiguration teilen'" size="s" :hide-footer="true" centered>
        <input type="text" class="form-control" placeholder="Config-URL" :value="shareConfig">
        <div class="alert alert-success text-center" role="alert">
          Im Clipboard gespeichert
        </div>
      </b-modal>

      <!-- Search for Location Modal -->
      <b-modal id="search-location" :title="'Ort suchen'" size="s" :hide-footer="true">
        <div class="input-group mb-3">
          <input type="text" class="form-control" placeholder="Adresse, Koordinaten, ..."
                 @input="searchLocationTimeout ? null : searchLocation()" v-model="searchLocationInput">
          <div class="input-group-append">
            <button class="btn alert-secondary" type="button">
              <b-icon icon="search" class="cursor-pointer size-rem-1-25" v-b-modal.search-location></b-icon>
            </button>
          </div>
        </div>
        <div v-if="searchLocationError" class="alert alert-danger" role="alert">
          Aufgrund eines Fehlers konnten keine Orte gefunden werden.
        </div>
        <div v-else>
          <div class="list-group">
            <button v-for="searchResult of searchLocationResults" type="button"
                    class="list-group-item list-group-item-action"
                    @click="selectSearchLocationResult(searchResult)">
              {{ searchResult.display_name }}
            </button>
          </div>
        </div>
      </b-modal>
    </div>
  </form>
</template>

<script>
/**
 * This widget is used for most of the used input, e. g. to selected variable, scenario, or timerange
 * also actions like resetting the state, searching for locations on the map...
 */

import {mapState, mapMutations} from 'vuex';
import axios from 'axios';
import {colorGenerate} from '../mixins/colorGenerate';
import Datengrundlage from "./Datengrundlage";
import Kontaktformular from './Kontaktformular.vue';
import CopyrightNotice from './CopyrightNotice.vue';

export default {
  name: 'SettingsSelection',
  mixins: [colorGenerate],
  components: {Datengrundlage, Kontaktformular, CopyrightNotice},
  data() {
    return {
  
        selectedTimerange: null,
      index: {
        scenarios: null,
        variables: null,
        timeranges: null,
      },
      timerangeValue: null,
      shareConfig: "",
      searchLocationInput: null,
      searchLocationResults: [],
      searchLocationError: false,
      searchLocationTimeout: false,
    }
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange"]),

    /**
     * Get the beginning of the oldest available time range as string, i. e. start of the data
     */
    minRange: function () {
      if (this.index.timeranges === null)
        return 0;
      var value = this.index.timeranges[0].toString();
      return value.slice(0, 4);
    },

    /**
     * Get the end of the highest available time range as string, i. e. end of the data
     */
    maxRange: function () {
      if (this.index.timeranges === null)
        return 0;
      var value = this.index.timeranges[this.index.timeranges.length - 1];
      return value.slice(-4);
    },
  },

  methods: {
    ...mapMutations(["setViewBoundingBox"]),
    setScenario(e) {
      this.$store.commit("setScenario", e.target.value)
    },

    setVariable(e) {
      const variable = this.index.variables.find(variable => variable.var_id === e.target.value);
      this.$store.commit("setVariable", variable);
    },

    // called when Timerange-Slider is released
    setTimerange(value) {
      this.selectedTimerange = this.index.timeranges[value];
      this.$store.commit("setTimerange", this.selectedTimerange)
    },

    //used for updating displayed timerange while using the timerange slider
    liveSlider(value) {
      this.timerangeValue = value;
      this.selectedTimerange = this.index.timeranges[value];
    },

    //sets the starting value of the timerange slider to the right point
    valueStart() {
      if (this.timerange) {
        let index = parseInt(this.timerange.substring(0, 4));
        index -= 1970;
        return index;
      }
      return new Date().getYear() - 70;
    },

    /**
     * Serialize the current vuex store state to a string and show it the modal
     */
    shareConfiguration() {
      this.shareConfig = location.href + "#state=" + encodeURI(JSON.stringify(this.$store.state));
      navigator.clipboard.writeText(this.shareConfig);
      this.$bvModal.show("share-configuration");
    },

    /**
     * First confirm this action, then reset all settings
     */
    resetSettings: function () {
      const choice = confirm("Alle Einstellungen und ausgewählte Zellen werden zurückgesetzt. Sind Sie wirklich sicher, dass Sie die Plattform zurücksetzen wollen?");
      if (choice) {
        //resetting all the settings and celected cells
        const year = new Date().getYear() - 70;
        this.$store.commit("clearSelection");
        this.$store.commit("setScenario", this.index.scenarios[0]);
        this.$store.commit("setVariable", this.index.variables[0]);
        this.selectedTimerange = this.index.timeranges[year];
        this.timerangeValue = year;
        this.$store.commit("setTimerange", this.index.timeranges[year]);
      }
    },

    /**
     * Search for geolocations with Openstreetmap
     * Also sets searchTimeout to respect the usage limits of the api, during which this method should not be called again
     * If the value of searchLocationInput changed after the timeout, this method calls itself again
     */
    searchLocation() {
      const currentInput = this.searchLocationInput;
      // clear results for empty input strings
      if (!currentInput) {
        this.searchLocationResults = [];
        return;
      }

      // disable vue input event handler to limit api searches and hide error message
      this.searchLocationTimeout = true;
      this.searchLocationError = false;

      // set *viewbox* to prefer results in this area and restrict to *countrycodes*
      axios.get("https://nominatim.openstreetmap.org/search?q=" + currentInput + "&format=json&countrycodes=de&viewbox=8.8339,49.463,10.9364,50.5529")
          .catch(error => {
            console.error(error);
            this.showSearchLocationError = true;
          }).then(result => {
            this.searchLocationResults = result.data;
          }
      )

      // Set this timeout to disable the vue input event handler due to api restrictions
      setTimeout(() => {
        this.searchLocationTimeout = false;
        if (this.searchLocationInput !== currentInput) {
          this.searchLocation();
        }
      }, 1200);
    },

    /**
     * Parse the boundingbox of an OSM-Object to leaflet format and save it in the vuex store
     * Also close the search location input modal
     * @param searchResult Openstreatmap Object
     */
    selectSearchLocationResult(searchResult) {
      const coords = searchResult.boundingbox;
      const boundingBox = [
        [parseFloat(coords[0]), parseFloat(coords[2])],
        [parseFloat(coords[1]), parseFloat(coords[3])],
      ];
      this.$bvModal.hide("search-location");
      this.setViewBoundingBox(boundingBox);
    },
  },

  /**
   * Load available settings from remote,
   * Then, if there is nothing currently selected, set some default settings
   */
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
  background-color: rgba(255, 255, 255, 1);
  border-radius: 0 0 8px 8px;
  box-shadow: rgba(65, 69, 73, 0.3) 0px 1px 2px 0px, rgba(65, 69, 73, 0.15) 0px 3px 6px 2px;
  padding: 5px 10px;
}

.settings-container .form-row {
  flex-direction: row;
  align-items: center;
}

@media only screen and (max-width: 768px) {
  .settings-container .form-row > div:nth-child(1) {
    order: 0;
  }

  .settings-container .form-row > div:nth-child(2) {
    order: 2;
    flex: 1 0 100%;
    margin-bottom: 10px;
  }

  .settings-container .form-row > div:nth-child(3) {
    order: 3;
    flex: 1 0 100%;
    margin-bottom: 10px;
  }

  .settings-container .form-row > div:nth-child(4) {
    order: 4;
    flex: 1 0 100%;
    margin-bottom: 10px;
  }

  .settings-container .form-row > div:nth-child(5) {
    order: 5;
    flex: 1 0 100%;
  }

  .settings-container .form-row > div:nth-child(6) {
    order: 1;
  }
}

.element {
  padding: 0px 10px !important;
}

#select-timerange {
  width: auto;
  min-width: 200px;
  flex-grow: 1;
}

#selected-timerange {
  width: 6em;
}

.cursor-pointer {
  cursor: pointer;
}

.size-rem-1-25 {
  width: 1.25rem;
  height: 1.25rem;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

label {
  padding: 0px 5px;
  margin-bottom: 0;
}

a {
  text-decoration: underline;
  color: gray;
  font-size: large;
}


</style>
