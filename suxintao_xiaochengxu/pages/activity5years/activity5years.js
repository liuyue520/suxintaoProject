// pages/activity5years/activity5years.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  referCode: null,
  share_image: null,
  share_page: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("years 5", options, options.refer_code);
    if (options.refer_code){
      this.referCode = options.refer_code;
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var page = this;
    app.request({
      url: 'activity/year5.index',
      data: this.referCode ? { refer_code: this.referCode} : null,
      success: function (res) {
        page.setData({ activity: res.activity });

        if (res.activity.show_share){
          wx.showShareMenu({
            
          })

          page.share_image = res.activity.show_share.share_image;
          page.share_page = res.activity.show_share.share_page;
        }else{
          wx.hideShareMenu({
            
          });
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let params = {};
    params.title = "苏心淘";

    if(this.share_image){
      params.imageUrl = this.share_image;
    }

    if(this.share_page){
      params.path = this.share_page;
    }

    return params;
  },

  onBuy:function(e){
    wx.showModal({
      content: '立即前往苏心淘首页任意购买一单产品激活黑卡身份',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.switchTab({
            url: '/pages/home/home',
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})