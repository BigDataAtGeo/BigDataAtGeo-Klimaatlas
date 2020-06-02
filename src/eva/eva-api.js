import axios from 'axios';

export class EvaApi {
    constructor() {
        this.API_URL_POINTS = process.env.VUE_APP_API_ORIGIN + '/api/v1/data/minimalpoint';
        this.API_URL_POINTS_AGGREGATED = process.env.VUE_APP_API_ORIGIN + '/api/v1/data/minimalstats';
        this.API_URL_FEEDS = process.env.VUE_APP_API_ORIGIN + '/api/v1/finalfeeds';
        this.API_URL_PACKETS = process.env.VUE_APP_API_ORIGIN + '/api/v1/packets';
        //Name of the Source/Channel that holds meta data concerning the
        // feed/source
        this.META_SOURCE_NAME = 'meta';
        this.META_CHANNEL_NAME = 'meta';
        this.EXTERNAL_WIDGETTYPES_URLS_SOURCEID = 'external-widgettypes-urls';
        this.EXTERNAL_WIDGETTYPES_URLS_CHANNEL = 'urls';
        this.EXTERNAL_WIDGETTYPES_URLS_COMPONENT = 'array';
        //the following vars set the boundaries for requested timespans (in
        // seconds) at which different aggregations are used for
        // fetchDataByTimespan
        this.AGGREGATION_BOUNDARY_L2 = 7 * 24 * 60 * 60; 	//timespan is larger than 7
        // days -> get one
        // aggregated value per day
        this.AGGREGATION_BOUNDARY_L1 = 2 * 60 * 60; 		//timespan is larger than 2
        // hours -> get one aggregated
        // value per hour
        this.AGGREGATION_BOUNDARY_L0 = 2 * 60; 		//timespan is larger than 2 Minutes
        // -> get one aggregated value per
        // minute

        this.lastFeedsOffset = 0;
        this.lastFeedsLimit = 20;

        this.lastSourcesOffset = 0;
        this.lastSourcesLimit = 20;

        this.dashboards = {}

        this.externalWidgettypeUrls = [];

        this.parsedData = null;
    }

    getLastUpdatedForComponent(feedId,
                               sourceId,
                               channel,
                               component) {
        var timestamps = Object.keys(this.parsedData.feeds[feedId].sources[sourceId].channels[channel][component]);
        if (timestamps.length === 0) {
            return null;
        }
        //return biggest timestamp (newest timestamp)
        return parseInt(timestamps.reduce(function (a, b) {
            return a < b ? b : a
        }));
    }

    getLastUpdatedForChannel(feedId, sourceId, channel) {
        var components = Object.keys(this.parsedData.feeds[feedId].sources[sourceId].channels[channel]);
        //map each component to its newest timestamp
        var timestamps = components.map(comp => this.getLastUpdatedForComponent(feedId, sourceId, channel, comp));

        if (timestamps.length === 0) {
            return null;
        }
        //return biggest timestamp (newest timestamp)
        return timestamps.reduce(function (a, b) {
            return a < b ? b : a
        });
    }

    getLastUpdatedForSource(feedId, sourceId) {
        //return null if there are no channels in this source
        if (!this.parsedData.feeds[feedId].sources[sourceId].channels) {
            return null;
        }

        var channels = Object.keys(this.parsedData.feeds[feedId].sources[sourceId].channels);
        //map each channel to its newest timestamp
        var timestamps = channels.map(chan => this.getLastUpdatedForChannel(feedId, sourceId, chan));

        if (timestamps.length === 0) {
            return null;
        }
        //return biggest timestamp (newest timestamp)
        return timestamps.reduce(function (a, b) {
            return a < b ? b : a
        });
    }

    getLastUpdatedForFeed(feedId) {
        //return null if there are no sources in this feed
        if (!this.parsedData.feeds[feedId].sources) {
            return null;
        }

        var sources = Object.keys(this.parsedData.feeds[feedId].sources);
        //map each source to its newest timestamp
        var timestamps = sources.map(src => this.getLastUpdatedForSource(feedId, src));

        if (timestamps.length === 0) {
            return null;
        }
        //return biggest timestamp (newest timestamp)
        return timestamps.reduce(function (a, b) {
            return a < b ? b : a
        });
    }

    /**** END PARSED DATA ****/

