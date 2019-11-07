// pages/mine/mine.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user:null,
    return_url: encodeURIComponent("https://api25.oioos.com/article.php?id=81"),
    agreement_url: encodeURIComponent("https://api25.oioos.com/article.php?id=84"),
    partner_url: encodeURIComponent("https://api25.oioos.com/article.php?id=82"),
    passport_url: encodeURIComponent("https://api25.oioos.com/article.php?id=83"),

    qrcode:null,
    show_qrcode: false,
    hide:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;
    app.request({
      url: 'v2/system.menu',
      success: function (res) {
        page.setData({ menus: res.menus });
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var page = this;
    app.request({
      url: 'v2/ecapi.user.profile.get',
      success: function (res) {
        page.setData({ user: res.user });
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


  onCopy: function(e){
    app.copyToClipboard(e.currentTarget.dataset.text);
  },

  onShowQrcode:function(e){
    var page = this;
    if(page.data.qrcode == null){
      wx.showLoading({
        title: 'loading...',
      })
      app.request({
        url:'v2/share.qrcode',
        success:function(res){
          wx.hideLoading();
          page.setData({
            qrcode: res.qrcode,
            show_qrcode: true,
          });
        }
      });
    }else{
      page.setData({
        qrcode:page.data.qrcode,
        show_qrcode: true,
      });
    }
  },
  onHideQrcode:function(e){
    var page = this;
    page.setData({
      show_qrcode: false,
    });
  },
  onClickQrcode:function(e){

  },
  onClickDownloadQrcode:function(e){
    var page = this;
    wx.downloadFile({
      url: page.data.qrcode,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("当初用户拒绝，再次发起授权")
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  } else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          },
          complete(res) {
            console.log(res);
          }
        })
      }
    })
  },

  onClearCache:function(e){
    wx.clearStorageSync();
  },
  loginFun:function(){
    wx.navigateTo({
      url: '../login/login',
    })
  }
})