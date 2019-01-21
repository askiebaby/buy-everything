$( document ).ready(function() {

  // 首先先確定 cookie 在不在

  $.ajax({
      url: '//cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js',
      dataType: 'script',
      success: function() {
        // 驗 token 是否存在
        let userToken = Cookies.get('buy-user-token');
        // 驗 token 是否有效
        if(userToken) {
          api_user(userToken, '');
        }else{
          fbSDK();
        }
      },
      error: function(){
        console.log('user 檢驗錯誤');
      }
  });


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
      let userToken = response.authResponse.accessToken;
      let userTokenExpiresIn = response.authResponse.expiresIn;
      let userTokenExpiresInString = JSON.stringify({'expiresIn': userTokenExpiresIn});

      saveToken(response.authResponse.accessToken);
      api_token(userToken, userTokenExpiresInString);
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

  function fbSDK (){
    // make sure SDK is loaded.
    // https://www.nivas.hr/blog/2016/10/29/proper-way-include-facebook-sdk-javascript-jquery/
    $.ajax({
      url: '//connect.facebook.net/en_US/sdk.js',
      dataType: 'script',
      cache: true,
      success:function() {
        console.log('step 1: 確保 SDK 已經載入完成');
        FB.init({
          appId  : '326735094614431',
          xfbml  : true,
          version: 'v2.8'
        },
        console.log('step 2: FB 物件存在，所以初始化'));
        checkLoginState();
      }
    });
  }


  function saveToken (fbToken) {
    Cookies.set('buy-user-token', fbToken);
    console.log('拿到使用者token，存到 cookie中');
  }


  // POST, API
  // 更新或建立新 token / Update or insert a new tokenPOST/token
  function api_token(userToken, data){

    var settings = {
      'url': 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space/api/token',
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': 'Bearer ' + userToken,
      },
      'data': data
    }
    
    $.ajax(settings).done(function (response) {
      if (response.result ===  true) {
        console.log('token', response);
        // 執行 get.user data
        api_user(userToken, '');
      }
    });

    $.ajax(settings).fail(function (jqXHR, textStatus, errorThrown) {
      console.log('userToken: ' + errorThrown);
    });
  }

  function api_user(userToken, data){

    var settings = {
      'url': 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space/api/users',
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': 'Bearer ' + userToken,
      },
      'data': data
    }
    console.log(settings);

    $.ajax(settings).done(function (response) {
      if (response.result === true) {
        console.log('users: ', response);
        locationURL('character.html');
      }
    });

    $.ajax(settings).fail(function () {
      FB.init({
        appId  : '326735094614431',
        xfbml  : true,
        version: 'v2.8'
      });
    });
  }
});