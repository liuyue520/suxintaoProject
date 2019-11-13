var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Wstate: 1,
    brand_id: -1, //99 299
    cat_id:-1,

    hot_goods_list: [],

    page: 1,
    hasMore: false,
    TabStatus: 0,
    value:2,
    key:null,
    loadingHidden:false,
    ispaixu: 1,
    xiaoliang:1,
    xinping: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(typeof options.brand_id != 'undefined'){
      this.data.brand_id = options.brand_id;
    } 
    // console.log(options.brand_id, '1231231', options.cat_id)
    if (typeof options.cat_id != 'undefined') {
      this.data.cat_id = options.cat_id;
    }
    this.onRefresh();
  },

  onReachBottom: function () {
    let page = this
    page.setData({
      loadingHidden: false
    })
    // console.log(page.data.value)
    switch (page.data.TabStatus) {
      case 0:
        if (this.data.hasMore) {
          page.onLoadMore(null, this.data.value);
        }
        break;
      case 1:
        if (page.data.hasMore) {
          console.log(this.data.xiaoliang,'下拉一户')
          page.onLoadMore(4, this.data.xiaoliang);
        }
        break;
      case 2:
        if (page.data.hasMore) {
          page.onLoadMore(5, this.data.xinping);
        }
        break;
      case 3:
        if (page.data.hasMore) {
          page.onLoadMore(1, this.data.ispaixu);
        }
        break;
    }
    setTimeout(function(){
      page.setData({
        loadingHidden: true
      })
    },3000)
  },

  getParams: function (params) {
    if (this.data.brand_id > 0) {
      params.brand = this.data.brand_id;
    }

    if (this.data.cat_id > 0) {
      params.category = this.data.cat_id;
    }

    return params;
  },
  Synthe: function () {
    let that = this
    that.setData({
      TabStatus: 0,
      loadingHidden: false,
      value:2
    })
      that.onRefresh(null, that.data.value);
  },
  ListVolume:function(){
    let that = this
    that.setData({
      TabStatus: 1,
      loadingHidden: false
    })
    if (that.data.xiaoliang){
      if (that.data.xiaoliang == 1){
        that.data.xiaoliang++
        that.setData({
          hot_goods_list:[],
          xiaoliang: that.data.xiaoliang
        })
        that.onRefresh(4, that.data.xiaoliang)
        console.log(that.data.xiaoliang)
      } else if (that.data.xiaoliang == 2){
        that.data.xiaoliang--
        that.setData({
          hot_goods_list: [],
          xiaoliang: that.data.xiaoliang
        })
        that.onRefresh(4, that.data.xiaoliang)
      }
    }
  },
  NewProd:function(){
    let that = this
    that.setData({
      TabStatus: 2,
      loadingHidden: false
    })
    if (that.data.xinping) {
      if (that.data.xinping == 1) {
        that.data.xinping++
        that.setData({
          hot_goods_list: [],
          xinping: that.data.xinping
        })
        that.onRefresh(5, that.data.xinping)
        console.log(that.data.xinping)
      } else if (that.data.xinping == 2) {
        that.data.xinping--
        that.setData({
          hot_goods_list: [],
          xinping: that.data.xinping
        })
        that.onRefresh(5, that.data.xinping)
      }
    }
  },
  ListSort:function(){
    let that = this
    that.setData({
      TabStatus: 3,
      loadingHidden: false
    })
    if (that.data.ispaixu) {
      if (that.data.ispaixu == 1) {
        that.data.ispaixu++
        that.setData({
          hot_goods_list: [],
          ispaixu: that.data.ispaixu
        })
        that.onRefresh(1, that.data.ispaixu)
        console.log(that.data.ispaixu)
      } else if (that.data.ispaixu == 2) {
        that.data.ispaixu--
        that.setData({
          hot_goods_list: [],
          ispaixu: that.data.ispaixu
        })
        that.onRefresh(1, that.data.ispaixu)
      }
    }
  
  },
  onRefresh: function (key,value) {
    var page = this;
    // console.log(value, '排序')
    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page.getParams({ page: 1, per_page: 8, sort_key: key, sort_value:value}),
      success: function (res) {
        wx.stopPullDownRefresh();
        page.setData({
          hot_goods_list: res.products,
          page: 1,
          hasMore: res.paged.more > 0,
          loadingHidden:true
        });
      }
    });
  },

  onLoadMore: function (key, value) {
    // console.log(value,'排序')
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page.getParams({ page: page.data.page + 1, per_page: 8, sort_key: key, sort_value: value}),
      success: function (res) {
        page.setData({
          hot_goods_list: page.data.hot_goods_list.concat(res.products),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          loadingHidden:true
        });
      }
    });
  },
  Select: function () {
    let that = this
    let State = that.data.Wstate
    if (State === 1) {
      that.data.Wstate++
      console.log(that.data.Wstate)
      that.setData({
        Wstate: that.data.Wstate
      })
      return
    } else if (State === 2) {
      that.data.Wstate--
      console.log(that.data.Wstate)
      that.setData({
        Wstate: that.data.Wstate
      })
    }
  },
  Tariff: function () {
    let that = this
    let isList = that.data.list
    for (let i = 0; i < isList.length; i++) {
      console.log(isList[i].Price);
    }
  },
  isOrderID: function (e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + id,
    })
  },
})