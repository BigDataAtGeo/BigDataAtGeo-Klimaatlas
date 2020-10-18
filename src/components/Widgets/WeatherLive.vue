<template>
    <div class="weather-container" v-if="typeof weather.main != 'undefined'">
        <div class="city">
            <h4>
                <b-icon icon="square-fill" :style="{color: generateColor(selectedCells[CellIndex].properties.id,0)}"></b-icon>
                {{weather.name}}
                <small class="text-muted">({{weather.coord.lat.toLocaleString("de-DE")}}N {{weather.coord.lon.toLocaleString("de-DE")}}O)</small>
                <b-icon icon="x" class="cursor-pointer" @click="removeSelectedCell"></b-icon>
            </h4>
        </div>
        <!-- <div class="coordinates">
            <h5>Koordinaten</h5>
            <p class="text-muted" style="margin-left:10px;">{{weather.coord.lon.toFixed(2)}} / {{weather.coord.lat.toFixed(2)}}</p>
        </div> -->
        <div class="weather">
            <h5 class="mb-0">Aktuell</h5>
            <div class="weather-icon">
                <img class="crop" :src="this.weatherIconURL">
            </div>
            <span class="weather-description text-muted">{{weather.weather[0].description}}</span>
        </div>
        <div class="temperature">
            <h5>Temperatur</h5>
            <span class="text-muted">
                {{weather.main.temp}} <small>°C</small>
            </span><br>
            <small class="text-muted">Minimum: {{weather.main.temp_min}} <small class="text-muted">°C</small></small><br>
            <small class="text-muted">Maximum: {{weather.main.temp_max}} <small class="text-muted">°C</small></small>
        </div>
        <div class="humidity">
            <h5>Luftfeuchtigkeit</h5>
            <span class="text-muted">
                {{weather.main.humidity}}
                <small class="text-muted">%</small>
            </span>
        </div>
        <div class="pressure">
            <h5>Luftdruck</h5>
            <span class="text-muted">
                {{weather.main.pressure}}
                <small class="text-muted">hPa</small>
            </span>
        </div>
</div>
</template>

<script>
    import {mapState} from 'vuex';
    import axios from 'axios';
    import {colorGenerate} from '../mixins/colorGenerate';

    export default {
        name: 'WeatherLive',
        data() {
            return {
                weather: {},
            }
        },
        mixins: [colorGenerate],
        props: {
            CellIndex:{
                required:true,
                type:Number,
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
            setWeather(response) {
                this.weather = response;
            },
            removeSelectedCell() {
                if (this.selectedCells.length < this.cellIndex)
                  return
                const selectedCell = this.selectedCells[this.CellIndex];
                this.$store.commit("removeSelectedCell", selectedCell);
            },
            loadWeather() {
                if (this.CellIndex>=0) {
                    axios.get('https://api.openweathermap.org/data/2.5/weather?lat=' + this.selectedCells[this.CellIndex].latlng.lat + '&lon=' +
                        this.selectedCells[this.CellIndex].latlng.lng + '&units=metric&lang=de&appid=e1281e3f9e6ce6ea4db955a47f9f2fca&lang=de')
                        .then(response => this.weather = response.data)
                        .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
                } else {
                    axios.get('https://api.openweathermap.org/data/2.5/weather?zip=97074,de&units=metric&lang=de&appid=e1281e3f9e6ce6ea4db955a47f9f2fca&lang=de')
                        .then(response => this.weather = response.data)
                        .catch((error) => console.error("fetch data error: failed to load JSON from server", error));
                }
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
        width:100%;
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
