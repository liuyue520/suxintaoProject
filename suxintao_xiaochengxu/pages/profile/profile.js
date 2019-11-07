// pages/profile/profile.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null,
    genders: ['未设置', '男', '女'],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
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
    var page = this;
    app.request({
      url: 'v2/ecapi.user.profile.get',
      success: function (res) {
        page.setData({ user: res.user });
      }
    });
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

  },

  onUpdateAvatar:function(e){
    var page = this;
    wx.chooseImage({
      success: function (res) {
        const tempFilePaths = res.tempFilePaths;
        wx.uploadFile({
          url: app.host + 'v2/ecapi.course.upload', // 仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          success(res) {
            var response = JSON.parse(res.data);

            var user = page.data.user;
            user.avatar = response.url;
            
            page.setData({
              user: user
            });

            app.request({
              url: 'v2/ecapi.user.profile.update',
              data: { avatar_url:response.url},
              success:function(res){

              }
            });
          }
        })
      },
    })
  },

  bindPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    var user = this.data.user;
    user.gender = e.detail.value;
    this.setData({
      user: user
    })
    app.request({
      url: 'v2/ecapi.user.profile.update',
      data: { gender: e.detail.value },
      success: function (res) {

      }
    });
  },
})