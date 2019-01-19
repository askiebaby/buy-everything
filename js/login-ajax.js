$( document ).ready(function() {

  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('step 4: statusChangeCallback is called!', response);
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      console.log('step 4.1: statusChangeCallback: connected');
      // Logged into your app and Facebook.
      // cookies
      saveToken(response.authResponse.accessToken);
    } else {
      // The person is not logged into your app or we are unable to tell.
      document.getElementById('status').innerHTML = 'Please log ' +
        'into this app.';
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    console.log('step 3: 確認使用者登入狀態');
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });
  }

  // make sure SDK is loaded.
  $.ajax(
    {
      url: '//connect.facebook.net/en_US/sdk.js',
      dataType: 'script',
      cache: true,
      success:function()
      {
        console.log('step 1: 確保 SDK 已經載入完成');
        FB.init(
          {
            appId      : '326735094614431',
            xfbml      : true,
            version    : 'v2.8'
          },
          console.log('step 2: FB 物件存在，所以初始化')
        );
        checkLoginState();
      }
    });

  function saveToken (fbToken) {
    Cookies.set('buy-user-token', fbToken);
    console.log('拿到使用者token，存到cookie中');
  }
});