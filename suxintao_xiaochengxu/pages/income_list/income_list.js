// pages/income_list/income_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'all', //99 299

    income_list: [],
    page: 1,
    hasMore: false,

    income:null,

    explode_income:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ type: options.type});
    this.onRefresh();

    var page = this;
    app.request({
      url: 'v2/ecapi.vip',
      success: function (res) {
        wx.stopPullDownRefresh();
        page.setData({
          income: res.income
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
    params.type = this.data.type;

    return params;
  },

  onRefresh: function () {
    var page = this;

    app.request({
      url: 'v2/share.income_list',
      data: page.getParams({ page: 1, per_page: 20 }),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          income_list: res.income_list,
          page: 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onLoadMore: function () {
    var page = this;

    app.request({
      url: 'v2/share.income_list',
      data: page.getParams({ page: page.data.page + 1, per_page: 20 }),
      success: function (res) {
        page.setData({
          income_list: page.data.income_list.concat(res.income_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onClickTab:function(e){
    var type = e.currentTarget.dataset.type;
    var page = this;
    page.setData({type:type});
    page.onRefresh();
  },

  onShowOrder: function(e){
    var incomeId = e.currentTarget.dataset.incomeId;
    var explodeIds = this.data.explode_income;
    explodeIds['income_id_' + incomeId] = true;

    this.setData({ explode_income: explodeIds});
  },

  onHideOrder: function (e) {
    var incomeId = e.currentTarget.dataset.incomeId;
    var explodeIds = this.data.explode_income;
    delete explodeIds['income_id_' + incomeId];

    this.setData({ explode_income: explodeIds });
  },
})