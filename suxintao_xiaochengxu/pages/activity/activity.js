// pages/activity/activity.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;

    app.request({
      url: 'v2/activity.detail',
      success: function (res) {
        //wx.stopPullDownRefresh();

        page.setData({
          activity: res
        });
      }
    });
  },

})