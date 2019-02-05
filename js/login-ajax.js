$( document ).ready(function() {

  // 初始畫面
  let userToken = Cookies.get('buy-user-token')
  let fbButton = document.querySelector('.loginButton')
  let loginPageFunc = document.querySelector('.loginPage__login__func')

  fbButton.innerHTML = '確認登入狀態中...'
  
  // 檢驗 token 是否存在
  // => 存在則送驗
  // ====> 有效 => 載入使用者狀態及可使用的功能
  // ====> 無效 => 背景重新存取 token
  // => 不存在需要使用者登入及授權

  if(userToken) {
    api_user(userToken, '')
  } else {
    fbSDK()
    fbButton.addEventListener('click', buttonInit)
  }


  // 登入：賦予按鈕登入事件

  function buttonInit () {
    FB.login(function(response) {
      if (response.authResponse) {
          statusChangeCallback(response)
      } else {
        console.log('User cancelled login or did not fully authorize.')
      }
    })
  }


  // 登出

  function buttonLogout () {
    FB.init({
      appId  : '326735094614431',
      xfbml  : true,
      version: 'v2.8'
    })
    checkLoginState()
    FB.logout(function(response) {
      // user is now logged out
      statusChangeCallback(response)

      fbButton.innerHTML = '登入'
      fbButton.removeEventListener('click', buttonLogout)
      fbButton.addEventListener('click', buttonInit)
      Cookies.remove('buy-user-token')
    })
  }

  // 首先先確定 cookie 在不在

  $.ajax({
      url: '//cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js',
      dataType: 'script',
      success: function() {
        
        // 驗 token 是否存在
        let userToken = Cookies.get('buy-user-token')

        // 驗 token 是否有效
        if(userToken) {
          api_user(userToken, '')
        }else{
          fbSDK()
        }
      },
      error: function(){
        console.log('user 檢驗錯誤')
      }
  })


  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback(response) {
    console.log('step 4: statusChangeCallback is called!', response)
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      console.log('step 4.1: statusChangeCallback: connected')
      // Logged into your app and Facebook.
      // cookies
      let userToken = response.authResponse.accessToken
      let userTokenExpiresIn = response.authResponse.expiresIn
      let userTokenExpiresInString = JSON.stringify({'expiresIn': userTokenExpiresIn})

      saveToken(response.authResponse.accessToken)
      api_token(userToken, userTokenExpiresInString)
    } 
    else {
      // The person is not logged into your app or we are unable to tell.

      fbButton.innerHTML = '登入'
      fbButton.removeEventListener('click', buttonLogout)
      fbButton.addEventListener('click', buttonInit)
      loginPageFunc.innerHTML = ''

    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState() {
    console.log('step 3: 確認使用者登入狀態')
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response)
    })
  }

  function fbSDK (){
    // make sure SDK is loaded.
    // https://www.nivas.hr/blog/2016/10/29/proper-way-include-facebook-sdk-javascript-jquery/

    $.ajax({
      url: '//connect.facebook.net/en_US/sdk.js',
      dataType: 'script',
      cache: true,
      success:function() {
        console.log('step 1: 確保 SDK 已經載入完成')
        FB.init({
          appId  : '326735094614431',
          xfbml  : true,
          version: 'v2.8'
        },
        console.log('step 2: FB 物件存在，所以初始化'))
        checkLoginState()
      }
    })
  }


  function saveToken (fbToken) {
    Cookies.set('buy-user-token', fbToken);
    console.log('拿到使用者token，存到 cookie中')
  }


  // POST, API
  // 更新或建立新 token / Update or insert a new tokenPOST/token
  function api_token (userToken, data){

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
        console.log('token', response)
        // 執行 get.user data
        api_user(userToken, '')
      }
    })

    $.ajax(settings).fail(function (jqXHR, textStatus, errorThrown) {
      console.log('userToken: ' + errorThrown)
    })
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

    $.ajax(settings).done(function (response) {
      if (response.result === true) {
        console.log('api_user: Success ', response);
        
        let userPhoto = response.response.avatar
        let userName = response.response.name
        userLoginSuccess(userName, userPhoto, checkSituation)
      }
    })

    $.ajax(settings).fail(function (response) {
      console.log('api_user: Fail ', response)
      fbButton.innerHTML = '登入' // 未登入的初始畫面
      fbSDK()
    })
  }

  function userLoginSuccess(userName, userPhoto, callback){

    if( typeof callback === 'function' ) {
      callback(userName, userPhoto)
    }

  }


  function checkSituation(userName, userPhoto) {
    
    let hrefNow = window.location.href
    // 根目錄 or 服務首頁
    let hrefOrigin = window.location.origin
    let hrefSeller = hrefOrigin + '/seller/index.html'
    let hrefBuyer = hrefOrigin + '/buyer/index.html'
    
    if ( hrefNow === hrefOrigin || hrefNow === hrefOrigin + '/index.html') {
      console.log('現在是在首頁')
      let functions = `
      <div class="loginPage__user">
        <div class="loginPage__user__photoBox">
          <img src="${ userPhoto }" alt="${ userName }" class="loginPage__user__photo">
        </div>
        <p class="loginPage__user__name">${ userName } 登入中</p>
      </div>
      <div class="loginPage__function">
        <a href="buyer/index.html" class="buttonBig loginPage__function__buyer">
          <i class="fas fa-cart-plus fa-fw"></i>
          Buy Something
        </a>
        <a href="seller/index.html" class="buttonBig loginPage__function__seller">
          <i class="fas fa-hand-holding-usd fa-fw"></i>
          Sell Something
        </a>
      </div>
    `
    loginPageFunc.innerHTML = functions

  } else if ( hrefNow === hrefSeller ) {

    console.log('現在是賣家頁面')

    let functions = `
      <div class="loginPage__user">
        <div class="loginPage__user__photoBox">
          <img src="${ userPhoto }" alt="${ userName }" class="loginPage__user__photo">
        </div>
        <p class="loginPage__user__name">${ userName }</p>
      </div>
      `
      loginPageFunc.innerHTML = functions
  
  } else if ( hrefNow === hrefBuyer ) {
    console.log('現在是買家頁面')
  } else {
    // 外網
  }

  console.log(hrefNow, hrefSeller)
  fbButton.innerHTML = '<div class="buttonSmall buttonLogout">登出</div>'
  fbButton.removeEventListener('click', buttonInit)
  fbButton.addEventListener('click', buttonLogout)
  }

});