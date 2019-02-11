$( document ).ready(function() {

  // 初始畫面
  let userToken = Cookies.get('buy-user-token')
  console.log('Global: ', userToken)
  let fbButton = document.querySelector('.loginButton')
  let loginPageFunc = document.querySelector('.loginPage__login__func')
  let server = 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space'
  // let server = 'https://5a31303f.ngrok.io'
  
  fbButton.innerHTML = '確認登入狀態中...'
  
  // 檢驗 token 是否存在
  // => 存在則送驗
  // ====> 有效 => 載入使用者狀態及可使用的功能
  // ====> 無效 => 背景重新存取 token
  // => 不存在需要使用者登入及授權


// 首先先確定 cookie 在不在

  $.ajax({
    url: '//cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js',
    dataType: 'script',
    success: function () {

      // 驗 token 是否有效
      if (userToken) {
        api_get_user(userToken, '')
      } else {
        fbSDK('login')
        fbButton.addEventListener('click', buttonInit)
      }
    },
    error: function (){
      console.log('user 檢驗錯誤')
    }
  })

  // 登入：賦予按鈕登入事件
  function buttonInit () {
    console.log('login click')
    FB.login(function (response) {
      if (response.authResponse) {
          statusChangeCallback(response, 'login')
      } else {
        console.log('User cancelled login or did not fully authorize.')
      }
    })
  }

  // 登出
  function buttonLogout () {
    fbSDK('logout')
  }


  // This is called with the results from from FB.getLoginStatus().
  function statusChangeCallback (response, action) {
    console.log('step 4: statusChangeCallback is called!', response)
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === 'connected') {
      console.log('step 4.1: statusChangeCallback: connected')
      // Logged into your app and Facebook.
      // cookies
      if (action === 'login') {

        let userToken = response.authResponse.accessToken
        let userTokenExpiresIn = response.authResponse.expiresIn
        let userTokenExpiresInString = JSON.stringify({'expiresIn': userTokenExpiresIn})
        console.log('statusChangeCallback: ', userToken)
        saveToken(userToken)
        api_post_user(userToken, userTokenExpiresInString)

      } else if (action === 'logout') {

        console.log('你登出了')
        checkSituation('logout')
        Cookies.remove('buy-user-token')

        FB.logout(function (response) {
          // user is now logged out
          console.log(response)
        })
        
      }
    } 
    else {
      checkSituation('logout')
    }
  }

  // This function is called when someone finishes with the Login
  // Button.  See the onlogin handler attached to it in the sample
  // code below.
  function checkLoginState(action) {
    console.log('step 3: 確認使用者登入狀態')
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response, action)
    })
  }

  function fbSDK (action){
    // make sure SDK is loaded.
    // https://www.nivas.hr/blog/2016/10/29/proper-way-include-facebook-sdk-javascript-jquery/

    $.ajax({
      url: '//connect.facebook.net/en_US/sdk.js',
      dataType: 'script',
      cache: true,
      success: function () {
        console.log('step 1: 確保 SDK 已經載入完成')
        FB.init({
          appId  : '326735094614431',
          xfbml  : true,
          version: 'v2.8'
        },
        console.log('step 2: FB 物件存在，所以初始化'))
        checkLoginState(action)
      }
    })
  }

  function saveToken (fbToken) {
    Cookies.remove('buy-user-token')
    Cookies.set('buy-user-token', fbToken)
    userToken = Cookies.get('buy-user-token')
    console.log('saveToken: ', fbToken)
  }

  function checkSituation (action, userName, userPhoto) {
    
    let hrefNow = window.location.href
    // 根目錄 or 服務首頁
    let hrefOrigin = window.location.origin + '/'
    let hrefSeller = hrefOrigin + 'seller/index.html'
    let hrefBuyer = hrefOrigin + 'buyer/index.html'
    let functions
    console.log(hrefNow, hrefOrigin)
    
    if (hrefNow === hrefOrigin || hrefNow === hrefOrigin + 'index.html') {
      console.log('現在是在首頁')

      if (action === 'logout') {
        functions = ''
        fbButton.innerHTML = '登入'
        fbButton.removeEventListener('click', buttonLogout)
        fbButton.addEventListener('click', buttonInit)

      } else if (action === 'login') {

        functions = `
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

        fbButton.innerHTML = '<div class="buttonSmall buttonLogout">登出</div>'
        fbButton.removeEventListener('click', buttonInit)
        fbButton.addEventListener('click', buttonLogout)

      }

      loginPageFunc.innerHTML = functions

    } else if ( hrefNow === hrefSeller ) {

        console.log('現在是賣家頁面')

        if (action === 'logout') {
          window.location.assign(hrefOrigin)
        } else if (action === 'login') {

          sellerInit()

          let functions = `
            <div class="loginPage__user">
              <div class="loginPage__user__photoBox">
                <img src="${ userPhoto }" alt="${ userName }" class="loginPage__user__photo">
              </div>
              <p class="loginPage__user__name">${ userName }</p>
            </div>
            `
            loginPageFunc.innerHTML = functions
            fbButton.innerHTML = '<div class="buttonSmall buttonLogout">登出</div>'
            fbButton.removeEventListener('click', buttonInit)
            fbButton.addEventListener('click', buttonLogout)
            api_get_items()
          }

    } else if ( hrefNow === hrefBuyer ) {

      console.log('現在是買家頁面')

      if (!boolean) {
        window.location.assign(hrefOrigin)
      } else {
        // do something
      }
    } else {
      // 外網
    }
  }

  // 賣家登入後的預設畫面
  function sellerInit (){

    let addProductForm = `
      <form action="${ server }/api/items" class="productForm" name="productForm" enctype="multipart/form-data" method="POST">
        <h3>新增商品</h3>
        <!-- 商品照片 -->
        <div class="lightBox__breakBox">
          <label for="addProduct__photo" class="addProduct__photoFake">
            <img src="https://fakeimg.pl/150x150" alt="上傳圖片" class="addProduct__photoPreview" alt="請上傳圖片">
          </label>
          <input type="file" id="addProduct__photo" class="addProduct__photo" name="files" accept="image/gif, image/jpeg, image/png">
        </div>
        <div class="lightBox__breakBox">
        <!-- 商品名稱 -->
          <label for="addProduct__name">商品名稱</label>
          <input type="text" class="addProduct__name" id="addProduct__name" placeholder="必填" required>
        </div>
        <div class="lightBox__breakBox">
          <!-- 規格名稱 -->
          <label for="addProduct__spec">規格說明</label>
          <input type="text" class="addProduct__spec" id="addProduct__spec" placeholder="必填" required>
        </div>
        <div class="lightBox__breakBox">
          <!-- 販售數量 -->
          <label for="addProduct__amount">販售數量</label>
          <input type="number" min="1" class="addProduct__amount" id="addProduct__amount" placeholder="必填" required>

          <!-- 成本 -->
          <label for="addProduct__cost">成本</label>
          <input type="number" min="1" class="addProduct__cost" id="addProduct__cost" placeholder="選填">

          <!-- 價格 -->
          <label for="addProduct__price">價格</label>
          <input type="number" min="1" class="addProduct__price" id="addProduct__price" placeholder="必填" required>
        </div>
        <input type="submit" value="送出" class="addProduct__submit">
      </form>
    `

    let addButton = document.querySelector('.addButton')

    addButton.addEventListener('click', function(){
      // callback
      lightBox(addProductForm)

      let photoReal = document.getElementById('addProduct__photo')
      photoReal.addEventListener('change', function(){
        preview_image(event)
      })

      let productForm = document.forms.namedItem('productForm')

      productForm.addEventListener('submit', function(event){
        api_post_items(event, productForm)
      })

    })

  }

  // 商品圖片預覽
  function preview_image (event) {
    // 多個檔案的做法
    // https://www.html5rocks.com/zh/tutorials/file/dndfiles/
    let files = value = event.target.files[0] // FileList object
    let preview = document.querySelector('.addProduct__photoPreview')
    let reader = new FileReader()

    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        // Render thumbnail.
        preview.setAttribute('src',  e.target.result)
        preview.setAttribute('title',  theFile.name)
      }
    })(files)

    // Read in the image file as a data URL.
    reader.readAsDataURL(files)
  }

  function editProduct (item, callback) {
    // 原資料
    // let item = item
    let updateName = item.querySelector('.contentBody__product__name').textContent
    let updateDescription = item.querySelector('.spec').textContent
    let updateAmount = item.querySelector('.amount').textContent
    let updateCost = item.querySelector('.cost').textContent
    let updatePrice = item.querySelector('.price').textContent
    let updatePhoto = item.getElementsByTagName('img')[0].src

    let key = []
    key.push(item.dataset.key)


    let updateForm = `
    <form action="${ server }/api/items" class="productForm" name="productForm" enctype="multipart/form-data" method="POST">
    <h3>修改商品</h3>
    <!-- 商品照片 -->
    <div class="lightBox__breakBox">
      <label for="addProduct__photo" class="addProduct__photoFake">
        <img src="${ updatePhoto }" alt="上傳圖片" class="addProduct__photoPreview">
      </label>
      <input type="file" id="addProduct__photo" class="addProduct__photo" name="files" accept="image/gif, image/jpeg, image/png">
    </div>
    <div class="lightBox__breakBox">
    <!-- 商品名稱 -->
      <label for="addProduct__name">商品名稱</label>
      <input type="text" class="addProduct__name" id="addProduct__name" placeholder="必填" value="${ updateName }" required>
    </div>
    <div class="lightBox__breakBox">
      <!-- 規格名稱 -->
      <label for="addProduct__spec">規格說明</label>
      <input type="text" class="addProduct__spec" id="addProduct__spec" placeholder="必填" value="${ updateDescription }" required>
    </div>
    <div class="lightBox__breakBox">
      <!-- 販售數量 -->
      <label for="addProduct__amount">販售數量</label>
      <input type="number" min="1" class="addProduct__amount" id="addProduct__amount" placeholder="必填" value="${ updateAmount }" required>

      <!-- 成本 -->
      <label for="addProduct__cost">成本</label>
      <input type="number" min="1" class="addProduct__cost" id="addProduct__cost" placeholder="選填" value="${ updateCost }">
  
      <!-- 價格 -->
      <label for="addProduct__price">價格</label>
      <input type="number" min="1" class="addProduct__price" id="addProduct__price" placeholder="必填" value="${ updatePrice }" required>
    </div>
    <input type="submit" value="送出" class="addProduct__submit">
  </form>
    `
    lightBox(updateForm)

    // console.log(callback, updateName, updateDescription, updateAmount, updateCost, updatePrice, updatePhoto, key)

    callback(key, updateForm)
    console.log(key)
  }

  function listenUpdateProduct (key, form) {

    let updateProductForm = document.querySelector('.productForm')

    updateProductForm.addEventListener('submit', function(event){
      api_update_items(event, key, form)
    })
  }

  /*---------------------- 
  user
  -----------------------*/

  // API, GET
  // 取得User資訊 / get user information
  function api_get_user (userToken, data) {

    var userData = {
      'url': `${ server }/api/users`,
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`,
      },
      'data': data
    }

    $.ajax(userData)

      .done(function (response) {
        if (response.result === true) {
          console.log('api_get_user: Success ', response)
          let userPhoto = response.response.avatar
          let userName = response.response.name
          checkSituation('login', userName, userPhoto)
        }
      })

      .fail(function (response) {
        console.log('api_get_user: Fail ', response.responseText)
        fbButton.innerHTML = '登入' // 未登入的初始畫面
        fbSDK('login')
      })
  }

  // API, POST
  // 更新或建立新 token / Update or insert a new tokenPOST/token
  function api_post_user (userToken, data) {

    var userData = {
      'url': `${ server }/api/token`,
      'method': 'POST',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`,
      },
      'data': data
    }
    
    $.ajax(userData)
      .done(function (response) {
        if (response.result ===  true) {
          api_get_user(userToken, '')
        }
      })

      .fail(function (response) {
        console.log('api_post_user: Fail ' + response.responseText)
      })
  }


  /*---------------------- 
  product
  -----------------------*/

  // API, GET
  // 取得已建立商品資訊 / Get uploaded items information
  function api_get_items () {

    let productsData = {
      'url': `${ server }/api/items`,
      'method': 'GET',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`
      }
    }

    $.ajax(productsData)

      .done(function (response) {
        let productList = response.response
        let contentBody = document.querySelector('.contentBody')
        let productAmountContainer = document.querySelector('.contentHeader__amountBox')
        let item = '', productAmount = 0

        for (let i = 0; i < productList.length; i++) {
          let id = productList[i].id
          let name = productList[i].name
          let cost = productList[i].cost
          let description = productList[i].description
          let stock = productList[i].stock
          let unit_price = productList[i].unit_price
          let productPhoto = productList[i].images

          item += `
          <div class="contentBody__product" data-key="${ id }">
            <img src="${ productPhoto }" alt="${ name }" class="contentBody__product__photo">
            <div class="contentBody__product__name">${ name }</div>
            <span class="contentBody__product__amount">數量：<span class="amount">${ stock }</span></span>
            <span class="contentBody__product__cost">成本：$ <span class="cost">${ cost }</span></span>
            <div class="contentBody__product__spec">
              <div class="contentBody__product__spec__title">商品敘述</div>
              <span class="spec">${ description }</span>
            </div>
            <span class="contentBody__product__price">$ <span class="price">${ unit_price }</span></span>
            <span class="contentBody__product__update">修改</span>
            <span class="contentBody__product__delete">刪除</span>
          </div>
          `

          productAmount ++

        }

        contentBody.innerHTML = item
        productAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ productAmount } </span>項`

        // 共同父層
        let myItem = document.querySelectorAll('.contentBody__product')

        // console.log(myItem, myItem[0])

        for (let i = 0; i < myItem.length; i++) {

          // 更新
          let productUpdate = myItem[i].querySelector('.contentBody__product__update')

          productUpdate.addEventListener('click', function(){
            editProduct(myItem[i], listenUpdateProduct)
          })

          let productDelete = myItem[i].querySelector('.contentBody__product__delete')

          productDelete.addEventListener('click', function(){
            api_delete_items(myItem[i]) //key失效
          })

        }

        // 刪除

        // productDelete.addEventListener('click', function(){
        //   api_delete_items(myItem) //key失效
        // console.log(myItem)

        // })
      })

      .fail(function (response) {
        console.log('api_get_items: Fail ', response.responseText)
      })
  }

  // API, POST
  // 建立商品/Add new items
  function api_post_items (event, form){
    
    event.preventDefault()

    let name = document.querySelector('.addProduct__name').value
    let description = document.querySelector('.addProduct__spec').value
    let stock = document.querySelector('.addProduct__amount').value
    let cost = document.querySelector('.addProduct__cost').value
    let unit_price = document.querySelector('.addProduct__price').value
    let images = $('.addProduct__photo')[0].files[0]

    let formData = new FormData(form)

    formData.append('name', name)
    formData.append('description', description)
    formData.append('stock', stock)
    formData.append('cost', cost)
    formData.append('unit_price', unit_price)
    formData.append('images', images)

    let item = {
      'url': `${ server }/api/items`,
      'type': 'POST',
      'headers': {
        // 'Content-Type': 'multipart/form-data',
        // 使用 multipart/form-data 在此不需要設定 Content-Type。
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`,
      },
      'cache': false,
      'contentType': false, //required
      'processData': false, // required
      'mimeType': 'multipart/form-data',
      'data': formData
    }

    console.log(images)


    $.ajax(item)

      .done(function (response) {
        closeLightBox()
        api_get_items()
      })

      .fail(function (response) {
        console.log('api_post_user: Fail ' + response.responseText)
      })
  }

  // API, POST
  // 更新已建立商品/update uploaded items
  function api_update_items (event, key, form) {
    
    event.preventDefault()

    let formData = new FormData(form)

    let name = document.querySelector('.addProduct__name').value
    let description = document.querySelector('.addProduct__spec').value
    let stock = document.querySelector('.addProduct__amount').value
    let cost = document.querySelector('.addProduct__cost').value
    let unit_price = document.querySelector('.addProduct__price').value

    // 若使用者有上傳圖片，再綁進資料裡
    let images = $('.addProduct__photo')[0].files[0]
    images = (images) ? images : ''
    if (images) {
      formData.append('images', images)
    }
    
    formData.append('name', name)
    formData.append('description', description)
    formData.append('stock', stock)
    formData.append('cost', cost)
    formData.append('unit_price', unit_price)
    formData.append('_method', 'PATCH')

    let itemData = {
      'url': `${ server }/api/items/${ key }`,
      'method': 'POST',
      'headers': {
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`
      },
      'cache': false,
      'contentType': false, //required
      'processData': false, // required
      'mimeType': 'multipart/form-data',
      'data': formData
    }
    
    $.ajax(itemData)

      .done(function (res) {
        console.log('work', res)
        closeLightBox()
        api_get_items()
      })

      .fail(function (res) {
        console.log('fail', res.responseText)
      })
  }

  // API, DELETE
  // 刪除已建立商品/Delete uploaded items
  function api_delete_items (item) {

    let key = []
    key.push(item.dataset.key)

    let itemData = {
      'url': `${ server }/api/items`,
      'method': 'DELETE',
      'headers': {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Authorization': `Bearer ${ userToken }`
      },
      'data': JSON.stringify({
        items: key
      })
    }
    
    $.ajax(itemData)

      .done(function (res) {
        console.log('work', res)
        api_get_items()
      })

      .fail(function (res) {
        console.log('fail', res.responseText)
      })
  }

})