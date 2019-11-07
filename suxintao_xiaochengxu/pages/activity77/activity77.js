// pages/activity77/activity77.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activity77:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;

    app.request({
      url: 'v2/activity77.index',
      success: function (res) {
        //wx.stopPullDownRefresh();

        page.setData({
          activity77: res.activity77
        });
      }
    });
  },

})