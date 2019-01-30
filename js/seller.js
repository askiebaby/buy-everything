'use strict';

(function sellerInit (){

  let addProductForm = `
  <form action="" class="form">
    <h3>新增商品</h3>
    <!-- 商品照片 -->
    <label for="addProduct__photo" class="addProduct__photoFake">
      <img src="https://fakeimg.pl/150x150" alt="上傳圖片">
    </label>
    <input type="file" id="addProduct__photo" class="addProduct__photo">
    <div class="lightBox__breakBox">
    <!-- 商品名稱 -->
      <label for="addProduct__name">商品名稱</label>
      <input type="text" class="addProduct__name" id="addProduct__name" placeholder="必填">
    </div>
    <div class="lightBox__breakBox">
      <!-- 規格名稱 -->
      <label for="addProduct__spec">規格名稱</label>
      <input type="text" class="addProduct__spec" id="addProduct__spec" placeholder="必填">
  
      <!-- 販售數量 -->
      <label for="addProduct__amount">販售數量</label>
      <input type="number" class="addProduct__amount" id="addProduct__amount" placeholder="必填">
  
    </div>
    <div class="lightBox__breakBox">
      <!-- 成本 -->
      <label for="addProduct__cost">成本</label>
      <input type="number" class="addProduct__cost" id="addProduct__cost" placeholder="選填">
  
      <!-- 價格 -->
      <label for="addProduct__price">價格</label>
      <input type="text" class="addProduct__price" id="addProduct__price" placeholder="必填">
    </div>
    <input type="submit" value="送出" class="addProduct__submit">
  </form>
  `

let addButton = document.querySelector('.addButton')
addButton.addEventListener('click', function(){
  // callback
  lightBox(addProductForm)
})

})();