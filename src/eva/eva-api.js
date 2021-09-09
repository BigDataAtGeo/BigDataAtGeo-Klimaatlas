import axios from 'axios';

export const EvaAPI = {

    LOCAL_STORAGE_KEY: "fieldclimate:daily",
    AGGREGATION_BOUNDARY_HOURLY: 60 * 60 * 24 * 7, 		//timespan is smaller than seven days
    AGGREGATION_BOUNDARY_RAW: 60 * 60 * 24 * 2, 		//timespan is smaller than two days

    fetchAllSources() {
        return axios.get(process.env.VUE_APP_EVA_API + "/fieldclimate/sources")
            .catch(error => console.error('fetch all sources error: ' + error));
    },

    fetchFieldClimateDailyData(sourceId) {
        const timestamp_now = Math.floor(Date.now() / 1e3);
        return axios.get(process.env.VUE_APP_EVA_API + '/fieldclimate/data/' + sourceId + "/daily/0/" + timestamp_now)
            .catch(error => {
                console.error("could not get daily fieldclimate data", error);
            })
    },
    fetchStationInformation(stationId) {
        return axios.get(process.env.VUE_APP_EVA_API + '/information/' + stationId)
        .catch(error => {
            console.error("could not get station information for Station: " + stationId, error);
        })
    }
}
