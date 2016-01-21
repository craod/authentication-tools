# authentication-tools
Tools for authenticating with the Craod API through AngularJS

**[Requirements](#requirements)** **[Installation](#installation)** **[Usage](#usage)**

<a name="requirements"></a>
## Requirements
authentication-tools requires AngularJS and angular-cookies (the ngCookies module) to work.

<a name="installation"></a>
## Installation
Simply include the files provided in the dist folder: authentication-tools.js or authentication-tools.min.js. Add the *authentication-tools*
module to your application for tools to be available.

<a name="usage"></a>
## Usage
### Configuring
Authenticate your app through the AuthenticationService in conjunction with the TokenInjector. First of all, configure the AuthenticationService and the TokenInjector
using the AuthenticationServiceProvider and TokenInjectorProvider, respectively:

```
TokenInjectorProvider.baseUrl = Configuration.api.url;
AuthenticationServiceProvider.endpoints = {
	login: Configuration.api.url + 'user/login',
	validate: Configuration.api.url + 'user/validate',
	logout: Configuration.api.url + 'user/logout'
};
```

You can now validate, log in and out, and all communication with the API will be injected with the Craod token if validation is successful:

```
AuthenticationService.validate().then(function () {
	alert('Logged in as ' + AuthenticationService.getCurrentUser().email);
});
```

### Logging in
Log in using the signIn function with an object containing the email, password and rememberMe properties:

```
var promise = AuthenticationService.signIn({email: 'test@tester.com', password: '123456', rememberMe: false});
```

If the process succeeded, proceed to validate the login in order to retrieve the current user:

```
promise.then(function () {
	var validation = AuthenticationService.validate();
	validation.then(function () {
		$scope.signedIn = true;
	});
});
```

If the process failed, look for a 404 status to represent an invalid email, or else an invalid password:
```
promise.catch(function (response) {
	if (response.status == 404) {
		// Handle invalid user
	} else if (response.status == 401) {
		// Handle wrong password
	}
});
```

### Logging out
Simply use the signOut function to log out:

```
AuthenticationService.signOut().finally(function () {
	alert('Signed out!');
});
```