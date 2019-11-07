// pages/login/login.js
var app = getApp();
Page({
  onLoad:function(){

  },
  onGotUserInfo: function (e) {
    console.log("onGotUserInfo", e);
    var params = {};
    params.raw_data = e.detail.rawData;
    params.encrypted_data = e.detail.encryptedData;
    params.iv = e.detail.iv;
    params.signature = e.detail.signature;

    wx.login({
      success: function (res) {
        if (!res.code) {
          return;
        }
        params.code = res.code;

        console.log("login", params);
        getApp().request({
          url: 'v2/ecapi.wechat.login.miniapp',
          method: "POST",
          data: params,
          success: function (res) {
            console.log("login res", res);
            getApp().saveToken(res.token);
            app.saveMember(res.member);

            app.bindParent(function(){
              wx.navigateBack({
                delta: 1
              })
            });
          }
        })
      }
    });
  },
  UpLogin:function(){
    app.isLogin(true)
    wx.navigateBack({
      delta: 1
    })
  }
})