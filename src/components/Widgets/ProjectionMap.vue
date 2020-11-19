<template>
  <l-map id="leaflet" ref="map" @ready="onReadyMap" :options="mapOptions" v-bind:class="{ blurry: loading }"
         :zoom="mapOptions.zoom"
         :center="mapOptions.center">
    <l-tile-layer :url="url" :attribution="attribution"/>
    <l-layer-group layerType="overlay" :key="this.redraws">
      <div v-if="geojson">
        <l-polygon v-for="cell of this.selectedCells" :key="cell.id"
                   :lat-lngs="cell.polygon"
                   :color="cell.color"
                   :interactive="false" :bubblingMouseEvents="false"
                   :fill="false" :options="geoJsonOptions"></l-polygon>
      </div>
    </l-layer-group>
    <l-geo-json v-if="geojson" :geojson="geojson" :options="geoJsonOptions"
                :options-style="geoJsonStyle"></l-geo-json>

    <l-marker v-for="sensor of this.sensors" :lat-lng="sensor.latlng" :icon="createSensorIcon(sensor.color)"
              :key="sensor.id"
              v-on:click="setSelectedSensor(sensor)"
              v-on:contextmenu="addSelectedSensor(sensor)">
    </l-marker>
    <l-control v-if="legend" :position="'bottomleft'" class="custom-control-watermark">
      <div class="container">
        <div class="row">
          <span v-if="this.variable.unit">In {{ this.variable.unit }}:</span>
        </div>
        <div class="row">
          <div id="legend1" style="display: inline-block"></div>
        </div>
      </div>
    </l-control>
  </l-map>
</template>

<script>
import {mapState, mapMutations, mapGetters} from "vuex";
import {LMap, LTileLayer, LRectangle, LGeoJson, LLayerGroup, LPopup, LControl, LPolygon, LMarker} from "vue2-leaflet";
import {icon, divIcon} from 'leaflet';
import {EvaAPI} from "../../eva/eva-api";
import axios from 'axios';
import * as d3 from "d3";
import {colorGenerate} from '../mixins/colorGenerate';

