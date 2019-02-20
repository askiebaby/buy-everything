((lightBox, API) => {
  let userToken = Cookies.get('buy-user-token')
  let server = 'https://facebookoptimizedlivestreamsellingsystem.rayawesomespace.space'

  // personal info
  let userID, userName, userEmail, userPhoto, userPhone, host
  console.log('Global: ', userToken, host)
  let remainingQuantity

  // function
  const personalInfo = document.querySelector('.personalInfo')
  const addButtonContainer = document.querySelector('.addButton__container')
  const getItems = document.querySelector('.getItems')
  const streamHistory = document.querySelector('.streamHistory')
  const sellerOrders = document.querySelector('.sellerGetOrders')
  const buyerOrders = document.querySelector('.buyerGetOrders')

  // domain
  const hrefNow = window.location.href
  const hrefRealOrigin = window.location.origin
  const hrefOrigin = hrefRealOrigin + '/'
  const isHome = (hrefNow === hrefOrigin || hrefNow === hrefRealOrigin || hrefNow === hrefOrigin + 'index.html')

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



      // 結束直播後把新增商品按鈕放回來
      addProductInit(true, addForm)

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

      let hrefSeller = hrefOrigin + 'service/index.html'
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
            <a href="service/index.html" class="buttonBig loginPage__function__seller">
              <i class="fas fa-hand-holding-usd fa-fw"></i>
              買起來！賣起來！
            </a>
          </div>
          `

          fbButton.innerHTML = '<div class="buttonSmall buttonLogout">登出</div>'
          fbButton.removeEventListener('click', buttonInit)
          fbButton.addEventListener('click', buttonLogout)

        }

        loginPageFunc.innerHTML = functions

      } else if (hrefNow === hrefSeller) {

        // console.log('現在是服務頁面')

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
      } else {
        // 外網
        window.location.assign(hrefOrigin)
      }
    }

    function saveToken(fbToken) {
      Cookies.remove('buy-user-token')
      Cookies.set('buy-user-token', fbToken)
      userToken = Cookies.get('buy-user-token')
      console.log('saveToken: ', fbToken)
    }


    /*---------------------- 
    Personal Information Functions
    -----------------------*/

    //
    function getPersonalInfo() {

      let header = `
      <h2>買家 > 個人資料管理</h2>`
      let userInfo = `
        <h4 class="">個人資料</h4>
        <div class="contentBody__object" data-user-key="${ userID }">
          <img src="${ userPhoto }" alt="test" class="contentBody__object__photo">
          <div class="contentBody__object__name">${ userName }</div>
          <span class="contentBody__object__email"><span class="email">${ userEmail }</span></span>
          </span>
          <div class="contentBody__object__spec">
            <div class="contentBody__object__spec__title">手機號碼</div>
            <span class="spec">${ userPhone }</span>
          </div>
          <div class="contentBody__object__functionAbsolute">
            <span class="contentBody__object__update">修改</span>
          </div>
        </div>
        <h4>收件人資料 (最多五筆) <span class="buttonSmall buttonCallToAction addRecipient">新增收件人</span></h4>
        <div class="recipients">載入中...</div>
      `
      contentHeader.innerHTML = header
      contentBody.innerHTML = userInfo
      addProductInit(false) // 關閉新增商品按鈕
      api_get_recipients() // 取得收件人資料

      let addRecipientButton = document.querySelector('.addRecipient')
      addRecipientButton.addEventListener('click', addRecipient)
    }

    // 取得收件人資料，擺好
    function setRecipients(response) {
      let recipientsContainer = document.querySelector('.recipients')

      if (response.result === false) {
        recipientsContainer.innerHTML = `尚未新增收件人資料。`
      } else {
        // 有收件人資料時
        let recipient = response.response
        let recipientCard = ''
        for (let i = 0; i < recipient.length; i++) {
          recipientCard += `
            <div class="contentBody__object" data-recipient="${recipient[i].recipient_id}">
            <div class="contentBody__object__name">收件人姓名：${ recipient[i].name}</div>
            <div class="contentBody__object__spec contentBody__object__spec__contact">
              <div class="contentBody__object__spec__title">聯絡電話</div>
              <span class="spec">+${recipient[i].phone['phone_code']} ${recipient[i].phone.phone_number}</span>
              <div class="contentBody__object__spec__title">收貨地址</div>
              <span class="spec">[${recipient[i].address['post_code']}] ${recipient[i].address['city']}${recipient[i].address['district']}${recipient[i].address['others']}</span>
            </div>
            <div class="contentBody__object__functionAbsolute">
              <span class="contentBody__object__update">修改</span>
              <span class="contentBody__object__delete">刪除</span>
            </div>
          </div>
            `
        }

        recipientsContainer.innerHTML = recipientCard

        let deleteRecipient = document.querySelectorAll('.contentBody__object__delete')
        for (let i = 0; i < recipient.length; i++) {
          deleteRecipient[i].addEventListener('click', function () {
            let recipientKey = deleteRecipient[i].parentElement.parentElement.dataset.recipient
            api_delete_Recipient(recipientKey)
            // console.log('我按了刪除收件人 ' + recipientKey)
          })
        }
      }
    }

    function addRecipient() {
      let addForm = `
        <form action="" class="productForm" name="productForm" method="POST">
        <h3><span>新增收件人</span></h3>
        <!-- 收件人照片 -->
        <div class="lightBox__layout__vertical">
          <div class="lightBox__breakBox lightBox__flexBox">
          <!-- 收件人 -->
            <label for="addForm__realName">收件人姓名</label>
            <input type="text" class="addForm__realName" id="addForm__realName" placeholder="必填" required>
          </div>
          <div class="lightBox__breakBox lightBox__flexBox">
          <!-- 聯絡電話 -->
            <label for="addForm__phone">聯絡電話</label>
            <select class="country" required>
              <option selected disabled>請選擇國家</option>
            </select>
            <input type="tel" class="addForm__phone" id="addForm__phone" placeholder="例如：0980218800" required>
          </div>
          <div class="lightBox__breakBox lightBox__flexBox">
            <!-- 地址 -->
            <label for="addForm__spec">地址</label>
            <select class="city">
              <option selected disabled>請選擇縣市</option>
            </select>
            <select class="district" disabled>
              <option selected disabled>鄉鎮</option>
            </select>
            <input type="text" class="addForm__spec" id="addForm__spec" placeholder="必填" required>
          </div>
        </div>
        <input type="button" value="送出" class="addForm__submit">
      </form>
      `
      lightBox.open(addForm, true)

      api_get_taiwanPostCode()
      api_get_phoneCode()

      let submit = document.querySelector('.addForm__submit')

      submit.addEventListener('click', function () {
        api_post_recipients()
      })

    }

    function chooseRecipient() {
      // if ()
      lightBox.open(template, true)
    }
    // 篩縣市
    function filterCities(citiesArray) {
      let manyCities = citiesArray.response
      let taiwanCities = []
      let citySelect = document.querySelector('.city')
      let districtSelect = document.querySelector('.district')
      // 按照郵遞區號排好縣市
      manyCities = manyCities.sort(function (a, b) {
        return a.ZipCode > b.ZipCode ? 1 : -1
      })

      // 把不在 taiwanCities 的 縣市加進去
      // item 物件, index 索引, array 全部陣列
      manyCities.forEach(function (item, index, array) {
        let isCityExist = taiwanCities.indexOf(item['City'])
        if (isCityExist === -1) {
          taiwanCities.push(item['City'])
          let cityOption = document.createElement('OPTION')
          cityOption.innerHTML = item['City']
          cityOption.dataset.city = item['City']
          citySelect.appendChild(cityOption)
        }
      })


      citySelect.addEventListener('change', function () {
        // 清掉鄉鎮原本的選單內容，重放一次
        districtSelect.innerHTML = `<option selected disabled>鄉鎮</option>`
        filterArea(citySelect.value, manyCities, districtSelect)
      })

    }

    // 篩鄉鎮
    function filterArea(query, cities, selector) {
      return cities.filter(function (item, index, array) {
        if (item['City'] === query) {
          let districtOption = document.createElement('OPTION')
          districtOption.dataset.zipcode = item['ZipCode']
          districtOption.value = item['Area']
          districtOption.innerHTML = `${item['ZipCode']} ${item['Area']}`
          selector.appendChild(districtOption)
          selector.disabled = false
        }
      })
    }

    // 篩國碼
    function filterCountry(response) {
      let countrySelect = document.querySelector('.country')
      // 把不在 taiwanCities 的 縣市加進去
      // item 物件, index 索引, array 全部陣列
      response.forEach(function (item, index, array) {
        let countryOption = document.createElement('OPTION')
        countryOption.innerHTML = `${item['country']} (+${item['phone_code']})`
        countryOption.value = item['country']
        countryOption.dataset.country = item['country_code']
        countryOption.dataset.phone = item['phone_code']
        if (item['country'].indexOf('Taiwan') !== -1) {
          countryOption.selected = true
        }
        countrySelect.appendChild(countryOption)
      })
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
      let updateName = item.querySelector('.contentBody__object__name').textContent
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

    // 新增商品按鈕狀態
    function addProductInit(isInit, addForm) {

      if (!isHome) {
        if (isInit) {
          // 結束直播後把新增商品按鈕放回來
          if (addButtonContainer.innerHTML === '') {
            addButtonContainer.innerHTML = `<button class="addButton"><i class="fas fa-plus"></i></button>`
          }

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

        } else {
          let addButton = document.querySelector('.addButton')
          if (addButton) addButton.remove()
        }
      }

    }

    /*---------------------- 
    Streaming Functions
    -----------------------*/

    // 詢問直播網址
    function askForStreamUrl() {
      let streamInput = `
        <form type="POST" class="streamForm" name="streamForm">
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

    // 詢問直播id
    function askForStreamID() {

      let streamInput = `
        <form type="POST" class="streamForm" name="streamForm">
          <h3><span>輸入直播包廂ID（區分大小寫）</span></h3>
          <div class="lightBox__breakBox lightBox__url">
            <label for="streamID__input">直播ID</label>
            <span class="lightBox__errorMsg"></span>
            <input type="text" placeholder="例如：8uhiVL" class="streamID__input" id="streamID__input">
          </div>
          <input type="button" value="送出" class="addForm__submit">
        </form>
      `
      lightBox.open(streamInput, true)


      let submit = document.querySelector('.addForm__submit')
      submit.addEventListener('click', function (event) {
        api_patch_userChannelID(event)
      })

    }

    // 渲染買賣家直播畫面
    function continueStream(userStatus, callback) {
      let onAirBox = document.querySelector('.stream__onAir')
      let streamHeader, streamUI
      lightBox.close()

      if (isHome) {
        window.location.assign(hrefOrigin + 'service/index.html')
      } else {
        console.log(userStatus)
        switch (userStatus.host) {
          case 0:
            // 買家
            streamHeader = `
            <h2>
              親愛的買家：您正在直播包廂（${ userStatus.channelToken }）<span class="buttonSmall buttonCallToAction stopStreaming" data-key="${ userStatus.productId }">離開包廂</span>
              <div class="contentHeader__description">
              <div>直播說明</div>
              ${ userStatus.channelDescription }</div>
            </h2>
            `
            streamUI = `
            <div class="streamContainer">
              <div class="stream__frame">
                <div id="fb-root"></div>
                <div class="fb-video"
                  data-href="${ userStatus.url }"
                  data-width="auto"
                  data-show-text="false"
                  data-autoplay="true"></div>
              </div>
              <div class="stream__products">
                <div class="stream__onAir">
                  <div class="contentBody__object stream__product" data-key="">
                  <span class="stream__status">On Air</span>
                  <img src="" alt="" class="contentBody__object__photo stream__product__photo">
                  <div class="stream__product__mainInfo">
                    <div class="contentBody__object__name stream__product__name"></div>
                    <span class="contentBody__object__price stream__product__price">$ <span class="price"></span></span>
                    <span class="contentBody__object__amount">（已售數量：<span class="soldAmount"></span></span>
                    <span class="contentBody__object__cost">剩餘數量： <span class="remain"></span>）</span>
                  </div>
                  <div class="contentBody__object__spec stream__product__spec">
                    <span class="spec"></span>
                  </div>
                </div>
                </div><!-- stream__onAir end -->
                <div class="buyFormContainer"></div>
              </div>
            </div>
            `

            let buyForm = `
              <form name="buyForm" class="buyForm">
                <input type="button" class="buyForm__operator buyForm__minus" value="-">
                <span class="buyForm__totalContainer"><input type="number" class="buyForm__totalAmount" value="1" min="1"></span>
                <input type="button" class="buyForm__operator buyForm__add" value="+">
                <div class="buyForm__submitContainer"><input type="button" value="確認購買" class="buyForm__submit"></div>
              </form>`

            let buyFormContainer = document.querySelector('.buyFormContainer')

            // 如果是還在直播包廂時，點擊選單其他功能，
            // 而後來繼續直播，要能夠不重新渲染畫面。
            if(!onAirBox.firstElementChild){
              contentHeader.innerHTML = streamHeader
              contentBody.innerHTML = streamUI

              videoSdk(document, 'script', 'facebook-jssdk')
              api_get_streamingItem()
              buyFormContainer.innerHTML = buyForm
            }

            callback()
            break

          case 1:

            // 賣家
            console.log('賣家')
            streamHeader = `
            直播包廂：${ userStatus.channelToken }<span class="buttonSmall buttonCallToAction stopStreaming" data-key="${ userStatus.productId }">結束直播</span>
            <div class="contentHeader__description">
            <div>直播說明</div>
            ${ userStatus.channelDescription }</div>
            `
            streamUI = `
            <div class="streamContainer">
              <div class="stream__frame">
                <div id="fb-root"></div>
                <div class="fb-video"
                  data-href="${ userStatus.url }"
                  data-width="auto"
                  data-show-text="false"
                  data-autoplay="true"></div>
              </div>
              <div class="stream__products"></div>
            </div>
            `
            // 如果是還在直播包廂時，點擊選單其他功能，
            // 而後來繼續直播，要能夠不重新渲染畫面。
            if(!onAirBox.firstElementChild){
              contentHeader.firstElementChild.innerHTML = streamHeader
              contentBody.innerHTML = streamUI
              videoSdk(document, 'script', 'facebook-jssdk')
              api_get_items('stream', userStatus.host)
            }
            
            break
        }

        addProductInit(false)
        host = userStatus.host

        // 正在包廂
        startStreamingButtonsStatus(false)
      }
    }

    // 推播商品
    function pushStreamItem(data) {
      let onAirBox = document.querySelector('.stream__onAir')

      console.log(data)

      let streamItem = `
        <div class="contentBody__object stream__product" data-key="${ data.key }">
        <span class="stream__status">On Air</span>
        <img src="${ data.photo }" alt="${ data.name }" class="contentBody__object__photo stream__product__photo">
        <div class="stream__product__mainInfo">
          <div class="contentBody__object__name stream__product__name">${ data.name }</div>
          <span class="contentBody__object__price stream__product__price">$ <span class="price">${ data.unit_price }</span></span>
          <span class="contentBody__object__amount">（銷售數量：<span class="amount">${ data.soldQuantity }</span></span>
          <span class="contentBody__object__cost">剩餘數量： <span class="cost">${ data.remainingQuantity }</span>）</span>
        </div>
        <div class="contentBody__object__spec stream__product__spec">
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

    // 按鈕狀態
    function startStreamingButtonsStatus(status) {
      let watchStreamingButtons = document.querySelectorAll('.watchStreaming')
      let startStreamingButtons = document.querySelectorAll('.startStreaming')
      let stopStreamingButtons = document.querySelectorAll('.stopStreaming')

      if (!status) {

        // 買賣家在包廂中就不可以開或去另一個包廂
        // 包廂中，關閉按鈕功能
        for (let i = 0; i < startStreamingButtons.length; i++) {
          startStreamingButtons[i].removeEventListener('click', askForStreamUrl)
          startStreamingButtons[i].classList.add('disabled')
        }

        for (let i = 0; i < watchStreamingButtons.length; i++) {
          watchStreamingButtons[i].removeEventListener('click', askForStreamID)
          watchStreamingButtons[i].classList.add('disabled')
        }

        // 因為樣板代入才有結束直播按鈕，所以再取一次
        for (let i = 0; i < stopStreamingButtons.length; i++) {
          stopStreamingButtons[i].addEventListener('click', api_put_usersChannelId)
        }

      } else {

        // 離開包廂，開啟按鈕功能
        for (let i = 0; i < startStreamingButtons.length; i++) {
          startStreamingButtons[i].addEventListener('click', askForStreamUrl)
          startStreamingButtons[i].classList.remove('disabled')
        }

        for (let i = 0; i < watchStreamingButtons.length; i++) {
          watchStreamingButtons[i].addEventListener('click', askForStreamID)
          watchStreamingButtons[i].classList.remove('disabled')
        }

      }
    }

    // 買家要下單的樣板
    function productCalculator() {

      // console.log('productCalculator: '+remainingQuantity)

      let add = document.querySelector('.buyForm__add')
      let minus = document.querySelector('.buyForm__minus')
      let totalContainer = document.querySelector('.buyForm__totalContainer')
      let totalVal = totalContainer.querySelector('.buyForm__totalAmount').value
      let submit = document.querySelector('.buyForm__submit')
      // console.log('開始計算', add, minus, total, totalVal, remainingQuantity)

      add.addEventListener('click', function () {
        totalVal = parseInt(totalVal) + 1 // 轉型別
        // total.value = totalVal
        console.log(typeof totalVal, totalVal, total.value, '+1')
      })

      minus.addEventListener('click', function () {
        if (totalVal > 1) {
          totalVal = parseInt(totalVal) - 1 // 轉型別
          // total.value = totalVal
          console.log(typeof totalVal, totalVal, total.value, '-1')
        }
      })

      submit.addEventListener('click', chooseRecipient)

    }

    function URCtoLocalDate(UTCdate) {
      let UTC = new Date(UTCdate)
      return UTC.toLocaleString()
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
            console.log('api_get_user: ' + response)
            let user = response.response
            userID = user.user_id
            userPhoto = user.avatar
            userName = user.name
            userEmail = (user.email) ? user.email : '無法取得信箱'
            userPhone = (!user.phone) ? user.phone : '尚未填寫手機號碼'

            checkSituation('login', userName, userPhoto)
            api_get_userStatus('init', undefined, api_get_items)

            if (!isHome) {
              
              // 個人資料管理
              personalInfo.addEventListener('click', function() {
                api_get_userStatus('init', undefined, getPersonalInfo)
              })

              // 商品列表
              getItems.addEventListener('click', function() {api_get_userStatus('init', undefined, api_get_items)})

              // 賣家訂單管理
              sellerOrders.addEventListener('click', function() {
                api_get_userStatus('init', undefined, api_get_sellerOrders)
              })

              // 直播歷史紀錄
              streamHistory.addEventListener('click', function() {
                api_get_userStatus('init', undefined, api_get_streamHistory)
              })

              // buyerOrders.addEventListener('click', )
            }
          }
        })

        .fail(function (response) {
          console.log('api_get_user: Fail ', response)
          fbButton.innerHTML = '登入' // 未登入的初始畫面

          fbSDK('login')
          fbButton.addEventListener('click', buttonInit)
          // token 過期要重取，點擊登出按鈕才要登出
          if (response.responseJSON.response !== 'The token is invalid') {
            if (hrefNow !== hrefOrigin) {
              window.location.assign(hrefOrigin)
            }
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
          fbSDK('login')
        })
    }

    // API, GET 取得該使用者建立之收貨人地址
    // GET RECIPIENTS' INFORMATION UNDER A USER
    function api_get_recipients() {
      API.GET('/api/recipients')
        .done(function (response) {
          setRecipients(response)
        })
        .fail(function (response) {
          console.log(`api_get_recipients: Fail ${response}`)
        })
    }

    // 新增收貨人地址
    // ADD RECIPIENT'S ADDRESS 
    function api_post_recipients() {

      let recipientName = document.querySelector('.addForm__realName').value
      let phoneNumber = document.querySelector('.addForm__phone').value
      let city = document.querySelector('.city').value
      let district = document.querySelector('.district').value
      let others = document.querySelector('.addForm__spec').value

      // 取得 option 的 dataset
      let country = document.querySelector('.country')
      let countryIndex = country.selectedIndex
      let phoneCode = country.children[countryIndex].dataset.phone
      let countryCode = country.children[countryIndex].dataset.country

      let postCode = document.querySelector('.district')
      let postCodeIndex = postCode.selectedIndex
      postCode = postCode.children[postCodeIndex].dataset.zipcode



      let recipientData = {
        'url': `${ server }/api/recipients`,
        'method': 'POST',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        },
        'data': JSON.stringify({
          name: recipientName,
          phone: {
            phone_code: phoneCode,
            phone_number: phoneNumber
          },
          address: {
            country_code: countryCode,
            post_code: postCode,
            city: city,
            district: district,
            others: others
          }
        })
      }

      $.ajax(recipientData)
        .done(function (response) {
          if (response.result === true) {
            console.log(response)
            api_get_recipients()
            lightBox.close()
            // let productId = response.response.channel_id
            // api_get_userStatus('stream', productId)
          }
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }

    // API, DELETE 刪除收貨人
    // DELETE RECIPIENTS
    function api_delete_Recipient(recipient) {

      let key = []
      key.push(recipient)

      let recipientData = {
        'url': `${ server }/api/recipients`,
        'method': 'DELETE',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        },
        'data': JSON.stringify({
          recipients: key
        })
      }

      $.ajax(recipientData)

        .done(function (response) {
          console.log('api_delete_Recipient: Success', response)
          api_get_recipients()
        })

        .fail(function (response) {
          console.log('api_delete_Recipient: Fail', response.responseText)
        })
    }

    // API, GET 取得郵遞區號、縣市
    function api_get_taiwanPostCode() {

      API.GET('/api/taiwan-post-code')
        .done(function (response) {
          filterCities(response)
        })
        .fail(function (response) {
          console.log('api_get_taiwanPostCode: Fail: ' + response)
        })
    }

    // API, GET 取得名稱國碼以及電話國碼
    // GET COUNTRY_CODE AND PHONE_CODE
    function api_get_phoneCode() {

      API.GET('/api/country-code')
        .done(function (response) {
          filterCountry(response.response)
        })
        .fail(function (response) {
          console.log('api_get_phoneCode: Fail: ' + response)
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
          let productListContainer

          let item = '<div class="stream__onAir"></div>'
          let productAmount = 0

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
                if (contentHeader) contentHeader.innerHTML = `
                <h2>賣家 > 商品列表<span class="buttonSmall buttonCallToAction startStreaming">開始直播</span></h2>
                <p class="contentHeader__amountBox"></p>`

                // 商品列表
                productListContainer = contentBody
                item += `
                <div class="contentBody__object" data-key="${ id }">
                  <img src="${ photo }" alt="${ name }" class="contentBody__object__photo">
                  <div class="contentBody__object__name">${ name }</div>
                  <span class="contentBody__object__amount">數量：<span class="amount">${ stock }</span></span>
                  <span class="contentBody__object__cost">成本：$ <span class="cost">${ cost }</span></span>
                  <div class="contentBody__object__spec">
                    <div class="contentBody__object__spec__title">商品敘述</div>
                    <span class="spec">${ description }</span>
                  </div>
                  <span class="contentBody__object__price">$ <span class="price">${ unit_price }</span></span>
                  <div class="contentBody__object__function">
                    <span class="contentBody__object__update">修改</span>
                    <span class="contentBody__object__delete">刪除</span>
                  </div>
                </div>
                `
                productAmount++

                if (!isHome) {

                  sellerInit()
                  productListContainer.innerHTML = item

                  let productAmountContainer = document.querySelector('.contentHeader__amountBox')
                  productAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ productAmount } </span>項`

                  // 共同父層
                  let myItem = document.querySelectorAll('.contentBody__object')
                  for (let i = 0; i < myItem.length; i++) {
                    // 更新
                    let productUpdate = myItem[i].querySelector('.contentBody__object__update')

                    productUpdate.addEventListener('click', function () {
                      editProduct(myItem[i], listenUpdateProduct)
                    })

                    // 刪除
                    let productDelete = myItem[i].querySelector('.contentBody__object__delete')
                    productDelete.addEventListener('click', function () {
                      api_delete_items(myItem[i])
                    })
                  }
                }
                startStreamingButtonsStatus(true)

              } else if (action === 'stream') {

                productListContainer = document.querySelector('.stream__products')

                // 賣家直播產品列表
                item += `
                  <div class="contentBody__object stream__product" data-key="${ id }">
                    <img src="${ photo }" alt="${ name }" class="contentBody__object__photo stream__product__photo">
                    <div class="contentBody__object__function stream__product__function">
                      <span class="contentBody__object__push">推播</span>
                    </div>
                    <div class="stream__product__mainInfo">
                      <div class="contentBody__object__name stream__product__name">${ name }</div>
                      <span class="contentBody__object__price stream__product__price">$ <span class="price">${ unit_price }</span></span>
                      <span class="contentBody__object__amount">（數量：<span class="amount">${ stock }</span></span>
                      <span class="contentBody__object__cost">成本：$ <span class="cost">${ cost }</span>）</span>
                    </div>
                    <div class="contentBody__object__spec stream__product__spec">
                      <span class="spec">${ description }</span>
                    </div>
                  </div>
                  `
                productAmount++

                if (!isHome) {

                  api_get_streamingItem()
                  productListContainer.innerHTML = item

                  let productAmountContainer = document.querySelector('.contentHeader__amountBox')

                  productAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ productAmount } </span>項`

                  // 共同父層
                  let myItem = document.querySelectorAll('.contentBody__object')

                  for (let i = 0; i < myItem.length; i++) {
                    // 推播
                    let productPush = myItem[i].querySelector('.contentBody__object__push')

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

                      api_post_streamingItem(pushItemData)
                    })
                  }
                }
                startStreamingButtonsStatus(false)
              }
            }
          } else {
            if (action === 'init') {
              sellerInit()
              contentBody.innerHTML = '您尚未新增商品。'
              startStreamingButtonsStatus(false)
            }


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

    // API, POST 買家購買商品
    function api_post_orders() {
      console.log('按下確認購買')
      // /api/orders/{item_id}/{recipient_id}
    }
    // API, GET 取得賣家訂單資料


    /*---------------------- 
    Streaming API
    -----------------------*/

    // API, GET 取得使用者狀態
    // GET USER STATUS
    function api_get_userStatus(action, productId, callback) {

      API.GET('/api/user-status')
        .done(function (response) {
          console.log('api_get_userStatus: Success', response)

          if (response.result === true) {

            host = response.response.host
            let url = response.response.iFrame
            let channelToken = response.response.channel_token
            let channelDescription = response.response.channel_description

            let userStatus = {
              host: host,
              url: url,
              channelToken: channelToken,
              channelDescription: channelDescription,
              productId: productId
            }

            if (action === 'stream') {
              if (!host) {
                // 買家加入直播
                continueStream(userStatus, productCalculator)
                // console.log(host, '買家', userStatus)
              } else {
                // 賣家開始直播
                console.log(host, '賣家')
                continueStream(userStatus)
              }

            } else if (action === 'init') {

              let alertMsg
              if (!host) {
                // 買家角色

                alertMsg = `
                <h3><span>您尚未離開直播，是否繼續觀看？</span></h3>
                <div class="lightBox__centerBox">
                  <span class="buttonSmall buttonNormal continueStreaming">繼續觀看</span>
                  <span class="buttonSmall buttonCallToAction stopStreaming">離開包廂</span>
                </div>
                `

              } else {
                // 賣家角色
                alertMsg = `
                <h3><span>您似乎未正確結束直播</span></h3>
                <div class="lightBox__centerBox">
                  <span class="buttonSmall buttonNormal continueStreaming">繼續直播</span>
                  <span class="buttonSmall buttonCallToAction stopStreaming">結束直播</span>
                </div>
                `
              }

              lightBox.open(alertMsg, false)

              let continueStreamBtn = document.querySelector('.continueStreaming')

              continueStreamBtn.addEventListener('click', function () {
                continueStream(userStatus, productCalculator)
              })

              let stopStream = document.querySelector('.stopStreaming')

              stopStream.addEventListener('click', function () {
                api_put_usersChannelId()
                callback()
              })
            }
            startStreamingButtonsStatus(false)

          } else if (response.result === false) {
            // 預設的callback是載入商品列表
            if (!isHome) callback('init') 
          }

        })

        .fail(function (response) {
          console.log('api_get_userStatus: Fail', response.responseText)

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
    function api_post_streamingItem(data) {
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
            api_get_streamingItem(data)
          }
        })

        .fail(function (response) {
          console.log('api_post_streamingItems: Fail ' + response.responseText)
          fbSDK('login')
        })
    }

    // API, GET 取得推播中商品資訊
    // Get streaming item's information
    function api_get_streamingItem(data) {

      API.GET('/api/streaming-items')
        .done(function (response) {
          console.log('api_get_streamingItem: Success', response)
          
          let item_id = response.response.item_id
          let name = response.response.name
          let description = response.response.description
          let image = response.response.image

          remainingQuantity = response.response.remaining_quantity
          let soldQuantity = response.response.sold_quantity
          let unitPrice = response.response.unit_price
          
          let streamData = {
            key: item_id,
            name: name,
            description: description,
            photo: image,
            remainingQuantity: remainingQuantity,
            soldQuantity: soldQuantity,
            unit_price: unitPrice
          }

          let keyContainer = document.querySelector('.stream__product')
          let nameContainer = document.querySelector('.stream__product__name')
          let descriptionContainer = document.querySelector('.spec')
          let imageContainer = document.querySelector('.stream__product__photo')
          let remainingQuantityContainer = document.querySelector('.remain')
          let soldQuantityContainer = document.querySelector('.soldAmount')
          let unitPriceContainer = document.querySelector('.stream__product__price')


          if (!host) {
            console.log('我是買家')

            keyContainer.dataset.key = item_id
            nameContainer.textContent = name
            descriptionContainer.textContent = description
            imageContainer.src = image
            remainingQuantityContainer.textContent = remainingQuantity
            soldQuantityContainer.textContent = soldQuantity
            unitPriceContainer.textContent = unitPrice

            // 每五秒撈推播商品資訊回來
            setTimeout(function () {
              api_get_streamingItem()
            }, 5000)

          } else {
            // 賣家
            console.log('賣家取得推播商品')
            pushStreamItem(streamData)
          }
        })

        .fail(function (response) {
          console.log('api_get_streamingItem: Fail', response)
          if (response.responseJSON.response === 'You need to stream an item first') {
            let onAirBox = document.querySelector('.stream__onAir')
            onAirBox.innerHTML = '<div class="contentBody__object stream__product">賣家尚未推播產品</div>'
          }


        })
    }

    // API, PUT 賣家結束直播
    function api_put_usersChannelId() {

      let serverPath
      serverPath = (host) ? '/api/users-channel-id' : '/api/user-channel-id'

      let userChannelData = {
        'url': `${ server }${ serverPath }`,
        'method': 'PUT',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        }
      }

      $.ajax(userChannelData)
        .done(function (response) {
          if (response.result === true) {
            console.log(response)
            lightBox.close()
            api_get_items('init')
            sellerInit()
          }
        })

        .fail(function (response) {
          console.log('api_post_user: Fail ' + response.responseText)
        })
    }

    // API, PATCH 加入直播
    function api_patch_userChannelID(event, form) {

      let userChannelID = document.querySelector('.streamID__input').value

      let userChannelData = {
        'url': `${ server }/api/user-channel-id`,
        'method': 'PATCH',
        'headers': {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Authorization': `Bearer ${ userToken }`
        },
        'data': JSON.stringify({
          channel_token: userChannelID
        })
      }
      console.log(userChannelData)

      $.ajax(userChannelData)
        .done(function (response) {
          console.log(response)
          if (response.result === true) {
            lightBox.close()
            api_get_userStatus('stream')
          }
        })

        .fail(function (response) {
          console.log('api_patch_userChannelID: Fail ' + response)
          let errorMsg = response.responseJSON.response
          let errorContainer = document.querySelector('.lightBox__errorMsg')
          if (errorMsg === 'The channel doesn\'t exist') {
            errorContainer.innerHTML = `直播 ID 輸入錯誤`
          } else if (errorMsg === 'You are currently holding a live-stream') {
            errorContainer.innerHTML = `您正在直播中，所以無法進入新包廂`
          }
        })

    }

    // API, GET 取得直播歷史紀錄
    function api_get_streamHistory() {

      API.GET('/api/channels')
        .done(function (response) {
          addProductInit(false) // 關閉新增商品按鈕
          contentHeader.innerHTML = `<h2>賣家 > 直播歷史紀錄</h2><p class="contentHeader__amountBox"></p>`

          let history = response.response
          let historyTemplate = ''
          let historyAmount = 0

          if (history.length !== 0) {
            history.sort(function (a, b) {
              return a > b ? 1 : -1
            })

            for (let i = 0; i < history.length; i++) {
              let id = history[i].channel_id
              let name = history[i].channel_description
              let video = history[i].iFrame
              let startTime = URCtoLocalDate(history[i].started_at)
              let endTime = URCtoLocalDate(history[i].ended_at)
              historyTemplate += `
            <div class="contentBody__object" data-history="${id}">
              <div class="contentBody__object__name">${name}</div>
              <div class="contentBody__object__spec contentBody__object__spec__contact">
                <div class="contentBody__object__spec__title">直播網址</div>
                <span class="spec">${video}</span>
                <div class="contentBody__object__spec__title">直播時間</div>
                <span class="spec">${startTime} ~ ${endTime}</span>
              </div>
            </div>
            `
              historyAmount++
            }
            let historyAmountContainer = document.querySelector('.contentHeader__amountBox')
            historyAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ historyAmount } </span>項`
            contentBody.innerHTML = historyTemplate
          } else {
            contentBody.innerHTML = `您尚未開過任何直播包廂。`
          }



        })
        .fail(function (response) {
          console.log(response)
        })
    }

    // API, GET 取得賣家全部訂單
    function api_get_sellerOrders() {
      API.GET('/api/seller-orders')
        .done(function (response) {
          let order = response.response
          let orderTemplate = '<h4><span class="order__navButton allOrder">全部訂單</span> | <span class="order__navButton paidOrder">已付款</span> | <span class="order__navButton notPayOrder">未付款</span></h4>'
          let orderAmount = 0

          contentHeader.innerHTML = `<h2>賣家 > 訂單管理</h2><p class="contentHeader__amountBox"></p>`
          addProductInit(false) // 關閉新增商品按鈕

          if (order.length !== 0) {
            order.sort(function (a, b) {
              return a > b ? 1 : -1
            })

            for (let i = 0; i < order.length; i++) {
              console.log(order[i])
              // 訂單資訊
              let orderNumber = order[i].order // 訂單編號
              let name = order[i].name // 商品名稱
              let description = order[i].description // 商品敘述
              let unit_price = order[i].unit_price // 單價
              let quantity = order[i].quantity // 數量
              let status = order[i].status // 0 未結帳，1 已結帳
              // TODO: 判定未付款以及已結帳的按鈕
              let expiry_time = URCtoLocalDate(order[i].expiry_time) // 付款期限
              let time = URCtoLocalDate(order[i].time) // 商品時間
              let images = order[i].images // 商品照片
              status = (!status) ? '未結帳' : '已結帳' // 結帳狀態

              // 金流資訊
              let total_amount = order[i].total_amount

              // 物流資訊
              let recipient = order[i].recipient
              let user_id = order[i].user_id
              let phone_code = order[i].phone_code
              let phone_number = order[i].phone_number

              let country = order[i].country
              let post_code = order[i].post_code
              let city = order[i].city
              let district = order[i].district
              let others = order[i].others


              orderTemplate += `
            <div class="contentBody__object" data-order="${orderNumber}">
              <img src="${images}" alt="demo red" class="contentBody__object__photo">
              <div class="contentBody__object__name">${name} （${status}）</div>
              <span class="contentBody__object__amount">購買數量：<span class="amount">${quantity}</span></span>
              <span class="contentBody__object__cost">單價：$ <span class="cost">${unit_price}</span></span>
              <span class="contentBody__object__price">$ <span class="price">${total_amount}</span></span>
              <div class="contentBody__object__spec">
                <div class="contentBody__object__spec__title">${description}</div>
                <span class="spec"></span>
              </div>
              <div class="contentBody__object__spec">
              <div class="spec" data-buyer="${user_id}">收件人姓名：${recipient}</div>
              <div class="spec">聯絡電話：(+${phone_code}) ${phone_number}</div>
              <div class="spec">收貨地址：${country} ${post_code} ${city}${district}${others}</div>
              <div class="contentBody__object__spec__title">訂單時間：${time}。付款期限：${expiry_time}。</div>
              </div>

            </div>
            `
              orderAmount++
            }

            let orderAmountContainer = document.querySelector('.contentHeader__amountBox')
            orderAmountContainer.innerHTML = `共<span class="contentHeader__amount"> ${ orderAmount } </span>項`
            contentBody.innerHTML = orderTemplate
          } else {
            contentBody.innerHTML = `您尚無任何訂單。`
          }


        })
        .fail(function (response) {
          console.log(response)
        })
    }
  })
})(lightbox, API)