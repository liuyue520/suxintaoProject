// pages/activity726/activity726.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showAcitivity726: false,
    version:3002,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.saveParentReferCodeByOptions(options);
    app.checkLogin(this);
  },

  onShow: function () {
    console.log("options home show", app.getParentReferCode());
    app.bindParent();

    var page = this;
    app.request({
      url: "v2/activity726.bonus",
      data: { page: 1, per_page: 10 },
      success: function (res) {
        page.setData({ showAcitivity726: res.bonus.length > 0 });
      }
    });
  },

  onCloseModal726: function (e) {
    this.setData({ showAcitivity726: false });
  },

  onBuy: function (e) {
    var page = this;

    app.request({
      url: "v2/activity726.goods",
      success: function (res) {
        var cartGoods = {
          goods_id: res.goods.id,
          amount: 1,
          price: res.goods.display_price && res.goods.display_price > 0 ? res.goods.display_price : res.goods.current_price,
          attrs: "",
          attr_stock: "100",
          property: [],
          promos: [],
          id: 0,
          product: res.goods
        };

        wx.setStorageSync("buy_info", JSON.stringify([cartGoods]));
        wx.navigateTo({
          url: '/pages/activity726_checkout/activity726_checkout',
        })
      }
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = "苏心淘";
    var member = app.getMember();
    var path = "/pages/activity726/activity726?refer_code=" + member.refer_code;
    console.log("member", member, path);
    var imageUrl = '';

    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
  },


})