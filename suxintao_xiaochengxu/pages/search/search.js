// pages/search/search.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    default_keywords: '299超值礼包',
    keywords:'',
    recommend_keywords:[],

    show_result:false,
    goods_list:[],

    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;

    app.request({
      url: 'v2/ecapi.search.keyword.list',
      data: null,
      success: function (res) {
        page.setData({
          recommend_keywords: res.keywords,
        });
      }
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.show_result) {
      this._search();
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.show_result){
      if (this.data.hasMore) {
        this._search_more();
      }
    }
  },

  _setKeywords: function(keywords){
    this.setData({
      keywords: keywords ? keywords : this.data.default_keywords,
      show_result:true,
    });
    this._search();
  },


  _search:function(){
    var page = this;

    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page._getParams({ page: 1, per_page: 8 }),
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

  _search_more: function(){
    var page = this;

    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page._getParams({ page: page.data.page + 1, per_page: 8 }),
      success: function (res) {
        page.setData({
          goods_list: page.data.goods_list.concat(res.products),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  _getParams: function (params) {
    params.keyword = this.data.keywords;

    return params;
  },

  onCancel:function(e){
    if(this.data.keywords){
      this.setData({
        keywords: '',
        show_result: false,
      });
    }else{
      wx.navigateBack({
        delta:1,
      })
    }
  },

  onSearch:function(e){
    this._setKeywords(e.detail.value);
  },

  onClickKeywords:function(e){
    this._setKeywords(e.currentTarget.dataset.keywords);
  }
})