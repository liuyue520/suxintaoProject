// pages/checkout/checkout.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    card_exchange_pwd299:"",
    card_exchange_sn: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("onLoad");
    this.setupBuyInfo();
    this.setupOrderPrice();
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
          for(var i=0; i<consignees.length; i++){
            var consignee = consignees[i];
            if (consignee.is_default){
              page.setData({
                consignee: consignee,
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
    var params = { shipping: 1, order_product: JSON.stringify(cartGoodsInfo), card_exchange_pwd299: page.data.card_exchange_pwd299};
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

    

    var page = this;

    if(this.data.consignee == null){
      wx.showToast({
        title: '请输入收货地址',
        icon: 'none'
      })
      return;
    }

    if (! this.data.card_exchange_pwd299) {
      wx.showToast({
        title: '礼品卡不能为空',
        icon: 'none'
      })
      return;
    }
    this.ishanding = true;
    console.log("111");
    var cartGoods = this.data.cartGoodsList[0];

    app.request({
      url: 'v2/ecapi.product.purchase.card_exchange299',
      data: {
        amount: cartGoods.amount,
        comment: e.detail.value.post_script,
        consignee: this.data.consignee.id,
        product: cartGoods.goods_id,
        property: JSON.stringify(cartGoods.attrs.split(',')),
        shipping: 1,
        card_exchange_pwd299: page.data.card_exchange_pwd299
      },
      success: function (res) {
        if (res.order.total > 0){
          app.onPay({ order_id: res.order.id });
        }else{
          wx.navigateTo({
            url: '/pages/order_list/order_list',
          })
        }
        
      },
      complete: function (res) {
        console.log("request", "checkout complete");
        //page.ishanding = false;
      }
    });
  },

  onChooseCard299:function(e){
    var page = this;

    wx.scanCode({
      //scanType: ['qrCode'],
      success:function(res){
        console.log(res);
        var card_pwd = res.result;
        app.request({
          url: 'v2/ecapi.card_exchange299.validate',
          data: {
            card_exchange_pwd299: card_pwd
          },
          success: function (res) {
            page.setData({
              card_exchange_pwd299: card_pwd,
              card_exchange_sn:res.card.sn
            });
            page.setupOrderPrice();
          }
        });
      }
    })
  }
})