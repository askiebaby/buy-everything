(function isToken (){
  let userToken = Cookies.get('buy-user-token');
  if (userToken) {
    // locationURL('character.html');
  }
})();



function locationURL(hrefNext) {
  // 各種跳轉方式介紹
  // https://ithelp.ithome.com.tw/articles/10190062
  // http://cat-son.blogspot.com/2012/11/javascript-windowlocation.html#sthash.kYTQwQWf.dpbs
  let hrefNow = window.location.href;
  let hrefOrigin = window.location.origin + '/';
  if (hrefNow === hrefOrigin) {
    //首頁才會跳轉
    window.location.assign(hrefNow + hrefNext);
  }
}