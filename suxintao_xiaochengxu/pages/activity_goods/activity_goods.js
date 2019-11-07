// pages/activity_goods/activity_goods.js
var app = getApp();
import Monitor from '../../utils/monitor.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    state:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id, refer_code;
    if (options.scene) {
      var options_scene = decodeURIComponent(options.scene);
      console.log("goods has scene", decodeURIComponent(options.scene),'二维码');
      var scene_arr = options_scene.split(",");

      var goods_id_arr = scene_arr[0].split(":");

      var user_id_arr = scene_arr[1].split(":");
      console.log(scene_arr, goods_id_arr, user_id_arr);

      id = goods_id_arr[1];
      refer_code = user_id_arr[1];

      if (refer_code) {
        app.saveParentReferCodeByOptions({ refer_code: refer_code });
      }
    } else {
      id = options.id;
      console.log("goods not has scene");

      app.saveParentReferCodeByOptions(options);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    app.bindParent();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this
    var member = app.getMember();
    that.setData({
      state: false
    })
    var msg = {
      title: '省钱的小秘密，我只告诉你哦~',
      path: '/pages/activity_goods/activity_goods?id=' + 10000 + "&refer_code=" + member.refer_code,
    };
    return msg
  },
  isRule:function(){
    wx.navigateTo({
      url: "../activity_rule/activity_rule"
    })
  },
  isHome:function(){
    app.HomeState = true
    wx.switchTab({
      url: "../home/home",
    })
  },
  Invitation:function(){
    let that = this

    app.request({
      url: 'v2/share.huodong',
      success: function (res) {
        console.log(res);
        that.setData({
          state:true,
          ImgPhoto: res.goods_share_image.image_url
        })
      }
    });
  },
  isGift:function(){
    wx.navigateTo({
      url: '/pages/vip_goods_list/vip_goods_list?type=299'
    })
  },
  Seckill:function(){
    app.HomeState = true
    wx.switchTab({
      url: "../home/home",
    })
  },
  chudong:function(){
    wx.navigateTo({
      url: '/pages/goods_list/goods_list?cat_id=' + 106
    })
  },
  chihuo:function(){
    wx.navigateTo({
      url: '/pages/goods_list/goods_list?cat_id=11',
    })
  },
  onClickDownloadQrcode: function (e) {
    var that = this;
    wx.downloadFile({
      url: that.data.ImgPhoto,
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
  onColse:function(){
    let that = this
    that.setData({
      state:false
    })
  }
})