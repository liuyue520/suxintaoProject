// pages/checkout/checkout.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartGoodsList:[],

    agreement99: encodeURIComponent("https://api25.oioos.com/article.php?id=85"),

    show_pop_window:false,

    show_pop_window_refer_code:false,
    refer_code:null,
    isColor:'#e2a64b;',
    disabled:false,
    loadingHidden: false
  },

  isOneStepBuy:false,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
    this.setupBuyInfo();
    this.setupOrderPrice();

    if (typeof options.onestep != "undefined" && options.onestep == 1){
      this.isOneStepBuy = true
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow");
    this.setupConsignee();
  },

  /**
   * buy info
   */
  setupBuyInfo:function(){
    this.setData({
      cartGoodsList: JSON.parse(wx.getStorageSync("buy_info"))
    });
    console.log("checkout buy info", this.data.cartGoodsList);
  },

  /**
   * module consignee
   */
  setupConsignee:function(){
    var page = this;
    var consignee = wx.getStorageSync("consignee");
    console.log(consignee,'价格')
    if (consignee){
      page.setData({
        consignee:JSON.parse(consignee),
      });
      page.setupOrderPrice();
    }else{
      app.request({
        url: 'v2/ecapi.consignee.list',
        success:function(res){
          var consignees = res.consignees;
          console.log(consignees,'价格')
          for(var i=0; i<consignees.length; i++){
            var consignee = consignees[i];
            if (consignee.is_default){
              page.setData({
                consignee: consignee,
                loadingHidden: true
              });
              page.setupOrderPrice();
              break;
            }
          }
        }
      });
    }
    
  },
  onChooseConsignee:function(e){
    wx.navigateTo({
      url: '/pages/address_list/address_list?choose=1',
    })
  },
  onAddConsignee: function (e) {
    wx.navigateTo({
      url: '/pages/address_info/address_info?choose=1',
    })
  },

  /**
   * module order price
   */
  setupOrderPrice:function(){
    var cartGoodsInfo = [];
    for(var i=0; i<this.data.cartGoodsList.length; i++){
      var cartGoods = this.data.cartGoodsList[i];

      cartGoodsInfo.push({
        goods_id: cartGoods.goods_id,
        num: cartGoods.amount,
        property: cartGoods.attrs.split(','),
      });
    }

    var page = this;
    var params = {shipping: 1, order_product: JSON.stringify(cartGoodsInfo) };
    if (page.data.consignee){
      params.consignee = page.data.consignee.id;
    }
    app.request({
      url:'v2/ecapi.order.price',
      data: params,
      success:function(res){
        page.setData({
          order_price: res.order_price
        });
      }
    });
  },

  ishanding: false,
  onFormSubmit:function(e){
    console.log(e);
    if(this.ishanding){
      return;
    }
    this.setData({
      isColor:'gray',
      disabled:true
    })
    this.ishanding = true;

    var page = this;

    if(this.data.consignee == null){
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none'
      })
      return;
    }

    if(this.isOneStepBuy){
      var cartGoods = this.data.cartGoodsList[0];

      app.request({
        url: 'v2/ecapi.product.purchase',
        data: {
          amount: cartGoods.amount,
          comment: e.detail.value.post_script,
          consignee: this.data.consignee.id,
          product: cartGoods.goods_id,
          property: JSON.stringify( cartGoods.attrs.split(',')),
          shipping:1
        },
        success:function(res){
          page.order_id = res.order.id;
          page.setData({
            huodong: res
          })
          if (res.order.is_99 == 1) {
            page.setData({
              show_pop_window: true,
              tips: res.order.tips99
            });
          } else if (res.order.is_299_huodong == 1) {
            page.setData({
              show_pop_window: true,
              tips: res.order.tips299
            });
          } else {
            app.onPay({ order_id: res.order.id });
          }

        },
        error:function(res){
          console.log(res, '状态码')
          page.ishanding = false;
          if (res.error_code == 90001){
            page.setData({show_pop_window_refer_code:true});
          } else if (res.error_code == 900){
            wx.showModal({
              title: '',
              content: res.error_desc,
              success(res) {
                if (res.confirm) {
                  page.setData({
                    isColor: '#e2a64b;',
                    disabled: false
                  })
                } else if (res.cancel) {
                  page.setData({
                    isColor: '#e2a64b;',
                    disabled: false
                  })
                }
              }
            })
          }else if(res.error_code != 0){
            wx.showToast({
              title: res.error_desc,
              icon: "none"
            })
          }
        },
        complete: function (res) {
          console.log("request", "checkout complete");
          //page.ishanding = false;
        }
      });
    }else{
      var cartRecids = [];
      for (var i = 0; i < this.data.cartGoodsList.length; i++){
        var cartGoods = this.data.cartGoodsList[i];
        cartRecids.push(cartGoods.id);
      }

      app.request({
        url: 'v2/ecapi.cart.checkout',
        data: {
          cart_good_id: JSON.stringify(cartRecids),
          comment: e.detail.value.post_script,
          consignee: this.data.consignee.id,
          shipping: 1
        },
        success: function (res) {
          page.setData({
            huodong: res
          })
          page.order_id = res.order.id;
          if(res.order.is_99 == 1){
            page.setData({
              show_pop_window:true,
              tips: res.order.tips99
            });
          } else if (res.order.is_299_huodong == 1) {
            page.setData({
              show_pop_window: true,
              tips: res.order.tips299
            });
          } else{
            app.onPay({ order_id: res.order.id });
          }
        },
        error: function (res) {
          page.ishanding = false;
          if (res.error_code == 90001) {
            page.setData({ show_pop_window_refer_code: true });
          } else if (res.error_code != 0) {
            wx.showToast({
              title: res.error_desc,
              icon: "none"
            })
          }
        },
        complete: function(res){
          console.log("request", "checkout complete");
          //page.ishanding = false;
        }
      });
    }
  },

  order_id:0,
  onConfirm99:function(e){
    this.setData({show_pop_window:false});
    app.onPay({ order_id: this.order_id });
  },
  onRefuse99:function(e){
    var page = this;
    if (page.data.huodong.order.is_99 == 1){
      app.request({
        url: 'v2/vip.cancel_order_is_99',
        data: {
          order_id: this.order_id,
        },
        success: function (res) {
          app.onPay({ order_id: page.order_id });
          page.setData({ show_pop_window: false });
        },
      });
    } else if (page.data.huodong.order.is_299_huodong == 1){
      app.request({
        url: 'v2/vip.cancel_order_is_299',
        data: {
          order_id: this.order_id,
        },
        success: function (res) {
          app.onPay({ order_id: page.order_id });
          page.setData({ show_pop_window: false });
        },
      });
    }
  },

  inputReferCode: function (e) {
    this.data.refer_code = e.detail.value;
  }, 
  onRefuseReferCode: function(e){
    this.setData({ show_pop_window_refer_code: false });
  },
  onConfirmReferCode: function(e){
    if(! this.data.refer_code){
      return;
    }

    var page = this;
    app.request({
      url: 'v2/share.bind_parent',
      data: { refer_code: this.data.refer_code },
      success: function (res) {
        if (res.result_code && res.result_code == "fail"){
          wx.showToast({
            title: res.result_msg,
            icon: 'none'
          })
        }else{
          page.setData({ show_pop_window_refer_code: false });
          wx.showToast({
            title: "操作成功，请重新提交订单",
            icon: 'none'
          })
        }
      },
    });
  }
})