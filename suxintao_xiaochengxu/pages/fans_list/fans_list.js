// pages/income_list/income_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fans_list: [],
    page: 1,
    hasMore: false,

    fans:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onRefresh();

    var page = this;
    app.request({
      url: 'v2/ecapi.vip',
      success: function (res) {
        wx.stopPullDownRefresh();
        page.setData({
          fans: res.fans,
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.onRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.hasMore) {
      this.onLoadMore();
    }
  },
  getParams: function (params) {
    return params;
  },
  onRefresh: function () {
    var page = this;

    app.request({
      url: 'v2/share.fans_list',
      data: page.getParams({ page: 1, per_page: 8 }),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          fans_list: res.fans_list,
          page: 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onLoadMore: function () {
    var page = this;

    app.request({
      url: 'v2/share.fans_list',
      data: page.getParams({ page: page.data.page + 1, per_page: 8 }),
      success: function (res) {
        page.setData({
          fans_list: page.data.fans_list.concat(res.fans_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },
})