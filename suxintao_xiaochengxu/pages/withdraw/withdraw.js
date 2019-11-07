var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    apply_list: [],

    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.onRefresh();
  },

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

    page.submiting = false;

    app.request({
      url: 'v2/withdraw.apply.list',
      data: page.getParams({ page: 1, per_page: 10 }),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          apply_list: res.apply_list,
          page: 1,
          hasMore: res.paged.more > 0,
          can_withdraw: res.can_withdraw
        });
      }
    });
  },

  onLoadMore: function () {
    var page = this;

    app.request({
      url: 'v2/withdraw.apply.list',
      data: page.getParams({ page: page.data.page + 1, per_page: 10 }),
      success: function (res) {
        page.setData({
          apply_list: page.data.apply_list.concat(res.apply_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          can_withdraw: res.can_withdraw
        });
      }
    });
  },

  submiting: false,
  onFormSubmit: function (e) {
    console.log("onFormSubmit", e.detail.value);
    var page = this;

    var params = e.detail.value;
    if (params.amount < 0.3 || params.amount > 5000) {
      wx.showToast({
        title: '单笔可提现范围0.3~5000',
        icon: "none"
      })
      return;
    }
    if (params.amount > this.data.can_withdraw) {
      wx.showToast({
        title: '提现金额不能超过可提现金额',
        icon: "none"
      })
      return;
    }

    if (this.submiting) {
      return;
    }
    this.submiting = true;

    var page = this;


    app.request({
      url: 'v2/withdraw.apply.add',
      data: { amount: params.amount},
      success: function (res) {
        page.onRefresh();
      }
    });
  }
})