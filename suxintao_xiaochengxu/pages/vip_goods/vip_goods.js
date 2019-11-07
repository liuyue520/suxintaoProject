// pages/vip_goods/vip_goods.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    vip_tips299:"",
    goods_list299:[],

    vip_tips99:"",
    goods_list99:[],

    random:100
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      random: Math.random(),
    });
    var page = this;
    app.request({
      url: 'v2/vip.vip_goods',
      success: function(res){
        page.setData({
          vip_tips299: res.vip_tips299,
          goods_list299: res.goods_list299,

          vip_tips99: res.vip_tips99,
          goods_list99: res.goods_list99,
        });
      }
    });
  },
})