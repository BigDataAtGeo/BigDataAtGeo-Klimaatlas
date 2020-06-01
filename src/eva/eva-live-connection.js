// ['sockjs', 'stomp', 'jquery', 'app/eva-auth'

import * as Stomp from "stompjs";
import * as SockJS from "sockjs-client";
import {EvaAuth} from "./eva-auth";

export class EvaLiveConnection {
	constructor(dataCallback) {
		this.dataCallback = dataCallback;
		this.evaAuth = new EvaAuth();
		this.stompIds = {};
		this.socket = null;
		this.stomp = null;
		this.connectStomp();
	}

	createStompClient() {
		this.socket = new SockJS(process.env.VUE_APP_API_ORIGIN + "/socketentry");
		this.stomp = Stomp.over(this.socket);
		//stop spamming the console log by overriding the debug function
		this.stomp.debug = function (str) {};
	};

	destroyStompClient() {
		this.stomp.disconnect();
	};

	connectStomp() {
		this.createStompClient();

		var headers = {
			'Access-Control-Allow-Origin': process.env.VUE_APP_API_ORIGIN,
		};

		if (this.evaAuth.user != null) {
			// Set authorization header if logged in
			headers.Authorization = 'Bearer ' + this.evaAuth.oauth_provider.getAccessToken();
		}

		this.stomp.connect(headers, frame => {
			// Subscribe for data
			this.stomp.subscribe("/user/queue/messages", message => {
				// remove non-printable and other non-valid JSON chars
				// before parsing
				var parsedMessage = JSON.parse(message.body.replace(
					/[\u0000-\u0019]+/g,
					""));

				this.dataCallback(parsedMessage, this.stompIds[parsedMessage.responseId]);
			});

			// Subscribe for ack message
			this.stomp.subscribe("/user/queue/ack", message => {
				var parsedMessage = JSON.parse(message.body.replace(
					/[\u0000-\u0019]+/g,
					""));
				//if the message is not in response to an unregister
				// request...
				if (typeof parsedMessage.unregister == 'undefined') {
					// ...save what responseId belongs to which feed,
					// source and channels (as comma seperated string)
					this.stompIds[parsedMessage.responseId] = {
						feedId: parsedMessage.feed,
						sourceId: parsedMessage.sourceId,
						channels: parsedMessage.channels.join(",")
					};
				}
			});

			this.stomp.trigger('stomp:connected');
			// $(this.stomp).trigger('stomp:connected');


			//reregister live-data connections in case of connection loss
			var oldStompIds = this.stompIds;
			//reset stompIds object
			this.stompIds = {};
			for (var i = 0; i < Object.keys(oldStompIds).length; i++) {
				var currentStompId = Object.keys(oldStompIds)[i];
				this.register(oldStompIds[currentStompId].feedId,
					oldStompIds[currentStompId].sourceId,
					oldStompIds[currentStompId].channels);
			}

		}, error => {
			//connection lost / could not connect
			console.error(error);
			console.error('Could not connect live-data. Retrying in 5 Seconds...');
			// setTimeout(this.connectStomp.bind(this), 5000);
		});
	};

	register(feedId, sourceId, channels) {
		if (this.stomp.connected) {
			// Send registration request for live data right away if stomp
			// is connected
			this.stomp.send("/app/channelpoint/register", {}, JSON.stringify({
				feed: feedId,
				sourceId: sourceId,
				channels: channels.split(','),
				requestId: feedId + ':' + sourceId
			}));
		} else {
			// else wait for stomp to connect
			$(this.stomp).on('stomp:connected', () => {
				// Send registration request for live data
				this.stomp.send("/app/channelpoint/register",
					{},
					JSON.stringify({
						feed: feedId,
						sourceId: sourceId,
						channels: channels.split(','),
						requestId: feedId + ':' + sourceId
					}));
			});
		}

	};

	unregister(feedId, sourceId, channels) {
		var responseIds = [],
			allResponseIds = Object.keys(this.stompIds);
		//find responseId's for feedId, sourceId and channels
		for (var i = 0; i < allResponseIds.length; i++) {
			if (this.stompIds[allResponseIds[i]].feedId == feedId &&
				this.stompIds[allResponseIds[i]].sourceId == sourceId &&
				this.stompIds[allResponseIds[i]].channels == channels) {
				responseIds.push(allResponseIds[i]);
			}
		}

		while (responseIds.length > 0) {

			var responseId = responseIds.pop();

			//delete entry in stompIds if there is at least one entry for
			// this feedId, sourceId and channels
			delete this.stompIds[responseId];

			// Send unregistration request for live data if only one widget
			// relies on this registration
			this.stomp.send("/app/channelpoint/unregister", {}, JSON.stringify({
				responseId: responseId,
				unregister: true
			}));

		}
	};

	isRegistered(feedId, sourceId, channels) {
		var allResponseIds = Object.keys(this.stompIds);
		//find responseId's for feedId, sourceId and channels
		for (var i = 0; i < allResponseIds.length; i++) {
			if (this.stompIds[allResponseIds[i]].feedId == feedId &&
				this.stompIds[allResponseIds[i]].sourceId == sourceId &&
				this.stompIds[allResponseIds[i]].channels == channels) {

				return true;
			}
		}
		return false;
	};
}
