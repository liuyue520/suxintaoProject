// pages/home/home.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navBarStyle: null,
    navStyle: null,

    mask:false,
    limitBuyMask: false,

    currentFlash: 0,

    categories:[],
    home_data:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var navBarStyle = app.getNavigationBarStyle();
    console.log("navBarStyle", navBarStyle);
    var navStyle = app.getNavigationStyle();
    this.setData({
      navBarStyle: navBarStyle,
      navStyle: navStyle,
    });
    
    app.checkLogin(this);
  },

  refresh:function(){
    var page = this;
    app.request({
      url: "v2/ecapi.category.list",
      data:{page:1, per_page:1000},
      success: function (res) {
        page.setData({
          categories:res.categories,
        });
      }
    });

    app.request({
      url: "v2/ecapi.home.product.list",
      success: function (res) {
        page.setData({
          home_data: res,
        });
      }
    });
  },

  onShow:function(){
    this.getLimitBuyTabRect();
    this.getHeaderRect();

    this.refresh();
  },

  headerMaskAnimation: null,
  onPageScroll:function(e){
    console.log(e);
    var scrollTop = e.scrollTop;
    this.setData({
      mask: scrollTop >= 30,
    });

    var limitBuyTop = this.limitBuyTabRect.top;
    this.setData({
      limitBuyMask: scrollTop + this.headerRect.bottom >= limitBuyTop,
      headerRect: this.headerRect
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var page = this;
    setTimeout(function(){
      page.setData({tips:"hello toast"});
      wx.stopPullDownRefresh();
    }, 3000);
  },



  onChangeFlash: function(e){
    console.log(e);
    this.setData({
      currentFlash: e.detail.current
    });
  },

  limitBuyTabRect: null,
  headerRect: null,
  getLimitBuyTabRect:function(){
    var page = this;
    var query = wx.createSelectorQuery();
    query.select('.limitbuy-tabs').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      console.log(res);
      page.limitBuyTabRect = res[0];
    });
  },
  getHeaderRect: function () {
    var page = this;
    var query = wx.createSelectorQuery();
    query.select('.header').boundingClientRect();
    query.selectViewport().scrollOffset();
    query.exec(function (res) {
      console.log("header rect", res);
      page.headerRect = res[0];
    });
  },


  onClickCatTabItem:function(e){

  }
})