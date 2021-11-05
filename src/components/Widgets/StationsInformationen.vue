<template>
<!-- This template is used to display the information for each station and profile -->
<!-- It uses gets the information in form of a json, and then uses v-for to display these information -->
  <div>
    <div id="settings" class="">
          <b-button class="btn remove-station-button"
                  v-on:click="removeSelectedStation(station)"
                  :style="{backgroundColor: station.color, color: 'white'}">
            {{ station.name }} <span
              class="h6" style="font-size: 1rem">&times;</span>
          </b-button>
          <b-button variant="outline-primary"  v-for="n in images_amount"  :key="n"  class="preset-button"
                  v-on:click="setIndex(n)"
                  :class="{active: index == n}">
          Profil {{n}}
          </b-button>
  </div>      

  <div id="content">
    <div class="image-div">
      <b-img-lazy
        fluid
        v-bind:src="url +'/images/' + station.id + '/' + index"
        alt="Darstellung der Bodenstruktur"
      ></b-img-lazy>
    </div>

    <div class="table-div">
      <div v-if="table_data.length != 0">
        <b-table-simple small responsive="true" striped>
          <b-thead>
            <b-tr>
              <b-th>Horizont</b-th>
              <b-th>Bodenart</b-th>
              <b-th>kf-Wert</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="item in table_data.items" :key="item.index">
              <b-td v-html="item.horizont"></b-td>
              <b-td v-html="item.bodenart"></b-td>
              <b-td v-html="item.kfWert"></b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>

        <b-table-simple small responsive="true">
          <b-thead>
            <b-tr>
              <b-th>Name</b-th>
              <b-th>Text</b-th>
            </b-tr>
          </b-thead>
          <b-tbody>
            <b-tr v-for="item in table_data.info" :key="item.index">
              <b-td v-html="item.name"></b-td>
              <b-td v-html="item.text"></b-td>
            </b-tr>
          </b-tbody>
        </b-table-simple>
      </div>
      <p v-else style="text-align: center">
        Aktuell sind leider keine Informationen zu dieser Station verfügbar!
      </p>
    </div>
  </div>

  </div>
  
</template>

<script>
import { colorGenerate } from "../mixins/colorGenerate";
import { mapState, mapMutations } from "vuex";
import { VueperSlide, VueperSlides } from "vueperslides";
import { EvaAPI } from "@/eva/eva-api";

export default {
  name: "StationsInformationen",
  components: { VueperSlides, VueperSlide },
  mixins: [colorGenerate],
  mounted() {
    this.$root.$on("profile-change", (i, station_id) => this.setIndex(i, station_id));
  },
  computed: {
    ...mapState(["selectedStations", "preset_list"]),

    table_data: function() {
      let profileString = "profile" + this.index;
      let result =  this.json_data[profileString];
      if(result == undefined)
      result = [];

      return result;
    },

    index: function(){
      return this.preset_list[this.station.id];
    }
  },

  props: {
    station: {
      required: true,
      type: Object,
    },
    index_prop: {
      type: Number,
      required: true
    }
  },

  data() {
    return {
      json_data: [],
      url: process.env.VUE_APP_EVA_API,
      images_amount: 0,
    };
  },

  methods: {
    ...mapMutations(["removeSelectedStation", "setPreset"]),
    
    getStationBulletStyle(index, active) {
      let data_colors = this.getDataColors(index);

      return {
        backgroundColor: data_colors[1],
        boxShadow:
          "box-shadow: 0 0 1px " +
          data_colors[1] +
          ", 0 0 3px " +
          data_colors[1],
        width: active ? "16px" : "9px",
        height: active ? "16px" : "9px",
      };
    },

    setIndex(index){
      let settings = {
        index: index,
        station_id: this.station.id
      }
      this.setPreset(settings)
    },
  },

  watch: {
    station: function () {
      /* If the currently active station changes, this functino fetches the information about the new station from the backend */
      EvaAPI.fetchStationInformation(this.station.id)
        .then((response) => {
          this.json_data = response.data;
          this.images_amount = this.json_data.images_amount;
        })
        .catch((error) => (this.json_data = []));
    },
  },
  created() {
    /* Fetches the Information about the station from the Backend */
    EvaAPI.fetchStationInformation(this.station.id)
      .then((response) => {
        this.json_data = response.data;
        this.images_amount = this.json_data.images_amount;
      })
      .catch((error) => (this.json_data = []));
  },
};
</script>

<style scoped>
.default-bullet {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  transition: 0.4s ease-in-out;
  box-sizing: border-box;
}

#content {
  position: relative;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  flex-direction: row;
  justify-content: center;
  flex-wrap: wrap;
  flex-basis: auto;
}

.table-div {
  flex: 1 1 23rem;
}

.image-div {
  margin-inline: 1em;
  flex: 0 1 20rem;
  width: fit-content;
  align-self: center;
}

img {
  /* height: 100%; */
}

#settings > button {
 margin-inline: 0.2rem;
 align-content: space-between;
 margin-bottom: 2px;
 margin-top: 3px;
 flex: 1 1 auto
}

#settings {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  align-items: baseline;
  margin-bottom: 0.5em;
}

.preset-button{
  padding: 5px;
  font-size: 15px;
}

.active{
  background-color: #007bff !important;
}

.remove-station-button {
  padding: 5px;
  font-size: 15px;
}
</style>