<template>
    <l-map id="leaflet" :options="mapOptions" v-bind:class="{ blurry: isLoading }">
        <l-tile-layer :url="url" :attribution="attribution"/>
        <div v-if="!loading">
            <l-rectangle v-for="feature in this.geojson.features"
                         :bounds="calculateRectangleBounds(feature.geometry.coordinates)"
                         :options="calculateRectangleStyle(feature.properties)"
                         :key="feature.properties.id">
                <l-popup v-if="variable.unit">{{feature.properties.value}} {{variable.unit}}</l-popup>
                <l-popup v-else>{{feature.properties.value}}</l-popup>
            </l-rectangle>
        </div>
        <l-control v-if="legend" :position="'bottomleft'" class="custom-control-watermark">
            <div>
                <span v-if="this.variable.unit">In {{this.variable.unit}}:</span>
                <div v-for="bar of this.legend.bars">
                    <i :style="bar.style"/>
                    <span>{{bar.value}}</span>
                </div>
            </div>
        </l-control>
    </l-map>
</template>

<script>
    import {mapState} from "vuex";
    import * as L from "leaflet";
    import {LMap, LTileLayer, LRectangle, LPopup, LControl} from "vue2-leaflet";
    import * as d3 from "d3";
    import axios from 'axios';

    export default {
        name: "ProjectionMap",
        components: {
            LMap,
            LTileLayer,
            LRectangle,
            LPopup,
            LControl,
        },
        computed: {
            ...mapState(["scenario", "variable", "timerange", "selectionUri"]),
            isLoading: {
                get() {
                    return this.loading;
                },
                set(value) {
                    this.loading = value;
                }
            }
        },
        watch: {
            selectionUri: function () {
                this.isLoading = true;
                this.prepareLegend();
                this.prepareGeoJson();
                this.$forceNextTick(() => {
                    this.isLoading = false;
                });
            },
        },
        data() {
            return {
                geojson: {features: []},
                legend: null,
                legendColorMap: null,
                loading: false,
                mapOptions: {
                    preferCanvas: true,
                    zoom: 8,
                    center: [50, 9.97],
                    maxBounds: [[50.687581, 8.755892], [49.344371, 11.010188]],
                    rasterSizeInMeters: 1000,
                },
                url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }
        },
        methods: {
            prepareLegend() {
                const min = this.variable.min;
                const max = this.variable.max;

                const interpolatorName = "interpolate" + this.variable.colormap;
                let interpolator;
                if (d3.hasOwnProperty(interpolatorName)) {
                    interpolator = d3[interpolatorName];
                } else {
                    console.error("D3 colormap '" + interpolatorName + "' not found");
                    interpolator = d3.interpolateViridis;
                }
                this.legendColorMap = d3.scaleSequential().domain([min, max]).interpolator(interpolator);

                this.legend = {bars: []};
                const stepWidth = (Math.ceil(max) - Math.floor(min)) / 10;
                for (let i = 0; i <= 10; i++) {
                    const value = Math.floor(min) + i * stepWidth;
                    this.legend.bars.push({
                        value: Math.round(value * 10) / 10, // round to one decimal
                        style: {
                            backgroundColor: this.legendColorMap(value)
                        },
                    });
                }
            },
            prepareGeoJson() {
                axios.get(`${process.env.VUE_APP_BDATA_API}/all_locations/${this.selectionUri}`)
                    .catch(function (error) {
                        console.error('fetch data error: failed to load JSON from server', error)
                    }).then(function (response) {
                    this.geojson = response.data;
                }.bind(this));
            },
            // refer to leaflet implementation
            calculateRectangleBounds(coordinates) {
                const latAccuracy = 180 * this.mapOptions.rasterSizeInMeters / 40075017;
                const lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * coordinates[1]);
                return [
                    [coordinates[1] - latAccuracy, coordinates[0] - lngAccuracy],
                    [coordinates[1] + latAccuracy, coordinates[0] + lngAccuracy]
                ];
            },
            calculateRectangleStyle(properties) {
                return {
                    color: this.legendColorMap(properties.value),
                    weight: 1,
                    opacity: 0.5,
                }
            },
            rectangleOnClick(cell) {
                this.$store.commit("addCell", cell);
            }
        }
    }
</script>

<style scoped>
    .leaflet-control {
        padding: 6px 8px;
        font: 14px/16px Arial, Helvetica, sans-serif;
        background: white;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        height: 100%;

        text-align: left;
        line-height: 18px;
        color: #555;
    }

    .leaflet-control i {
        width: 18px;
        height: 18px;
        float: left;
        margin-right: 8px;
        opacity: 0.7;
    }

    .leaflet-control span {
        float: right;
        margin-right: 8px;
    }
</style>
