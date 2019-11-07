// pages/order_list/order_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bonus_type: 10,//0待付款 1待发货 2待收货 3已完成

    bonus_list: [],
    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (typeof options.bonus_type != 'undefined') {
      this.setData({
        bonus_type: options.bonus_type
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.loadMore();
    }
  },

  onClickTab: function (e) {
    var bonusType = e.currentTarget.dataset.bonusType;
    this.setData({
      bonus_type: bonusType,
    });
    this.refresh();
  },

  getParams: function (params) {
    params.type = this.data.bonus_type;
    return params;
  },

  refresh: function () {
    var page = this;

    app.request({
      url: 'v2/activity726.bonus',
      data: page.getParams({ page: 1, per_page: 10 }),
      success: function (res) {
        //wx.stopPullDownRefresh();

        page.setData({
          bonus_list: res.bonus,
          page: 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  loadMore: function () {
    var page = this;

    app.request({
      url: 'v2/activity726.bonus',
      data: page.getParams({ page: page.data.page + 1, per_page: 10 }),
      success: function (res) {
        page.setData({
          bonus_list: page.data.bonus_list.concat(res.bonus),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onOpenBunus: function (e) {
    var bonus_id = e.currentTarget.dataset.bonusId;
    var status = e.currentTarget.dataset.status;
    console.log("onOpenBunus", bonus_id, status);
    if(status != 0){
      return;
    }

    var page = this;
    wx.showLoading({
      title: '拆红包',
    })
    app.request({
      url: 'v2/activity726.bonus.open',
      data: { bonus_id:bonus_id},
      success: function (res) {
        wx.hideLoading();
        page.refresh();
      }
    });
  },
})