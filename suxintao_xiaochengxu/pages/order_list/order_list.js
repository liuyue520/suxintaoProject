// pages/order_list/order_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_type: 10,//0待付款 1待发货 2待收货 3已完成

    order_list: [],
    page: 1,
    hasMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(typeof options.order_type != 'undefined'){
      this.setData({
        order_type: options.order_type
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  onClickTab:function(e){
    var orderType = e.currentTarget.dataset.orderType;
    this.setData({
      order_type: orderType,
    });
    this.refresh();
  },

  getParams: function (params) {
    params.status = this.data.order_type;
    return params;
  },

  refresh: function () {
    var page = this;

    app.request({
      url: 'v2/ecapi.order.list',
      data: page.getParams({ page: 1, per_page: 10 }),
      success: function (res) {
        //wx.stopPullDownRefresh();

        page.setData({
          order_list: res.orders,
          page: 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  loadMore: function () {
    var page = this;

    app.request({
      url: 'v2/ecapi.order.list',
      data: page.getParams({ page: page.data.page + 1, per_page: 10 }),
      success: function (res) {
        page.setData({
          order_list: page.data.order_list.concat(res.orders),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },

  onPay:function(e){
    var order_id = e.currentTarget.dataset.orderId;
    var page = this;
    app.onPay({
      order_id:order_id,
      success:function(){
        page.refresh();
      }
    });
  },

  isHanding: false,
  onConfirm: function (e) {
    if (this.isHanding){
      return;
    }
    var order_id = e.currentTarget.dataset.orderId;
    var page = this;
    wx.showModal({
      title: '提示',
      content: '您确定要确认收货吗？',
      success: function(res){
        if(res.confirm){
          page.isHanding = true;
          app.request({
            url:'v2/ecapi.order.confirm',
            data: { order_id: order_id},
            success:function(){
              page.refresh();
              page.isHanding = false;
            }
          });
        }else if(res.cancel){

        }
      }
    })
  },

  onCancel: function (e) {
    if (this.isHanding) {
      return;
    }
    var order_id = e.currentTarget.dataset.orderId;
    var page = this;
    wx.showModal({
      title: '提示',
      content: '您确定要取消订单吗？',
      success: function (res) {
        if (res.confirm) {
          page.isHanding = true;
          app.request({
            url: 'v2/ecapi.order.cancel',
            data: { order_id: order_id },
            success: function () {
              page.refresh();
              page.isHanding = false;
            }
          });
        } else if (res.cancel) {

        }
      }
    })
  },
  onCopy: function (e) {
    app.copyToClipboard(e.currentTarget.dataset.text);
  },
  onPullDownRefresh () {
    wx.stopPullDownRefresh()
  }
})