    /**** FEEDS ****/
    //get permissions for a specific feed
    fetchFeed(feedId) {
        if (feedId === undefined || feedId === null) {
            console.error(
                'fetch feed error: parameter feedId cannot be undefined or empty');
        }

        return axios.get(this.API_URL_FEEDS + "/" + feedId);
    };

    fetchFeeds(offset, limit) {
        if (offset === undefined || offset === null) {
            offset = 0;
        }
        if (limit === undefined || offset === null) {
            limit = 20;
        }
        this.lastFeedsOffset = offset;
        this.lastFeedsLimit = limit;

        return axios.get(this.API_URL_FEEDS + '?access=publicread&offset=' + offset + '&limit=' + limit);
    }

    //create a new Feed
    postFeed(feedId, publicRead, publicWrite) {
        if (feedId === undefined || feedId === null) {
            console.error(
                'post feed error: parameter feedId cannot be undefined or empty');
        }
        if (publicRead === undefined || publicRead === null) {
            publicRead = 0;
        }
        if (publicWrite === undefined || publicWrite === null) {
            publicWrite = 0;
        }
        var data = {
            feedId: feedId,
            access: {
                public: {
                    read: publicRead ? 1 : 0,
                    write: publicWrite ? 1 : 0
                }
            }
        };
        return axios.post(this.API_URL_FEEDS, JSON.stringify(data),
            {
                contentType: 'application/json;charset=utf-8',
                dataType: 'json',
                error: function (msg) {
                    console.error('post feed error: ' + JSON.stringify(msg));
                }
            }).catch(error => console.error('post feed error: ' + JSON.stringify(msg)));
    }

    /**** END FEEDS ****/

    /**** SOURCES ****/
    //get source description of a specific source
    fetchSource(feedId, sourceId) {
        if (feedId === undefined || feedId === null) {
            console.error(
                'fetch source error: parameter feedId cannot be undefined or empty');
        }
        if (sourceId === undefined || sourceId === null) {
            console.error(
                'fetch source error: parameter sourceId cannot be undefined or empty');
        }

        return axios.get(this.API_URL_FEEDS + '/' + feedId + '/sources/' + sourceId);
        // .fail(function (msg) {
        // 	console.error('fetch source error: ' + JSON.stringify(msg));
        // });
    }

    fetchSources(feedId, offset, limit) {
        if (feedId === undefined || feedId === null) {
            console.error(
                'fetch sources error: parameter feedId cannot be undefined or empty');
        }
        if (offset === undefined || offset === null) {
            offset = 0;
        }
        if (limit === undefined || limit === null) {
            limit = 20;
        }
        this.lastSourcesOffset = offset;
        this.lastSourcesLimit = limit;
        return axios.get(this.API_URL_FEEDS + '/' + feedId + '/sources?offset=' + offset + '&limit=' + limit)
            .catch(error => console.error('fetch sources error: ' + error));
    }

    /**** END SOURCES ****/

    /**** DATA ****/

    fetchDataByTimespan(feedId,
                        sourceId,
                        channels,
                        firstTS,
                        lastTS,
                        noAggregation) {
        if (feedId === undefined || feedId === null ||
            sourceId === undefined || sourceId === null ||
            channels === undefined || channels === null ||
            firstTS === undefined || firstTS === null ||
            lastTS === undefined || lastTS === null) {
            console.error('fetch data error: invalid parameters');
        }

        var firstTSDate = new Date(firstTS);
        var lastTSDate = new Date(lastTS);

        // Check whether aggregation is enabled or disabled
        if (!noAggregation) {

            //use aggregated data if the timespan is too large
            var timespanInSeconds = parseInt((lastTS - firstTS) / 1000);

            if (timespanInSeconds > this.AGGREGATION_BOUNDARY_L2) {
                return this.fetchAggregatedData(feedId,
                    sourceId,
                    channels,
                    firstTSDate,
                    lastTSDate,
                    2);
            }
            if (timespanInSeconds > this.AGGREGATION_BOUNDARY_L1) {
                return this.fetchAggregatedData(feedId,
                    sourceId,
                    channels,
                    firstTSDate,
                    lastTSDate,
                    1);
            }
            if (timespanInSeconds > this.AGGREGATION_BOUNDARY_L0) {
                return EvaApi.fetchAggregatedData(feedId,
                    sourceId,
                    channels,
                    firstTSDate,
                    lastTSDate,
                    0);
            }
        }

        return axios.get(this.API_URL_POINTS + '?feed=' + feedId +
            '&sourceId=' + sourceId + '&channels=' + channels +
            '&firstTS=' + firstTSDate.getTime() + '&lastTS=' +
            lastTSDate.getTime())
            .catch(error => console.error('fetch data error: failed to load JSON from server'));
    }

