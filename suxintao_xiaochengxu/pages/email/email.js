// pages/email/email.js
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

  },
  onCopy: function (e) {
    app.copyToClipboard(e.currentTarget.dataset.text);
  },
})