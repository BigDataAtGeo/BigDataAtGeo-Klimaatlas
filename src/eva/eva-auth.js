import * as oauth from "@zalando/oauth2-client-js";
import axios from 'axios';

export class EvaAuth {
	constructor() {
		this.CLIENT_ID = 'everyaware-app-gears';
		this.REDIRECT_URI = process.env.VUE_APP_ORIGIN + '/';

		this.OAUTH_PROVIDER_ID = 'everyaware';
		this.OAUTH_AUTHORIZATION_URL = process.env.VUE_APP_AUTH_ORIGIN_PROXY + '/oauth/authorize';

		this.USERINFO_URL = process.env.VUE_APP_AUTH_ORIGIN_PROXY + '/userinfo';

		this.user = null;

		this.initialize();
	}

	initialize() {
		if (!this.oauth_provider) {
			this.oauth_provider = new oauth.Provider({
				id: this.OAUTH_PROVIDER_ID,
				authorization_url: this.OAUTH_AUTHORIZATION_URL
			});
		}
	}

	authorize() {
		var request = new oauth.Request({
			client_id: this.CLIENT_ID,
			redirect_uri: this.REDIRECT_URI
		});

		var uri = this.oauth_provider.requestToken(request);

		this.oauth_provider.remember(request);

		window.location.href = uri;
	}

	/**
	 * Checks if the the page is loaded due to a redirect from the
	 * oauth provider and stores the access token.
	 */
	checkIfAuthRedirect() {
		try {
			if (!this.oauth_provider.hasAccessToken()) {
				var response = this.oauth_provider.parse(window.location.hash);
			}
		} catch (error) {
			console.error(error);
			return Promise.resolve();
		}

		var accessToken = this.oauth_provider.getAccessToken();

		if (accessToken) {
			return axios.get(this.USERINFO_URL, {
				headers: {
					'Authorization': 'Bearer ' + accessToken
				},
				crossDomain: true,
				async: true
			}).then((response) => {
				this.user = response
			}).catch((error) => {
				console.error('fetch user info error: ' + error);
				// Delete token since it is probably invalid
				this.oauth_provider.deleteTokens();
			});
		} else {
			return Promise.resolve();
		}
	}

	logout() {
		this.oauth_provider.deleteTokens();
		window.location = this.REDIRECT_URI;
	}
}
