(function () {
	'use strict';

	function TokenInjectorProvider () {
		var provider = this;

		/**
		 * @ngdoc property
		 * @name TokenInjectorProvider#baseUrl
		 * @propertyOf TokenInjectorProvider
		 * @description
		 * The base url which the interceptor will add the authentication cookies for
		 *
		 * @type {string}
		 */
		provider.baseUrl = '';

		/**
		 * @ngdoc property
		 * @name TokenInjectorProvider#cookiePrefix
		 * @propertyOf TokenInjectorProvider
		 * @description
		 * The prefix to add to the guid and token cookies. Must match that of the AuthenticationServiceProvider for smooth functioning
		 *
		 * @type {string}
		 */
		provider.cookiePrefix = 'AuthenticationService_';

		/**
		 * @ngdoc factory
		 * @name Craod.Admin:TokenInjector
		 * @description
		 * The TokenInjector is an interceptor that injects the token and guid into all requests if the user is logged in
		 */
		function TokenInjector($cookies) {
			return {

				/**
				 * This function may not use AuthenticationService because that creates a circular reference
				 *
				 * @ngdoc injector
				 * @methodOf TokenInjector
				 * @description
				 * Add the token and guid to the request if the user is authenticated
				 *
				 * @param {Object} configuration
				 * @returns {Object}
				 */
				request: function (configuration) {
					if (configuration.url.indexOf(provider.baseUrl) === 0) {
						var guid = $cookies.get(provider.cookiePrefix + 'guid'),
							token = $cookies.get(provider.cookiePrefix + 'token');
						if (guid && token) {
							configuration.headers['Craod-Guid'] = guid;
							configuration.headers['Craod-Token'] = token;
						}
					}
					return configuration;
				}
			};
		}

		TokenInjector.$inject = [
			'$cookies'
		];

		provider.$get = TokenInjector;
	}

	angular
		.module('authentication-tools')
		.provider('TokenInjector', TokenInjectorProvider);
})();