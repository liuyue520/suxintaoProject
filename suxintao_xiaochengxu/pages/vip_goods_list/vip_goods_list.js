var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:-1, //99 299

    goods_list: [],

    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.type = options.type;

    this.onRefresh();
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.onLoadMore();
    }
  },

  getParams: function (params) {
    if(this.data.type == 99){
      params.is_99 = 1;
    }

    if (this.data.type == 299) {
      params.is_299 = 1;
    }

    return params;
  },

  onRefresh: function () {
    var page = this;

    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page.getParams({ page: 1, per_page: 8 }),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          goods_list: res.products,
          page: 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onLoadMore: function () {
    var page = this;

    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page.getParams({ page: page.data.page + 1, per_page: 8 }),
      success: function (res) {
        page.setData({
          goods_list: page.data.goods_list.concat(res.products),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },
})