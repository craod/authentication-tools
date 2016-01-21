(function () {
	'use strict';

	/**
	 * @ngdoc provider
	 * @name AuthenticationServiceProvider
	 * @description
	 * Provider for configuration of the AuthenticationService service
	 */
	function AuthenticationServiceProvider () {
		var provider = this;

		/**
		 * @ngdoc property
		 * @name AuthenticationServiceProvider#cookiePrefix
		 * @propertyOf AuthenticationServiceProvider
		 * @description
		 * The prefix to add to the guid and token cookies
		 *
		 * @type {string}
		 */
		provider.cookiePrefix = 'AuthenticationService_';

		/**
		 * @ngdoc property
		 * @name AuthenticationServiceProvider#routes
		 * @propertyOf AuthenticationServiceProvider
		 * @description
		 * The endpoints for the login, logout and validate endpoints
		 *
		 * @type {{login: string, logout: string, validate: string}}
		 */
		provider.endpoints = {};

		/**
		 * @ngdoc service
		 * @name Craod.Admin:AuthenticationService
		 * @description
		 * Service that provides functions for authentication - logging in and out and validating
		 */
		function AuthenticationService($q, $http, $cookies) {
			var service = {};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Set the currently navigating user
			 *
			 * @param {Object} user
			 * @returns {void}
			 */
			service.setCurrentUser = function (user) {
				service.currentUser = user;
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Get the currently navigating user
			 *
			 * @returns {Object}
			 */
			service.getCurrentUser = function () {
				return service.currentUser;
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Returns true if there is a currentUser set
			 *
			 * @returns {boolean}
			 */
			service.isAuthenticated = function () {
				return !!service.currentUser;
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Returns true if the user is in the process of validating the token
			 *
			 * @returns {boolean}
			 */
			service.shouldAuthenticate = function () {
				var guid = $cookies.get(provider.cookiePrefix + 'guid'),
					token = $cookies.get(provider.cookiePrefix + 'token');
				return (!guid || !token);
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Remove local information on the current user
			 *
			 * @returns {void}
			 */
			service.removeCurrentUser = function () {
				delete service.currentUser;
				$cookies.remove(provider.cookiePrefix + 'guid');
				$cookies.remove(provider.cookiePrefix + 'token');
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Do a sign in attempt and return a promise
			 *
			 * @param {Object} loginData An object containing email, password and rememberMe
			 * @returns {Promise}
			 */
			service.signIn = function (loginData) {
				var path = provider.endpoints.login, promise;
				promise = $http({
					method: 'POST',
					url: path,
					data: loginData
				});
				promise.then(function (response) {
					var options = {}, expiryDate;
					if (loginData.rememberMe) {
						expiryDate = new Date();
						expiryDate.setDate(expiryDate.getDate() + 90);
						options.expires = expiryDate;
					}
					$cookies.put(provider.cookiePrefix + 'guid', response.data.guid, options);
					$cookies.put(provider.cookiePrefix + 'token', response.data.token, options);
				}, function () {
					service.removeCurrentUser();
				});
				return promise;
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Validate the current status by sending the token to the server and awaiting the user information
			 *
			 * @returns {Promise}
			 */
			service.validate = function () {
				var guid = $cookies.get(provider.cookiePrefix + 'guid'),
					token = $cookies.get(provider.cookiePrefix + 'token');
				if (service.shouldAuthenticate()) {
					service.currentUser = undefined;
					var deferred = $q.defer();
					deferred.reject();
					return deferred.promise;
				}

				service.validating = true;
				var path = provider.endpoints.validate, promise;
				promise = $http({
					method: 'POST',
					url: path,
					data: {
						guid: guid,
						token: token
					}
				});
				promise.then(function (response) {
					service.setCurrentUser(response.data);
				}, function () {
					service.removeCurrentUser();
				});
				promise.finally(function () {
					delete service.validating;
				});

				return promise;
			};

			/**
			 * @ngdoc method
			 * @methodOf AuthenticationService
			 * @description
			 * Sign out the current user
			 *
			 * @returns {void}
			 */
			service.signOut = function () {
				var guid = $cookies.get(provider.cookiePrefix + 'guid'),
					token = $cookies.get(provider.cookiePrefix + 'token');
				service.removeCurrentUser();
				if (!guid || !token) {
					var deferred = $q.defer();
					deferred.resolve();
					return deferred.promise;
				}
				return $http({
					method: 'POST',
					url: provider.endpoints.logout,
					data: {
						guid: guid,
						token: token
					}
				});
			};

			return service;
		}

		AuthenticationService.$inject = [
			'$q',
			'$http',
			'$cookies'
		];

		provider.$get = AuthenticationService;
	}

	angular
		.module('authentication-tools')
		.provider('AuthenticationService', AuthenticationServiceProvider);
})();