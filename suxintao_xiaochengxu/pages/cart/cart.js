// pages/cart/cart.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    startX: "",
    startY: "",
    deleteId: -1,
    deleteBtnWidth: 80,

    goodsGroups: [],
    selectPaths: [],//recid, eg 41
    selectAll: true,
    order_price: {},

    select_num:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.refresh(true);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  onTouchStart: function(e){
    console.log(e);
    if (e.touches.length == 1) {
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        deleteId: -1
      });
    }
  },

  onTouchMove: function(e){

  },

  onTouchEnd: function(e){
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      var endY = e.changedTouches[0].clientY;

      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var disY = this.data.startY - endY;

      if(disX > this.data.deleteBtnWidth / 2 && Math.abs(disY) < 20){
        this.setData({
          deleteId: e.currentTarget.dataset.path,
        });
      }
    }
  },

  /**
   * module: select
   */
  //dependencies goods_groups
  onToggleSelectAll: function () {
    this.data.selectAll = !this.data.selectAll;

    this.data.selectPaths = [];
    if (this.data.selectAll){
      for (var i = 0; i < this.data.goodsGroups[0].goods.length; i++) {
        var cartGoods = this.data.goodsGroups[0].goods[i];
        this.data.selectPaths.push(cartGoods.id);
      }
    }

    this.setData({
      selectAll: this.data.selectAll,
      selectPaths: this.data.selectPaths
    });

    this.setupOrderPrice();
    this._refreshSelectNum();
  },

  onToggleSelectItem: function (e) {
    var path = e.currentTarget.dataset.path;

    var selected = this.data.selectPaths.indexOf(path) > -1;
    if(selected){
      this.data.selectPaths.splice(this.data.selectPaths.indexOf(path), 1);
    }else{
      this.data.selectPaths.push(path);
    }

    var selectAll = this.data.selectPaths.length == this.data.goodsGroups[0].goods.length;

    this.setData({
      selectAll: selectAll,
      selectPaths: this.data.selectPaths,
    });

    this.setupOrderPrice();
    this._refreshSelectNum();
  },

  /**
   * module update cart goods num
   */
  onMinus: function (e) {
    console.log(e);
    var path = e.currentTarget.dataset.path;
    this.increaseNum(path, -1);
  },

  onPlus: function (e) {
    console.log(e);
    var path = e.currentTarget.dataset.path;
    this.increaseNum(path, 1);
  },

  //dependencies goodsGroups
  increaseNum: function (path, offset) {
    var page = this;

    var cartGoods = this.data.goodsGroups[0].goods[path];
    var num = cartGoods.amount;
    var newNum = num + offset;
    newNum = Math.max(1, newNum);
    app.request({
      url: 'v2/ecapi.cart.update',
      data: { good: cartGoods.id, amount: newNum },
      success: function (res) {
        page.refreshCartGoods();
      }
    });
  },

  OnCheckout: function () {
    var selectCartGoods = this.getSelectGoods();
    if (selectCartGoods.length < 1) {
      wx.showToast({
        title: '您没有选中商品',
        icon: 'none'
      })
      return;
    }

    wx.setStorageSync("buy_info", JSON.stringify(selectCartGoods));

    wx.navigateTo({
      url: '/pages/checkout/checkout',
    })
  },

  onRemove: function (e) {
    var page = this;
    var cartIds = [e.currentTarget.dataset.path];

    app.request({
      url: 'v2/ecapi.cart.delete',
      data: { good: JSON.stringify(cartIds) },
      success: function (res) {
        page.refreshCartGoods();
      }
    });
  },

  //dependencies:selectPaths, goodsGroups
  getSelectGoods: function () {
    var selectGoods = [];
    for (var i=0; i<this.data.selectPaths.length; i++) {
      var recId = this.data.selectPaths[i];
      selectGoods.push(this.getCartGoodsByRecId(recId));
    }
    return selectGoods;
  },

  getCartGoodsByRecId: function (recid) {
    var res = null;

    if (this.data.goodsGroups.length < 1){
      return null;
    }

    for (var i = 0; i < this.data.goodsGroups[0].goods.length; i++) {
      var cartGoods = this.data.goodsGroups[0].goods[i];
      if (cartGoods.id == recid) {
        res = cartGoods;
        break;
      }
    }

    return res;
  },

  /* flow */
  /**
   * refresh
   * 1 ecapi.cart.get
   * 2 selectPaths all
   * 3 ecapi.order.price
   * 
   */
  refresh: function () {
    var page = this;
    app.request({
      url: 'v2/ecapi.cart.get',
      success: function (res) {
        //selectall
        var selectAll = true;
        var selectPaths = [];
        if (res.goods_groups && res.goods_groups.length > 0){
          for (var i = 0; i < res.goods_groups[0].goods.length; i++) {
            var cartGoods = res.goods_groups[0].goods[i];
            selectPaths.push(cartGoods.id);
          }
        }

        //格式化规格
        var goodsGroups = res.goods_groups;


        page.setData({
          selectAll:selectAll,
          selectPaths:selectPaths,
          goodsGroups: goodsGroups,
        });

        console.log([1, 20].indexOf(20), 1100, selectPaths, typeof selectPaths);

        page.setupOrderPrice();
        page._refreshSelectNum();
      }
    });
  },
  refreshCartGoods: function () {
    var page = this;
    app.request({
      url: 'v2/ecapi.cart.get',
      success: function (res) {
        //selectall
        var cartRecids = [];
        if (res.goods_groups && res.goods_groups.length > 0){
          for (var i = 0; i < res.goods_groups[0].goods.length; i++) {
            var cartGoods = res.goods_groups[0].goods[i];
            cartRecids.push(cartGoods.id);
          }
        }
        
        var oldSelectPaths = page.data.selectPaths;
        for (var i = 0; i < oldSelectPaths.length; i++) {
          var oldRecId = oldSelectPaths[i];
          if (cartRecids.indexOf(oldRecId) > -1){

          }else{
            oldSelectPaths.splice(i, 1);
          }
        }
        
        var selectAll = oldSelectPaths.length == (res.goods_groups.length > 0 ? res.goods_groups[0].goods.length : 0);

        //格式化规格
        var goodsGroups = res.goods_groups;

        page.setData({
          selectAll: selectAll,
          selectPaths: oldSelectPaths,
          goodsGroups: goodsGroups,
        });

        page.setupOrderPrice();
        page._refreshSelectNum();
      }
    });
  },
  setupOrderPrice: function () {
    var page = this;

    //如果为空则不计算order  price
    var selectCartGoods = page.getSelectGoods();
    console.log("selectCartGoods", selectCartGoods);

    var selectGoods = [];
    for (var i = 0; i < selectCartGoods.length; i++) {
      var cartGoods = selectCartGoods[i];

      selectGoods.push({
        goods_id: cartGoods.goods_id,
        property: cartGoods.attrs.split(','),
        num: cartGoods.amount
      });
    }

    if (selectGoods.length < 1) {
      var order_price = page.data.order_price;
      order_price.goods_price = 0;
      page.setData({
        order_price: order_price
      });
      return;
    }

    app.request({
      url: 'v2/ecapi.order.price',
      data: { order_product: JSON.stringify(selectGoods) },
      success: function (res) {
        page.setData({
          order_price: res.order_price
        });
      }
    });
  },

  _refreshSelectNum: function () {
    var selectGoods = this.getSelectGoods();
    console.log("selectGoods", selectGoods);

    var num = 0;
    for(var i=0; i<selectGoods.length; i++){
      num += selectGoods[i].amount;
    }

    this.setData({select_num:num});
  }
})