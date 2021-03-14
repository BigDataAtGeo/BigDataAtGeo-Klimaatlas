<template>
  <div class="weather-container" v-if="typeof weather.main != 'undefined'">
    <!-- City Data -->
    <div class="city">
      <h4>
        <b-icon icon="square-fill" :style="{color: cell.color}"></b-icon>
        {{ weather.name }}
        <small class="text-muted">({{ weather.coord.lat.toLocaleString("de-DE") }}&deg;N
          {{ weather.coord.lon.toLocaleString("de-DE") }}&deg;O)</small>
        <b-icon icon="x" class="cursor-pointer" @click="removeSelectedCell(cell)"></b-icon>
      </h4>
    </div>

    <!-- Weather Data -->
    <div class="weather">
      <h5 class="mb-0">Aktuell</h5>
      <div class="weather-icon">
        <img class="crop" :src="this.weatherIconURL">
      </div>
      <span class="weather-description text-muted">{{ weather.weather[0].description }}</span>
    </div>

    <!-- Temperature Data -->
    <div class="temperature">
      <h5>Temperatur</h5>
      <span class="text-muted">
                {{ weather.main.temp }} <small>°C</small>
            </span><br>
      <small class="text-muted">Minimum: {{ weather.main.temp_min }} <small class="text-muted">°C</small></small><br>
      <small class="text-muted">Maximum: {{ weather.main.temp_max }} <small class="text-muted">°C</small></small>
    </div>

    <!-- Humidity Data -->
    <div class="humidity">
      <h5>Luftfeuchtigkeit</h5>
      <span class="text-muted">
                {{ weather.main.humidity }}
                <small class="text-muted">%</small>
            </span>
    </div>

    <!-- Pressure Data -->
    <div class="pressure">
      <h5>Luftdruck</h5>
      <span class="text-muted">
                {{ weather.main.pressure }}
                <small class="text-muted">hPa</small>
            </span>
    </div>
  </div>
</template>

<script>
import {mapMutations, mapState} from 'vuex';
import axios from 'axios';
import {colorGenerate} from '../mixins/colorGenerate';

export default {
  /**
   * This widget uses openweathermap, to display weather information for an individual cell
   */

  name: 'WeatherLive',
  data() {
    return {
      weather: {},
    }
  },
  mixins: [colorGenerate],
  props: {
    cell: {
      required: true,
      type: Object,
    },
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectedCells"]),
    weatherIconURL: function () {
      return 'http://openweathermap.org/img/wn/' + this.weather.weather[0].icon + '@2x.png'
    }
  },
  watch: {
    selectedCells: function () {
      this.loadWeather();
    }
  },
  mounted() {
    this.loadWeather();
  },
  methods: {
    ...mapMutations(["removeSelectedCell"]),
    setWeather(response) {
      this.weather = response;
    },
    loadWeather() {
        axios.get('https://api.openweathermap.org/data/2.5/weather?lat=' + this.cell.latlng.lat + '&lon=' +
            this.cell.latlng.lng + '&units=metric&lang=de&appid=e1281e3f9e6ce6ea4db955a47f9f2fca&lang=de')
            .then(response => this.weather = response.data)
            .catch(error => console.error("fetch data error: failed to load JSON from server", error));
    }
  }
}
</script>

<style scoped>
.weather-container {
  display: grid;
  grid-template-areas:
            "city city"
            "temperature weather"
            "humidity pressure";
  column-gap: 3px;
  row-gap: 10px;
  height: 100%;
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}

.city {
  grid-area: city;
}

.weather {
  grid-area: weather;
}

.temp-title {
  grid-area: temp-title;
}

.temperature {
  grid-area: temperature;
}

.temp-min-max {
  grid-area: temp-min-max;
}

.humidity {
  grid-area: humidity;
}

.pressure {
  grid-area: pressure;
}

.crop {
  margin-top: 0;
  min-width: 2rem;
  max-width: 5rem;

}
</style>