export default {
  name: "ProjectionMap",
  mixins: [colorGenerate],
  components: {
    LMap,
    LTileLayer,
    LRectangle,
    LGeoJson,
    LPopup,
    LControl,
    LPolygon,
    LMarker,
    LLayerGroup,
  },
  computed: {
    ...mapState(["scenario", "variable", "timerange", "selectionUri", "selectedCells", "polygons", "ids", "viewBoundingBox"]),
    geoJsonOptions() {
      return {
        onEachFeature: this.onEachFeatureFunction
      };
    },
    geoJsonStyle() {
      return feature => {
        return {
          color: this.legendColorMap(feature.properties.value),
          weight: 1,
          opacity: 0.15,
          fillOpacity: 0.45,
        };
      };
    },
    onEachFeatureFunction() {
      return (feature, layer) => {
        // create tooltip
        const value = (Math.round(feature.properties.value * 10) / 10).toLocaleString("de-DE");
        const latitude = feature.geometry.coordinates[0][2][0].toLocaleString("de-DE") + "&deg;O";
        const longitude = feature.geometry.coordinates[0][2][1].toLocaleString("de-DE") + "&deg;N";
        const postfix = this.variable.unit + " (" + longitude + " " + latitude + ")";
        layer.bindTooltip("<div>" + value + ' ' + postfix + "</div>", {
          permanent: false,
          sticky: true
        });

        // set all selectedCells to this cell alone
        layer.on('click', cell => {
          // cell.geoemtry = feature.geometry
          const cellObject = this.createCellObject(cell, feature);
          this.setSelectedCell(cellObject);
        });

        // add this cell to the selection
        layer.on('contextmenu', cell => {
          const cellObject = this.createCellObject(cell, feature);
          if (!this.selectedCells.find(x => x.id === feature.properties.id)) {
            if (this.selectedCells.length >= 5)
              return;
            this.addSelectedCell(cellObject)
          } else {
            console.log("remove me");
            this.removeSelectedCell(cellObject)
          }
        });
      };
    },
  },
  watch: {
    selectionUri: function () {
      this.loadMapData()
      this.prepareLegend();
    },
    viewBoundingBox: function () {
      this.$refs.map.fitBounds(this.viewBoundingBox);
    },
    geojson: {
      deep: true,
      handler() {
        this.$forceNextTick(() => {
          this.loading = false;
          this.redraws++;
        });
      }
    }
  },
  data() {
    return {
      geojson: null,
      legend: null,
      legendColorMap: null,
      loading: true,
      sensors: [],
      liveSensorTimeThreshold: 1000 * 60 * 60 * 24 * 30, // ms * s * m * h * D
      sensorIcon: icon({
        iconUrl: "assets/sensor.svg",
        iconSize: [25, 25],
        iconAnchor: [12.5, 12.5],
      }),
      mapOptions: {
        preferCanvas: true,
        zoom: 8,
        center: [50, 9.97],
        maxBounds: [[44.75, 2.33], [54.37, 17.53]],
        rasterSizeInMeters: 1000,
      },
      url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      redraws: 0 // used to redraw selected cells on the map
    }
  },
  mounted() {
    EvaAPI.fetchAllSources().then(result => {
      let id = 0;
      for (const sensorData of result.data) {
        if (!sensorData.hasOwnProperty("recentData") || !sensorData.recentData.hasOwnProperty("geo"))
          continue

        let isLive = false; // only show sensors that sent data within the timeperiod of 'this.liveSensorTimeThreshold'
        const timeDelta = Date.now() - this.liveSensorTimeThreshold;
        for (const channel of Object.values(sensorData.recentData)) {
          if (!channel.hasOwnProperty("value") || !channel.value.hasOwnProperty("lastUpdated"))
            continue
          if (channel.value.lastUpdated >= timeDelta)
            isLive = true;
        }
        if (!isLive)
          continue;

        const geoData = sensorData.recentData.geo;
        const channels = [];
        for (let channel of Object.keys(sensorData.recentData)) {
          let unit = "";
          if (sensorData.recentData[channel].hasOwnProperty("unit") && sensorData.recentData[channel].unit.val)
            unit = sensorData.recentData[channel].unit.val;
          channels.push({
            name: channel,
            unit: unit
          })
        }
        let color = this.generateColor();
        while (this.sensors.find(sensor => sensor.color === color) && this.sensor.length < this.amountColors())
          color = this.generateColor();
        this.sensors.push({
          latlng: [geoData.lat.val, geoData.lon.val],
          id: sensorData.sourceId,
          color: this.generateColor(),
          channels: channels,
        })
      }
    })
    if (this.selectionUri) {
      this.loadMapData();
      this.prepareLegend();
    }
  },
  methods: {
    ...mapMutations(["setSelectedCell", "addSelectedCell", "setSelectedSensor", "addSelectedSensor", "removeSelectedCell", "removeSelectedSensor"]),
    loadMapData() {
      this.loading = true;
      this.prepareGeoJson();
    },
    onReadyMap(mapObject) {
      //Moving Zoom to bottom left
      const mapComponent = this.$refs.map.mapObject
      this.prepareLegend();
      mapComponent.zoomControl.setPosition('bottomleft');
    },
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


      var legendheight = 200,
          legendwidth = 80,
          margin = {top: 10, right: 50, bottom: 10, left: 2};
      var colorscale = d3.scaleSequential().domain([min, max]).interpolator(interpolator);
      var selector_id = "#legend1";
      //remoove old legend
      d3.select("#svgLegend").remove();
      //new legend
      var canvas = d3.select(selector_id)
          .style("height", legendheight + "px")
          .style("width", legendwidth + "px")
          .style("position", "relative")
          .append("canvas")
          .attr("height", legendheight - margin.top - margin.bottom)
          .attr("width", 1)
          .style("height", (legendheight - margin.top - margin.bottom) + "px")
          .style("width", (legendwidth - margin.left - margin.right) + "px")
          .style("border", "1px solid #000")
          .style("position", "absolute")
          .style("top", (margin.top) + "px")
          .style("left", (margin.left) + "px")
          .node();

      var ctx = canvas.getContext("2d");

      var legendscale = d3.scaleLinear()
          .range([1, legendheight - margin.top - margin.bottom])
          .domain(colorscale.domain());

      var image = ctx.createImageData(1, legendheight);
      d3.range(legendheight).forEach(function (i) {
        var c = d3.rgb(colorscale(legendscale.invert(i)));
        image.data[4 * i] = c.r;
        image.data[4 * i + 1] = c.g;
        image.data[4 * i + 2] = c.b;
        image.data[4 * i + 3] = 255;
      });
      ctx.putImageData(image, 0, 0);

      var legendaxis = d3.axisRight()
          .scale(legendscale)
          .tickSize(7)
          .ticks(8);

      var svg = d3.select(selector_id)
          .append("svg")
          .attr("height", (legendheight) + "px")
          .attr("width", (legendwidth) + "px")
          .attr("id", "svgLegend")
          .style("position", "absolute")
          .style("left", "0px")
          .style("top", "0px")

      svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", "translate(" + (legendwidth - margin.left - margin.right + 3) + "," + (margin.top) + ")")
          .call(legendaxis);

      //tick label size
      svg.select(".axis")
          .style("font-size", "0.9rem")
    },
    prepareGeoJson() {
      if (!this.geojson) {
        axios.get(`${process.env.VUE_APP_BDATA_API}/all_locations/grid/${this.selectionUri}`)
            .catch(function (error) {
              console.error('fetch data error: failed to load JSON from server', error)
            }).then(function (response) {
          this.geojson = response.data;
        }.bind(this));
      } else {
        axios.get(`${process.env.VUE_APP_BDATA_API}/all_locations/values/${this.selectionUri}`)
            .catch(error => {
              console.error('fetch data error: failed to load JSON from server', error)
            }).then(response => {
          for (let feature of this.geojson.features) {
            const id = feature.properties.id
            if (id in response.data) {
              feature.properties.value = response.data[id];
            } else {
              this.geojson = null;
              this.prepareGeoJson();
              return;
            }
          }
        });
      }
    },
    createCellObject: function(cell, feature) {
      const coordinates = []
      // the geoJson has lng-lat coords, leaflet expects lat-lng -> change for further use
      for (const coordinate of feature.geometry.coordinates[0]) {
          coordinates.push([coordinate[1], coordinate[0]])
      }

      let color = this.generateColor();
      while (this.selectedCells.find(cell => cell.color === color) && this.selectedCells.length < this.amountColors()) {
        color = this.generateColor();
      }
      return {
        id: feature.properties.id,
        value: feature.properties.value,
        polygon: coordinates,
        latlng: cell.latlng,
        color: color,
      }
    },
    createSensorIcon: color => divIcon({
      className: "sensor-svg",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      html: '<svg xmlns="http://www.w3.org/2000/svg"  \n' +
          '     viewBox="0 0 333333 240819" \n' +
          '     shape-rendering="geometricPrecision" \n' +
          '     text-rendering="geometricPrecision" \n' +
          '     image-rendering="optimizeQuality" \n' +
          '     fill-rule="evenodd" \n' +
          '     clip-rule="evenodd">\n' +
          '    <path d="M57204 229050c2538 3026 2245 7516-781 10053-3026 2538-7516 2246-10054-781C15525 202306-384 161506 6 120218 396 79907 16111 39400 48419 2407c2538-2928 7028-3221 10054-683 2928 2538 3221 7028 683 10053-29965 34260-44606 71643-44899 108539-293 37871 14348 75352 42947 108733zm37286-34650c2635 2928 2343 7418-586 10053-2928 2635-7418 2343-10054-586-23719-26841-35919-55245-35431-84039 488-28013 12884-56124 38164-82965 2733-2831 7223-3026 10053-293 2831 2733 3026 7223 293 10054-22742 24206-33967 48998-34357 73400-390 25182 10542 50365 31819 74473l98-97zm32991-32991c2441 3026 2050 7515-1073 9956-3026 2440-7516 2050-9956-1074-12787-15714-19424-32795-19522-50169-98-16886 6247-33870 19229-49779 2440-3026 6930-3514 9956-1074s3514 6930 1074 9956c-10835 13274-16105 27232-16105 40800 0 13957 5661 28013 16300 41190l97 195zm159483 76913c-2537 3026-7028 3319-10054 781-3026-2537-3319-7027-781-10053 28598-33381 43337-70959 42947-108733-293-36895-14934-74279-44899-108539-2538-2928-2245-7418 683-10053 2928-2538 7418-2245 10054 683 32307 36993 48022 77499 48413 117811 390 41287-15519 82087-46363 118104zm-37383-34552c-2635 2928-7125 3221-10054 586-2928-2635-3221-7125-585-10054 21376-24109 32210-49291 31819-74474-390-24499-11615-49291-34357-73400-2733-2831-2538-7321 293-10054 2830-2733 7320-2538 10053 293 25280 26841 37676 54854 38164 82965 488 28794-11615 57197-35431 84039l98 98zm-32600-33479c-2440 3026-6930 3514-9956 1074-3026-2441-3514-6930-1074-9956 10737-13177 16300-27232 16300-41190 0-13665-5173-27525-16105-40799-2440-3026-2049-7515 1074-9956 3026-2440 7516-2050 9956 1074 12981 15910 19326 32893 19229 49780-98 17374-6735 34357-19522 50169l98-195zm-50441-23620c-2317-7-4633-200-6949-586-3648-1031-7038-2770-9909-5114-663-541-1298-1114-1902-1718-4880-4880-7808-11517-7808-18935s3026-14056 7808-18936c4880-4880 11518-7808 18936-7808s14055 3026 18935 7808c4881 4880 7808 11518 7808 18936 0 4106-927 7972-2565 11434-4695 9918-13425 14952-24354 14919z" \n' +
          '    fill-rule="nonzero"\n' +
          '    fill="' + color + '" \n' +
          '    style="stroke:#000000;stroke-opacity:1;stroke-width:5000;stroke-miterlimit:4;stroke-dasharray:none"/>\n' +
          '</svg>'
    }),
  }
}
</script>

<style scoped>
.leaflet-control {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: white;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: rgba(65, 69, 73, 0.3) 0px 1px 2px 0px, rgba(65, 69, 73, 0.15) 0px 3px 6px 2px;
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
