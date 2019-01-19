$( document ).ready(function() {

  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('statusChangeCallback');
    console.log(response);
    
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      // Logged into your app and Facebook.
      let userToken = response.authResponse.accessToken;
      let userTokenExpiresIn = response.authResponse.expiresIn;
      
      console.log(userToken, userTokenExpiresIn);
      testAPI();
      Cookies.set('buy-user-token', userToken);
      // loginNEMI(userToken, userTokenExpiresIn);

    } else if (response.status === 'not_authorized') {
      // The person is logged into Facebook, but not your app.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    } else {
      // The person is not logged into Facebook, so we're not sure if
      // they are logged into this app or not.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into Facebook.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  // Here we run a very simple test of the Graph API after login is
  // successful.  See statusChangeCallback() for when this call is made.
  function testAPI() {
    console.log('Welcome! Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
      document.getElementById('status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
      });
  }

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '326735094614431',
      cookie     : true,
      xfbml      : true,
      version    : 'v2.8'
    });
  
    FB.AppEvents.logPageView();
    checkLoginState();
  };


  // function loginNEMI(userToken, userTokenExpiresIn) {
  //   console.log('login!');
  //   // 把 access_token 傳至後端再做資料拿取
  //   var settings = {
  //     "async": true,
  //     "crossDomain": true,
  //     "url": "https://929736fc.ngrok.io/api/token",
  //     "method": "POST",
  //     "headers": {
  //       "Authorization": "Bearer " + userToken,
  //       "Content-Type": "application/json",
  //       "X-Requested-With": "XMLHttpRequest"
  //     },
  //     "processData": false,
  //     "data": "{'expiresIn':" + userTokenExpiresIn + "}"
  //   }
    
  //   $.ajax(settings).done(function (response) {
  //     console.log(response);
  //   });
  // }
});

function foo () {
  console.log('123');
}

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/en_US/sdk.js';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

