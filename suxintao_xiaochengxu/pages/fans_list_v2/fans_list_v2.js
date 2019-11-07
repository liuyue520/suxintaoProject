// pages/fans_list_v2/fans_list_v2.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fans_type: 0,//0全部 1会员 2普通 3潜在

    fans_list: [],
    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (typeof options.fans_type != 'undefined') {
      this.setData({
        fans_type: options.fans_type
      });
    }

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

  onClickTab: function (e) {
    var fansType = e.currentTarget.dataset.fansType;
    this.setData({
      fans_type: fansType,
    });
    this.onRefresh();
  },

  getParams: function (params) {
    params.fans_type = this.data.fans_type;
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