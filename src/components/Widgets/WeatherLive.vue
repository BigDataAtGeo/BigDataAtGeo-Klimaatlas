<template>
    <div>
        <b-container v-if="typeof weather.main != 'undefined'">
            <b-row style="margin-bottom:-2vh">
                <b-col>
                    <h4>{{weather.name}} </h4>
                    <p class="text-muted" style="margin-left:10px;">{{weather.coord.lon}} / {{weather.coord.lat}}</p>
                </b-col>
                <b-col>
                    <h6>{{weather.weather[0].description}}</h6>
                    <img class="crop" :src=this.weatherIconURL alt="">
                </b-col>
            </b-row>
            <b-row>
                <b-col>
                    <h5>Temperatur</h5>
                    <h5>
                        {{weather.main.temp}}
                        <small class="text-muted">°C</small>
                    </h5>
                    <p class="text-muted">{{weather.main.temp_min}} - {{weather.main.temp_max}}</p>
                </b-col>
                <b-col>
                    <h6>Luftfeuchtigkeit : </h6>
                    <h5>
                        {{weather.main.humidity}}
                        <small class="text-muted">%</small>
                    </h5>
                    <h6>Luftdruck : </h6>
                    <h5>
                        {{weather.main.pressure}}
                        <small class="text-muted">hPa</small>
                    </h5>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import {mapState} from 'vuex';
    import axios from 'axios';

    export default {
        name: 'WeatherLive',
        data() {
            return {
                weather: {},
            }
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
            loadWeather() {
                if (this.selectedCells.length>0) {
                    axios.get('https://api.openweathermap.org/data/2.5/weather?lat=' + this.selectedCells[0].latlng.lat + '&lon=' +
                        this.selectedCells[0].latlng.lng + '&units=metric&lang=de&appid=e1281e3f9e6ce6ea4db955a47f9f2fca&lang=de')
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
    .crop {
        margin-top: -3vh;
    }
</style>
