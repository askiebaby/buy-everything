((lightBox, API) => {
  let userToken = Cookies.get('buy-user-token')
  console.log('Global: ', userToken)
  let server = 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space'

  // domain
  let hrefNow = window.location.href
  let hrefRealOrigin = window.location.origin
  let hrefOrigin = hrefRealOrigin + '/'
  let isHome = (hrefNow === hrefOrigin || hrefNow === hrefRealOrigin || hrefNow === hrefOrigin + 'index.html')

  $(document).ready(function () {

   
    // login
    let fbButton = document.querySelector('.loginButton')

    // main global variables
    let contentHeader = document.querySelector('.contentHeader')
    let contentBody = document.querySelector('.contentBody')
    let loginPageFunc = document.querySelector('.loginPage__login__func')




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
          api_get_user()
        } else {
          fbSDK('login')
          fbButton.addEventListener('click', buttonInit)
        }
      },
      error: function () {
        console.log('user 檢驗錯誤')
      }
    })


    // 賣家登入後的預設畫面
    function sellerInit() {

      // 結束直播後把新增商品按鈕放回來
      let addButtonContainer = document.querySelector('.addButton__container')
      console.log(addButtonContainer,addButtonContainer.innerHTML)

      if (addButtonContainer.innerHTML === '') {
        addButtonContainer.innerHTML = `<button class="addButton"><i class="fas fa-plus"></i></button>`
      }

      let addForm = `
        <form action="${ server }/api/items" class="productForm" name="productForm" enctype="multipart/form-data" method="POST">
          <h3><span>新增商品</span></h3>
          <!-- 商品照片 -->
          <div class="lightBox__layout__vertical">
            <div>
              <label for="addForm__photo" class="addForm__photoFake">
                <span>選擇圖片</span>
                <img src="https://fakeimg.pl/150x150" alt="上傳圖片" class="addForm__photoPreview" alt="請上傳圖片">
              </label>
              <input type="file" id="addForm__photo" class="addForm__photo" name="files" accept="image/gif, image/jpeg, image/png">
            </div>
            <div>
              <div class="lightBox__breakBox">
              <!-- 商品名稱 -->
                <label for="addForm__name">商品名稱</label>
                <input type="text" class="addForm__name" id="addForm__name" placeholder="必填" required>
              </div>
              <div class="lightBox__breakBox">
                <!-- 規格名稱 -->
                <label for="addForm__spec">規格說明</label>
                <input type="text" class="addForm__spec" id="addForm__spec" placeholder="必填" required>
              </div>
              <div class="lightBox__breakBox">
                <!-- 販售數量 -->
                <label for="addForm__amount">販售數量</label>
                <input type="number" min="1" class="addForm__amount" id="addForm__amount" placeholder="必填" required>

                <!-- 成本 -->
                <label for="addForm__cost">成本</label>
                <input type="number" min="1" class="addForm__cost" id="addForm__cost" placeholder="選填">

                <!-- 價格 -->
                <label for="addForm__price">價格</label>
                <input type="number" min="1" class="addForm__price" id="addForm__price" placeholder="必填" required>
              </div>
            </div>
          </div>
          <input type="submit" value="送出" class="addForm__submit">
        </form>
      `

      let addButton = document.querySelector('.addButton')

      addButton.addEventListener('click', function () {
        // callback
        lightBox.open(addForm, true)

        let photoReal = document.getElementById('addForm__photo')
        photoReal.addEventListener('change', function () {
          preview_image(event)
        })

        let productForm = document.forms.namedItem('productForm')

        productForm.addEventListener('submit', function (event) {
          api_post_items(event, productForm)
        })

      })

    }

    /*---------------------- 
    Facebook login API and functions
    -----------------------*/

    // 登入：賦予按鈕登入事件
    function buttonInit() {
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
    function buttonLogout() {
      fbSDK('logout')
    }

    // This is called with the results from from FB.getLoginStatus().
    function statusChangeCallback(response, action) {
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
          let userTokenExpiresInString = JSON.stringify({
            'expiresIn': userTokenExpiresIn
          })
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
      } else {
        checkSituation('logout')
      }
    }

    // This function is called when someone finishes with the Login
    // Button.  See the onlogin handler attached to it in the sample
    // code below.
    function checkLoginState(action) {
      console.log('step 3: 確認使用者登入狀態')
      FB.getLoginStatus(function (response) {
        statusChangeCallback(response, action)
      })
    }

    function fbSDK(action) {
      // make sure SDK is loaded.
      // https://www.nivas.hr/blog/2016/10/29/proper-way-include-facebook-sdk-javascript-jquery/

      $.ajax({
        url: '//connect.facebook.net/en_US/sdk.js',
        dataType: 'script',
        cache: true,
        success: function () {
          console.log('step 1: 確保 SDK 已經載入完成')
          FB.init({
              appId: '326735094614431',
              xfbml: true,
              version: 'v2.8'
            },
            console.log('step 2: FB 物件存在，所以初始化'))
          checkLoginState(action)
        }
      })
    }


    function checkSituation(action, userName, userPhoto) {

      let hrefSeller = hrefOrigin + 'seller/index.html'
      let hrefBuyer = hrefOrigin + 'buyer/index.html'
      let functions

      if (isHome) {
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

      } else if (hrefNow === hrefSeller) {

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
          api_get_items('init')
        }

      } else if (hrefNow === hrefBuyer) {

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

    function saveToken(fbToken) {
      Cookies.remove('buy-user-token')
      Cookies.set('buy-user-token', fbToken)
      userToken = Cookies.get('buy-user-token')
      console.log('saveToken: ', fbToken)
    }


    /*---------------------- 
    Product Functions
    -----------------------*/

    // 商品圖片預覽
    function preview_image(event) {
      // 多個檔案的做法
      // https://www.html5rocks.com/zh/tutorials/file/dndfiles/
      let files = value = event.target.files[0] // FileList object
      let preview = document.querySelector('.addForm__photoPreview')
      let reader = new FileReader()

      // Closure to capture the file information.
      reader.onload = (function (theFile) {
        return function (e) {
          // Render thumbnail.
          preview.setAttribute('src', e.target.result)
          preview.setAttribute('title', theFile.name)
        }
      })(files)

      // Read in the image file as a data URL.
      reader.readAsDataURL(files)
    }

    // 修改商品 UI
    function editProduct(item, callback) {
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
      <h3><span>修改商品</span></h3>
      <!-- 商品照片 -->
      <div class="lightBox__layout__vertical">
        <div>
          <label for="addForm__photo" class="addForm__photoFake">
            <span>修改圖片</span>
            <img src="${ updatePhoto }" alt="修改圖片" class="addForm__photoPreview">
          </label>
          <input type="file" id="addForm__photo" class="addForm__photo" name="files" accept="image/gif, image/jpeg, image/png">
        </div>
        <div>
          <div class="lightBox__breakBox">
          <!-- 商品名稱 -->
            <label for="addForm__name">商品名稱</label>
            <input type="text" class="addForm__name" id="addForm__name" placeholder="必填" value="${ updateName }" required>
          </div>
          <div class="lightBox__breakBox">
            <!-- 規格名稱 -->
            <label for="addForm__spec">規格說明</label>
            <input type="text" class="addForm__spec" id="addForm__spec" placeholder="必填" value="${ updateDescription }" required>
          </div>
          <div class="lightBox__breakBox">
            <!-- 販售數量 -->
            <label for="addForm__amount">販售數量</label>
            <input type="number" min="1" class="addForm__amount" id="addForm__amount" placeholder="必填" value="${ updateAmount }" required>

            <!-- 成本 -->
            <label for="addForm__cost">成本</label>
            <input type="number" min="1" class="addForm__cost" id="addForm__cost" placeholder="選填" value="${ updateCost }">
        
            <!-- 價格 -->
            <label for="addForm__price">價格</label>
            <input type="number" min="1" class="addForm__price" id="addForm__price" placeholder="必填" value="${ updatePrice }" required>
          </div>
        </div>
      </div>
      <input type="submit" value="送出" class="addForm__submit">
    </form>
      `
      lightBox.open(updateForm, true)

      // console.log(callback, updateName, updateDescription, updateAmount, updateCost, updatePrice, updatePhoto, key)

      let photoReal = document.getElementById('addForm__photo')
      photoReal.addEventListener('change', function () {
        preview_image(event)
      })

      callback(key, updateForm)

    }

    function listenUpdateProduct(key, form) {

      let updateProductForm = document.querySelector('.productForm')

      updateProductForm.addEventListener('submit', function (event) {
        api_update_items(event, key, form)
      })
    }

    /*---------------------- 
    Streaming Functions
    -----------------------*/

    // 詢問直播
    function askForStreamUrl() {
      let streamInput = `
        <form type="post" class="streamForm" name="streamForm">
          <h3><span>輸入您的直播網址</span></h3>
          <div class="lightBox__breakBox lightBox__url">
            <label for="streamUrl__input">直播網址</label>
            <input type="text" placeholder="例如：https://www.facebook.com/your-id/videos/397282194432699/" class="streamUrl__input" id="streamUrl__input">
            <label for="streamUrl__description">直播說明</label>
            <textarea type="text" placeholder="介紹一下這場直播吧！" class="streamUrl__description" id="streamUrl__description" rows="4"></textarea>
            </div>
            <input type="button" value="送出" class="addForm__submit">
        </form>
      `
      lightBox.open(streamInput, true)

      let submit = document.querySelector('.addForm__submit')
      submit.addEventListener('click', api_post_channel)

    }

    // 渲染賣家直播畫面
    function continueStream(url, token, id, description) {
      lightBox.close()

      if (isHome) {
        window.location.assign(hrefOrigin + 'seller/index.html')
      } else {
        let streamHeader = `
        直播包廂：${ token }<span class="buttonSmall buttonCallToAction stopStreaming" data-key="${ id }">結束直播</span>
        <div class="contentHeader__description">
        <div>直播說明</div>
        ${ description }</div>
        `
        let streamUI = `
        <div class="streamContainer">
          <div class="stream__frame">
            <div id="fb-root"></div>
            <div class="fb-video"
              data-href="${ url }"
              data-width="auto"
              data-show-text="false"
              data-autoplay="true"></div>
          </div>
          <div class="stream__products"></div>
        </div>
        `

        let addButton = document.querySelector('.addButton')
        addButton.remove()

        contentHeader.firstElementChild.innerHTML = streamHeader
        contentBody.innerHTML = streamUI

        // 正在直播
        startStreamingButtonsStatus(false)

        videoSdk(document, 'script', 'facebook-jssdk')
        api_get_items('stream')
      }
    }

    function addStreamItem(data) {
      let onAirBox = document.querySelector('.stream__onAir')

      let streamItem = `
        <div class="contentBody__product stream__product" data-key="${ data.key }">
        <span class="stream__status">On Air</span>
        <img src="${ data.photo }" alt="${ data.name }" class="contentBody__product__photo stream__product__photo">
        <div class="stream__product__mainInfo">
          <div class="contentBody__product__name stream__product__name">${ data.name }</div>
          <span class="contentBody__product__price stream__product__price">$ <span class="price">${ data.unit_price }</span></span>
          <span class="contentBody__product__amount">（數量：<span class="amount">${ data.stock }</span></span>
          <span class="contentBody__product__cost">成本：$ <span class="cost">${ data.cost }</span>）</span>
        </div>
        <div class="contentBody__product__spec stream__product__spec">
          <span class="spec">${ data.description }</span>
        </div>
      </div>
      `
      onAirBox.innerHTML = streamItem
    }

    function videoSdk(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8";
      fjs.parentNode.insertBefore(js, fjs);
    }

    function stopStream() {
      console.log('已經結束直撥啦！開始渲染！')
    }

    function startStreamingButtonsStatus(status) {
      let startStreamingButtons = document.querySelectorAll('.startStreaming')
      let stopStreamingButtons = document.querySelectorAll('.stopStreaming')

      if (!status) {
        for (let i = 0; i < startStreamingButtons.length; i++) {
          startStreamingButtons[i].removeEventListener('click', askForStreamUrl)
          startStreamingButtons[i].classList.add('disabled')
        }
        // 因為樣板代入才有結束直播按鈕，所以再取一次
        for (let i = 0; i < stopStreamingButtons.length; i++) {
          stopStreamingButtons[i].addEventListener('click', api_put_usersChannelId)
        }
      } else {
        for (let i = 0; i < startStreamingButtons.length; i++) {
          startStreamingButtons[i].addEventListener('click', askForStreamUrl)
          startStreamingButtons[i].classList.remove('disabled')
        }
      }
    }



    /*---------------------- 
    User API
    -----------------------*/

    // API, GET 取得User資訊 
    // get user information
    function api_get_user() {

      API.GET('/api/users')
        .done(function (response) {
          if (response.result === true) {
            // console.log('api_get_user: Success ', response)
            let userPhoto = response.response.avatar
            let userName = response.response.name
            checkSituation('login', userName, userPhoto)
            api_get_userStatus('init')
          }
        })

        .fail(function (response) {
          console.log('api_get_user: Fail ', response.responseText)
          fbButton.innerHTML = '登入' // 未登入的初始畫面

          fbSDK('login')
          fbButton.addEventListener('click', buttonInit)

          if (hrefNow !== hrefOrigin) {
            window.location.assign(hrefOrigin)
          }
        })
    }

    // API, POST 更新或建立新 token
    // Update or insert a new tokenPOST/token
    function api_post_user(userToken, data) {

      let userData = {
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
          if (response.result === true) {
            api_get_user()
          }
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }


    /*---------------------- 
    Product API
    -----------------------*/

    // API, GET 取得已建立商品資訊
    // Get uploaded items information
    function api_get_items(action) { //分情境

      API.GET('/api/items')
        .done(function (response) {
          let productList = response.response
          let productAmountContainer = document.querySelector('.contentHeader__amountBox')

          let productListContainer

          let item = '<div class="stream__onAir"></div>',
            productAmount = 0

          if (productList.length !== 0) {
            for (let i = 0; i < productList.length; i++) {
              let id = productList[i].id
              let name = productList[i].name
              let cost = productList[i].cost
              let description = productList[i].description
              let stock = productList[i].stock
              let unit_price = productList[i].unit_price
              let photo = productList[i].images

              if (action === 'init') {
                // 商品列表標題
                if (contentHeader) contentHeader.firstElementChild.innerHTML = `
                  賣家商品列表<span class="buttonSmall buttonCallToAction startStreaming">開始直播</span>`

                // 商品列表
                productListContainer = contentBody
                item += `
                <div class="contentBody__product" data-key="${ id }">
                  <img src="${ photo }" alt="${ name }" class="contentBody__product__photo">
                  <div class="contentBody__product__name">${ name }</div>
                  <span class="contentBody__product__amount">數量：<span class="amount">${ stock }</span></span>
                  <span class="contentBody__product__cost">成本：$ <span class="cost">${ cost }</span></span>
                  <div class="contentBody__product__spec">
                    <div class="contentBody__product__spec__title">商品敘述</div>
                    <span class="spec">${ description }</span>
                  </div>
                  <span class="contentBody__product__price">$ <span class="price">${ unit_price }</span></span>
                  <div class="contentBody__product__function">
                    <span class="contentBody__product__update">修改</span>
                    <span class="contentBody__product__delete">刪除</span>
                  </div>
                </div>
                `
                productAmount++

                if (!isHome) {
                  productListContainer.innerHTML = item
                  productAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ productAmount } </span>項`

                  // 共同父層
                  let myItem = document.querySelectorAll('.contentBody__product')
                  for (let i = 0; i < myItem.length; i++) {
                    // 更新
                    let productUpdate = myItem[i].querySelector('.contentBody__product__update')

                    productUpdate.addEventListener('click', function () {
                      editProduct(myItem[i], listenUpdateProduct)
                    })

                    // 刪除
                    let productDelete = myItem[i].querySelector('.contentBody__product__delete')
                    productDelete.addEventListener('click', function () {
                      api_delete_items(myItem[i])
                    })
                  }
                }
                startStreamingButtonsStatus(true)

              } else if (action === 'stream') {
                // 直播產品列表
                productListContainer = document.querySelector('.stream__products')

                item += `
                <div class="contentBody__product stream__product" data-key="${ id }">
                  <img src="${ photo }" alt="${ name }" class="contentBody__product__photo stream__product__photo">
                  <div class="contentBody__product__function stream__product__function">
                    <span class="contentBody__product__push">推播</span>
                  </div>
                  <div class="stream__product__mainInfo">
                    <div class="contentBody__product__name stream__product__name">${ name }</div>
                    <span class="contentBody__product__price stream__product__price">$ <span class="price">${ unit_price }</span></span>
                    <span class="contentBody__product__amount">（數量：<span class="amount">${ stock }</span></span>
                    <span class="contentBody__product__cost">成本：$ <span class="cost">${ cost }</span>）</span>
                  </div>
                  <div class="contentBody__product__spec stream__product__spec">
                    <span class="spec">${ description }</span>
                  </div>
                </div>
                `
                productAmount++

                if (!isHome) {
                  productListContainer.innerHTML = item
                  productAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ productAmount } </span>項`

                  // 共同父層
                  let myItem = document.querySelectorAll('.contentBody__product')

                  for (let i = 0; i < myItem.length; i++) {
                    // 推播
                    let productPush = myItem[i].querySelector('.contentBody__product__push')

                    productPush.addEventListener('click', function () {
                      let key = myItem[i].dataset.key
                      let name = myItem[i].querySelector('.stream__product__name').textContent
                      let photo = myItem[i].querySelector('.stream__product__photo').src
                      let unit_price = myItem[i].querySelector('.price').textContent
                      let stock = myItem[i].querySelector('.amount').textContent
                      let cost = myItem[i].querySelector('.cost').textContent
                      let description = myItem[i].querySelector('.spec').textContent
                      let pushItemData = {
                        key: key,
                        name: name,
                        photo: photo,
                        unit_price: unit_price,
                        stock: stock,
                        cost: cost,
                        description: description
                      }

                      api_post_streamingItems(pushItemData)
                    })
                  }
                }
                startStreamingButtonsStatus(false)
              }
            }



          } else {

            item = '您尚未新增商品。'
            startStreamingButtonsStatus(false)

          }


        })

        .fail(function (response) {
          console.log('api_get_items: Fail ', response.responseText)
        })
    }

    // API, POST 建立商品
    // Add new items
    function api_post_items(event, form) {

      event.preventDefault()

      let name = document.querySelector('.addForm__name').value
      let description = document.querySelector('.addForm__spec').value
      let stock = document.querySelector('.addForm__amount').value
      let cost = document.querySelector('.addForm__cost').value
      let unit_price = document.querySelector('.addForm__price').value
      let images = $('.addForm__photo')[0].files[0]

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
          lightBox.close()
          api_get_items('init')
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }

    // API, POST 更新已建立商品
    // update uploaded items
    function api_update_items(event, key, form) {

      event.preventDefault()

      let formData = new FormData(form)

      let name = document.querySelector('.addForm__name').value
      let description = document.querySelector('.addForm__spec').value
      let stock = document.querySelector('.addForm__amount').value
      let cost = document.querySelector('.addForm__cost').value
      let unit_price = document.querySelector('.addForm__price').value

      // 若使用者有上傳圖片，再綁進資料裡
      let images = $('.addForm__photo')[0].files[0]
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
          lightBox.close()
          api_get_items('init')
        })

        .fail(function (res) {
          console.log('fail', res.responseText)
        })
    }

    // API, DELETE 刪除已建立商品
    // Delete uploaded items
    function api_delete_items(item) {

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
          api_get_items('init')
        })

        .fail(function (res) {
          console.log('fail', res.responseText)
        })
    }


    /*---------------------- 
    Streaming API
    -----------------------*/

    // API, GET 取得使用者狀態
    // GET USER STATUS
    function api_get_userStatus(action, productId) {

      API.GET('/api/user-status')
        .done(function (response) {
          console.log('api_get_userStatus: Success', response)
          if (response.result === true) {
            let url = response.response.iFrame
            let channelToken = response.response.channel_token
            let isInChannel = response.response.host
            let channelDescription = response.response.channel_description
            if (action === 'stream') {
              continueStream(url, channelToken, productId, channelDescription)
            } else if (action === 'init') {
              let alertMsg = `
            <h3><span>您似乎未正確結束直播</span></h3>
            <div class="lightBox__centerBox">
              <span class="buttonSmall buttonNormal continueStreaming">繼續直播</span>
              <span class="buttonSmall buttonCallToAction stopStreaming">結束直播</span>
            </div>
            `
              lightBox.open(alertMsg, false)

              let continueStreamBtn = document.querySelector('.continueStreaming')

              continueStreamBtn.addEventListener('click', function () {
                continueStream(url, channelToken, isInChannel, channelDescription)
                // startStreamingButtonsStatus(false)
              })
            }

          } else {
            api_get_items('init')
          }

        })

        .fail(function (res) {
          console.log('api_get_userStatus: Fail', res.responseText)
        })
    }

    // API, POST 開始直播
    // START A LIVE-STREAM
    function api_post_channel() {

      let streamUrl = document.querySelector('.streamUrl__input').value
      let streamDescription = document.querySelector('.streamUrl__description').value

      let streamData = {
        'url': `${ server }/api/channel`,
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        },
        'data': JSON.stringify({
          'iFrame': streamUrl,
          'channel_description': streamDescription
        })
      }

      $.ajax(streamData)
        .done(function (response) {
          if (response.result === true) {
            lightBox.close()
            let productId = response.response.channel_id
            api_get_userStatus('stream', productId)
          }
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }

    // API, POST 推播商品
    // STREAM AN ITEM
    function api_post_streamingItems(data) {
      let streamItemData = {
        'url': `${ server }/api/streaming-items/${ data.key }`,
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        }
      }

      $.ajax(streamItemData)
        .done(function (response) {
          if (response.result === true) {
            console.log('push了')
            // 記得改買家的 data 不傳 cost
            api_get_streamingItem(data)
          }
        })

        .fail(function (response) {
          console.log('api_post_streamingItems: Fail ' + response.responseText)
          fbSDK('login')
        })
    }

    // 取得推播中商品資訊
    // Get streaming item's information
    function api_get_streamingItem(data) {

      API.GET('/api/streaming-items')
        .done(function (response) {
          console.log('api_get_streamingItem: Success', response)
          addStreamItem(data)
        })

        .fail(function (res) {
          console.log('api_get_streamingItem: Fail', res.responseText)
        })
    }

    // API, PUT 結束直播
    function api_put_usersChannelId() {
      let usersChannelData = {
        'url': `${ server }/api/users-channel-id`,
        'method': 'PUT',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        }
      }

      $.ajax(usersChannelData)
        .done(function (response) {
          if (response.result === true) {
            console.log(response)
            lightBox.close()
            stopStream()
            api_get_items('init')

            sellerInit()
          }
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }

  })
})(lightbox, API)