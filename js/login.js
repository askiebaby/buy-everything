FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
    console.log(response);
});