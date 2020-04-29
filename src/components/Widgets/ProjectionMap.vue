<template>
    <div class="container" id="leaflet"></div>
</template>

<script>
    import {mapState} from "vuex";
    import L from 'leaflet';
    import * as d3 from "d3";
    import axios from 'axios';

    export default {
        name: "ProjectionMap",
        computed: {
            ...mapState(["scenario", "variable", "timerange", "selectionUri"])
        },
        watch: {
            selectionUri: function () {
                this.initLayers()
            },
        },
        data() {
            return {
                map: null,
                geojsonLayer: null,
                legend: null,
                center: L.latLng(50, 9.97),
                zoom: 8,
                maxBounds: L.LatLngBounds(L.latLng(50.687581, 8.755892), L.latLng(49.344371, 11.010188)),
                rasterSizeInMeters: 1000,
                baseTileServer: {
                    url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                },
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.initMap();
            });
        },
        methods: {
            initMap() {
                this.map = L.map("leaflet", {
                    preferCanvas: true,
                    maxBounds: this.maxBounds
                }).setView(this.center, this.zoom);

                this.map.eachLayer(function (layer) {
                    this.map.removeLayer(layer);
                }.bind(this));

                L.tileLayer(this.baseTileServer.url, {
                    attribution: this.baseTileServer.attribution
                }).addTo(this.map);

                this.map.attributionControl.setPrefix('');
            },
            initLayers() {
                axios.get(`${process.env.VUE_APP_BDATA_API}/all_locations/${this.selectionUri}`)
                    .catch(function (error) {
                        console.error('fetch data error: failed to load JSON from server', error)
                    }).then(function (response) {
                        const data = response.data;

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

                        const cmap = d3.scaleSequential().domain([min, max]).interpolator(interpolator);

                        // Remove old geojsonLayer if there is one
                        if (this.geojsonLayer) {
                            this.map.removeLayer(this.geojsonLayer);
                        }

                        this.geojsonLayer = L.geoJSON(data, {
                            pointToLayer: function (feature, latlng) {
                                // rect.on('click', loadTimelineData.bind(this));
                                return L.rectangle(latlng.toBounds(this.rasterSizeInMeters), {
                                    color: cmap(feature.properties.value),
                                    weight: 1,
                                    fillOpacity: 0.5
                                });
                            }.bind(this)
                        }).bindPopup(function (layer) {
                            let unitSuffix = this.variable.unit ? ' ' + this.variable.unit : '';
                            return String(layer.feature.properties.value) + unitSuffix;
                        }.bind(this)).addTo(this.map);

                        // remove old legend
                        if (this.legend) {
                            this.map.removeControl(this.legend);
                        }

                        const legendBarValues = [];
                        const stepWidth = (Math.ceil(max) - Math.floor(min)) / 10;
                        for (let i = 0; i <= 10; i++) {
                            const value = Math.floor(min) + i * stepWidth;
                            legendBarValues.push(Math.round(value * 10) / 10); // round to one decimal
                        }

                        // https://leafletjs.com/examples/choropleth/example.html
                        this.legend = L.control({position: 'bottomright'});
                        this.legend.onAdd = function (map) {
                            let div = L.DomUtil.create('div', 'info legend');
                            let labels = [];
                            if (this.variable.unit) {
                                labels.push("In " + this.variable.unit + ":");
                            }

                            for (let i = legendBarValues.length - 1; i >= 0; i--) {
                                const legendBar = legendBarValues[i];
                                labels.push("<div><i style='background-color:" + cmap(legendBar) + "'></i><span>" + legendBar + "</span></div>");
                            }

                            div.innerHTML = labels.join('');
                            return div;
                        }.bind(this);
                        this.legend.addTo(this.map);


                        // Remove loader
                        // this.mapLoader.remove();
                        // this.leafletContainer.children().removeClass('blurry');

                    }.bind(this));
            },
        }
    }
</script>

<style scoped>
    div.container {
        background-color: lightblue;
        width: 100%;
        height: 100%;
        max-width: none;
        padding: 0;
    }
</style>