    fetchDataByLimit(feedId, sourceId, channels, limit, offset) {
        if (feedId === undefined || feedId === null ||
            sourceId === undefined || sourceId === null ||
            channels === undefined || channels === null) {
            console.error('fetch data error: invalid parameters');
        }
        if (offset === undefined || offset === null) {
            offset = 0;
        }
        if (limit === undefined || limit === null) {
            limit = 20;
        }

        return axios.get(this.API_URL_POINTS + '?feed=' + feedId +
            '&sourceId=' + sourceId + '&channels=' + channels + '&limit=' +
            limit + '&offset=' + offset)
            .catch(error => console.error('fetch data error: failed to load JSON from server'));
    }

    fetchAggregatedData(feedId,
                        sourceId,
                        channels,
                        firstTS,
                        lastTS,
                        level) {
        if (feedId === undefined || feedId === null ||
            sourceId === undefined || sourceId === null ||
            channels === undefined || channels === null ||
            firstTS === undefined || firstTS === null ||
            lastTS === undefined || lastTS === null) {
            console.error('fetch data error: invalid parameters');
        }
        if (level === undefined || level === null) {
            //level 2 means one value per day
            level = 2;
        }
        return axios.get(this.API_URL_POINTS_AGGREGATED + '?feed=' +
            feedId + '&sourceId=' + sourceId + '&channels=' + channels +
            '&firstTS=' + firstTS.getTime() + '&lastTS=' +
            lastTS.getTime() + '&level=' + level)
            .catch(error => console.error('fetch aggregated data error: failed to load JSON from server'));
    }

    postData(feeds, sourceId, data) {

        if (feeds === undefined || feeds === null ||
            sourceId === undefined || sourceId === null) {
            console.error('post data error: invalid parameters');
            return;
        }

        return axios.post(this.API_URL_PACKETS,
            JSON.stringify(data),
            {
                headers: {
                    'meta.feeds': feeds,
                    'meta.sourceId': sourceId,
                    'data.contentDetails.type': 'generic'
                },
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
            })
            .catch(error => console.error('post external widgettype urls error: ' + error));
    }

    /**** END DATA ****/

    /**** DASHBOARD PERSISTENCE ****/
    //dashboards holds all dashboard states of this user that the server knows
    postDashboardFeedIfNotExists() {
        return this.fetchFeed(this.dashboard_feedid)
            //post feed if it doesn't exist
            //also initialize external widgettype urls source
            //note: via bind() it's possible to pass arguments without using an
            // inner anonymous function
            .catch(() => this.postFeed(this.dashboard_feedid,false,false)
                .then(this.postExternalWidgettypeUrls.bind(null, [])));
    }

    //store and manage urls for external widgettypes here
    fetchExternalWidgettypeUrls() {
        return this.fetchSource(this.dashboard_feedid,
            this.EXTERNAL_WIDGETTYPES_URLS_SOURCEID)
            .then(data => {
                this.externalWidgettypeUrls = data.recentData
                    [this.EXTERNAL_WIDGETTYPES_URLS_CHANNEL]
                    [this.EXTERNAL_WIDGETTYPES_URLS_COMPONENT].val;
            });
    }

    //store an array of urls on the server that specify locations for
    // external widgettypes (e.g. from github)
    postExternalWidgettypeUrls(urls) {

        if (urls === undefined || urls === null) {
            console.error(
                'post external widgettype urls error: urls undefined or null');
            return;
        }

        var feeds = this.dashboard_feedid,
            sourceId = this.EXTERNAL_WIDGETTYPES_URLS_SOURCEID;

        var data = [{
            timestamp: new Date().getTime(),
            channels: {}
        }];

        data[0].channels[this.EXTERNAL_WIDGETTYPES_URLS_CHANNEL] = {};
        data[0].channels[this.EXTERNAL_WIDGETTYPES_URLS_CHANNEL][this.EXTERNAL_WIDGETTYPES_URLS_COMPONENT] =
            JSON.stringify(urls);

        return this.postData(feeds, sourceId, data);
    }

    /**** END DASHBOARD PERSISTENCE ****/
}
