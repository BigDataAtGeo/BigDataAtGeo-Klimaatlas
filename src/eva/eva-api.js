import axios from 'axios';

export const EvaAPI = {

    LOCAL_STORAGE_KEY: "fieldclimate:daily",
    AGGREGATION_BOUNDARY_HOURLY: 60 * 60 * 24 * 7, 		//timespan is smaller than seven days
    AGGREGATION_BOUNDARY_RAW: 60 * 60 * 24 * 2, 		//timespan is smaller than two days

    // CACHE: (function () {
    //     /**
    //      * Check if there is data in the local storage, else return empty dict
    //      */
    //     const localStorageData = localStorage.getItem("fieldclimate:daily")
    //     return localStorageData ? JSON.parse(localStorageData) : {};
    // })(),

    fetchAllSources() {
        return axios.get(process.env.VUE_APP_EVA_API + "/fieldclimate/sources")
            .catch(error => console.error('fetch all sources error: ' + error));
    },

    getChannels(sourceId) {
        // if (this.CACHE.hasOwnProperty(sourceId)) {
        //     return new Promise((resolve, reject) => {
        //         resolve(Object.keys(this.CACHE[sourceId]));
        //     })
        // } else {
        //     return this.fetchFieldClimateDailyData(sourceId).then(() => {
        //         return Object.keys(this.CACHE[sourceId])
        //     });
        // }
    },

    fetchFieldClimateDailyData(sourceId) {
        // divide by 1e3 for ms -> s
        // const timestamp_now = Math.floor(Date.now() / 1e3);
        //
        // const lastUpdated = this.CACHE.hasOwnProperty(sourceId) ? this.CACHE[sourceId].lastUpdated : 0;
        //
        // if (timestamp_now - lastUpdated > 60 * 60 * 24) {
        //     return axios.get(process.env.VUE_APP_EVA_API + '/fieldclimate/data/' + sourceId + "/daily/" + lastUpdated + "/" + timestamp_now)
        //         .then(data => {
        //             this.updateFieldClimateDailyData(sourceId, data.data, timestamp_now);
        //             return this.CACHE[sourceId];
        //         })
        // } else {
        //     return new Promise((resolve, reject) => {
        //         resolve(this.CACHE[sourceId])
        //     })
        // }
        const timestamp_now = Math.floor(Date.now() / 1e3);
        return axios.get(process.env.VUE_APP_EVA_API + '/fieldclimate/data/' + sourceId + "/daily/0/" + timestamp_now)
            .catch(error => {
                console.error("could not get daily fieldclimate data", error);
            })
    },

    // updateFieldClimateDailyData(sourceId, data, timestamp) {
    //     if (!data.hasOwnProperty("dates") || !data.hasOwnProperty("data"))
    //         throw "KeyError";
    //     if (!this.CACHE.hasOwnProperty(sourceId))
    //         this.CACHE[sourceId] = {dates: [], data: {}};
    //     if (!this.STATIONS.hasOwnProperty(sourceId))
    //         this.STATIONS[sourceId] = {}
    //     if (!this.STATIONS.hasOwnProperty("channels"))
    //         this.STATIONS[sourceId].channels = {};
    //     this.CACHE[sourceId].lastUpdated = timestamp;
    //
    //     // update dates
    //     this.CACHE[sourceId].dates = this.CACHE[sourceId].dates.concat(data.dates);
    //
    //
    //     // update each sensor
    //     for (const sensor of Object.values(data.data)) {
    //         console.log(sensor);
    //         this.STATIONS[sourceId].channels[sensor.ch] = {
    //             id: sensor.name,
    //             name: sensor.name_custom,
    //             unit: sensor.unit,
    //             min: sensor.vals.min,
    //             max: sensor.vals.max,
    //         };
    //
    //         if (!this.CACHE[sourceId].hasOwnProperty(sensor.name))
    //             this.CACHE[sourceId][sensor.name] = {}
    //         const sensorData = this.CACHE[sourceId][sensor.name];
    //         // update each aggregation
    //         for (const aggregation of Object.keys(sensor.aggr)) {
    //             // if aggregation exists, concatenate
    //             if (sensorData.hasOwnProperty(aggregation)) {
    //                 sensorData[aggregation] = sensorData[aggregation].concat(sensor.aggr[aggregation]);
    //             } else { // else set new
    //                 sensorData[aggregation] = sensor.aggr[aggregation];
    //             }
    //         }
    //     }
    //
    //     localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.CACHE))
    // },
}
