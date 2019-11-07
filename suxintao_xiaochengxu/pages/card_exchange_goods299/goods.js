// pages/goods/goods.js
var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showBuyInfo: false,
    buyInfoHeight: 500,
    buyInfoBottom: 0,
    buy_num: 1,
    goodsInfo: null,

    id: 0,

    properties:[],
    stock: "",
    

    cart_num:0,

    year_save:"",

    price_rank1:"",
    price_rank2:'',

    qrcode: null,
    show_qrcode: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("goods options ", options, decodeURIComponent(options.scene));
    

    var id, refer_code;
    if(options.scene){
      var options_scene = decodeURIComponent(options.scene);
      console.log("goods has scene");
      var scene_arr = options_scene.split(",");

      var goods_id_arr = scene_arr[0].split(":");

      var user_id_arr = scene_arr[1].split(":");
      console.log(scene_arr, goods_id_arr, user_id_arr);

      id = goods_id_arr[1];
      refer_code = user_id_arr[1];

      if(refer_code){
        app.saveParentReferCodeByOptions({refer_code: refer_code});
      }
    }else{
      id = options.id;
      console.log("goods not has scene");

      app.saveParentReferCodeByOptions(options);
    }


    var page = this;
    page.setData({
      id: id
    });
    app.request({
      url: 'v2/ecapi.product.get',
      data: { product: id },
      success: function (res) {
        var current_price = res.product.display_price && res.product.display_price > 0 ? res.product.display_price : res.product.current_price;

        var price_rank1 = (current_price * res.product.share_rank_discount1) / 100;
        var price_rank2 = (current_price * res.product.share_rank_discount2) / 100;
        page.setData({
          goodsInfo: res.product,
          price_rank1: price_rank1.toFixed(2),
          price_rank2: price_rank2.toFixed(2),
        });



        page.resetStock();

        page.data.properties = res.product.properties;//bind时依赖
        var properties = page.bindCurrentAttrMap(page.data.properties);
        page.setData({
          properties: properties,
        });

        WxParse.wxParse("content", "html", page.data.goodsInfo.goods_desc, page);
      }
    });

    this._refreshCartNum();

    app.request({
      url: 'v2/vip.year_save',
      success: function(res){
        page.setData({
          year_save: res.year_save
        });
      }
    });
  },

  onShow: function () {
    app.bindParent();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = this.data.goodsInfo.name;
    var member = app.getMember();
    var path = "/pages/goods/goods?id=" + this.data.id + "&refer_code=" + member.refer_code;
    var imageUrl = this.data.goodsInfo.default_photo.large;

    var msg = {
      title: title,
      path: path,
      imageUrl: imageUrl
    };
    console.log("share message", msg);
    return msg
  },

  onShowBuyInfo:function(e){
    this.setData({
      showBuyInfo: true
    });
  },

  onHideBuyInfo: function (e) {
    this.setData({ showBuyInfo: false });   

    /*this.setData({buyInfoBottom: -this.data.buyInfoHeight});
    var page = this;
    setTimeout(function(){
      page.setData({showBuyInfo:false});       
    }, 200);*/
  },

  onBuyNow:function(e){
    if (this.data.stock < 1) {
      wx.showToast({
        title: '库存不足',
        icon: "none"
      })
      return;
    }
    var property = this._getSelectedAttrIds();
    for (var i = 0; i < property.length; i++) {
      if (property[i] < 0) {
        wx.showToast({
          title: '请选择规格',
          icon: "none"
        })
        return;
      }
    }

    var cartGoods = {
      goods_id: this.data.goodsInfo.id,
      amount: this.data.buy_num,
      price: this.data.price,
      attrs: property.join(","),
      attr_stock: "100",
      property: this._getSelectedAttrNames(),
      promos: [],
      id: 0,
      product: this.data.goodsInfo
    };

    wx.setStorageSync("buy_info", JSON.stringify([cartGoods]));
    wx.navigateTo({
      url: '/pages/checkout_card_exchange299/checkout',
    })
  },

  onMinus: function (e) {
    this.setData({
      buy_num: 1,
    });
  },

  onPlus: function (e) {
    this.setData({
      buy_num: 1,
    });
  },

  onSelectAttr:function(e){
    var proIndex = e.currentTarget.dataset.proIndex;
    var attrIndex = e.currentTarget.dataset.attrIndex;

    var properties = this.data.properties;
    properties[proIndex].selected_index = attrIndex;

    properties = this.bindCurrentAttrMap(properties);
    this.setData({properties:properties});

    this.resetStock();
  },

  resetStock:function(){
    var stock = this.data.goodsInfo.good_stock;
    var price = this.data.goodsInfo.display_price && this.data.goodsInfo.display_price > 0 ? this.data.goodsInfo.display_price : this.data.goodsInfo.current_price;
    var image = this.data.goodsInfo.default_photo.large;

    if(this.data.properties.length >= 1){
      var selectedAttrIds = this._getSelectedAttrIds();
      var isFullProduct = true;
      for (var i = 0; i < selectedAttrIds.length; i++) {
        if (selectedAttrIds[i] < 0) {
          isFullProduct = false;
          break;
        }
      }

      if (isFullProduct){
        var productStock = this.data.goodsInfo.stock;
        for (var i = 0; i < productStock.length; i++) {
          var stockInfo = productStock[i];

          if (stockInfo.goods_attr == selectedAttrIds.join("|")) {
            stock = stockInfo.stock_number;
            if (stockInfo.product_price > 0) {
              price = stockInfo.product_price;
            }
            if (stockInfo.product_image.length > 0) {
              image = stockInfo.product_image;
            }
            break;
          }
        }
      }
    }
    this.setData({stock:stock, price:price, image:image});
  },

  //[] -1, 0, 1

  _getSelectedAttrIds: function(e){
    if (this.data.properties.length < 1) {
      return [];
    }

    var res = [];

    for(var i=0; i<this.data.properties.length; i++){
      var pro = this.data.properties[i];
      if (typeof pro.selected_index != 'undefined' && pro.selected_index >= 0){
        var attr = pro.attrs[pro.selected_index];
        res.push(attr.id);
      }else{
        res.push(-1);
      }
    }

    return res;
  },

  _getSelectedAttrNames: function (e) {
    if (this.data.properties.length < 1) {
      return [];
    }

    var res = [];

    for (var i = 0; i < this.data.properties.length; i++) {
      var pro = this.data.properties[i];
      if (typeof pro.selected_index != 'undefined' && pro.selected_index >= 0) {
        var attr = pro.attrs[pro.selected_index];
        res.push(attr.attr_name);
      }
    }

    return res;
  },

  _refreshCartNum:function(){
    var page = this;
    app.request({
      url: 'v2/ecapi.cart.quantity',
      success: function (res) {
        page.setData({
          cart_num: res.quantity,
        });
      }
    });
  },
  bindCurrentAttrMap: function (properties) {
    var currentAttrMap = this._getSelectedAttrIds(); 
    var stock = this.data.goodsInfo.stock;

    for (var i = 0; i < properties.length; i++) {
      var attr_list = properties[i].attrs;
      for (var j = 0; j < attr_list.length; j++) {
        var attr = attr_list[j];

        //把当前product的pro index替换为该属性id
        var targetMap = getTargetAttrMap(i, attr_list[j].id);

        properties[i].attrs[j].disabled = getDisable(targetMap);
      }
    }
    return properties;

    function getTargetAttrMap(groupIndex, attrId) {
      var targetMap = [];
      for (var i = 0; i < currentAttrMap.length; i++) {
        if (i == groupIndex) {
          targetMap.push(attrId);
        } else {
          targetMap.push(currentAttrMap[i]);
        }
      }

      return targetMap;
    }

    function getDisable(attrMap) {
      var disabled = true;

      for (var i = 0; i < stock.length; i++) {
        var product = stock[i];

        //默认命中，只要有一项不相等则为非命中
        var targeted = true;
        var product_attr_list = product.goods_attr.split("|");
        for (var j = 0; j < product_attr_list.length; j++) {
          if (attrMap[j] != product_attr_list[j] && attrMap[j] != -1) {
            targeted = false;
            break;
          }
        }

        //如果命中，且库存大于0，则可以使用
        if (targeted && product.stock_number > 0) {
          disabled = false;
          break;
        }
      }

      return disabled;
    }
  },

  onShowQrcode: function (e) {
    var page = this;
    if (page.data.qrcode == null) {
      wx.showLoading({
        title: 'loading...',
      })
      app.request({
        url: 'v2/share.goods',
        data:{goods_id:page.data.id},
        success: function (res) {
          wx.hideLoading();
          page.setData({
            qrcode: res.goods_share_image.image_url,
            show_qrcode: true,
          });
        }
      });
    } else {
      page.setData({
        qrcode: page.data.qrcode,
        show_qrcode: true,
      });
    }
  },
  onHideQrcode: function (e) {
    var page = this;
    page.setData({
      show_qrcode: false,
    });
  },
  onClickQrcode: function (e) {

  },
  onClickDownloadQrcode: function (e) {
    var page = this;
    wx.downloadFile({
      url: page.data.qrcode,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (err) {
            console.log(err);
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
              console.log("当初用户拒绝，再次发起授权")
              wx.openSetting({
                success(settingdata) {
                  console.log(settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                  } else {
                    console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                  }
                }
              })
            }
          },
          complete(res) {
            console.log(res);
          }
        })
      }
    })
  },
})