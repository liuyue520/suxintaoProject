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
    hasMore: false,
    scrollTopS:false,
    TabStatus:0,
    Wstate:1,
    value:2,
    xiaoliang: 1,
    xinping:1,
    loadingHidden: false,
    ispaixu: 1,
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
  Synthe:function(){
    let that = this
    that.setData({
      TabStatus: 0,
      value: 2,
      loadingHidden: false
    })
    that._search(null,that.data.value)
  },
  ListVolume: function () {
    let that = this
    that.setData({
      TabStatus: 1,
      loadingHidden: false
    })
    if (that.data.value == 2) {
      that._search(4, that.data.value);
      that.setData({
        value: 1
      })
    } else {
      that._search(4, that.data.value);
      that.setData({
        value: 2
      })
    }
    if (that.data.value == 1) {
      that.setData({
        xiaoliang: 1
      })
    } else {
      that.setData({
        xiaoliang: 2
      })
    }
  },
  NewProd: function () {
    let that = this
    that.setData({
      TabStatus: 2,
      loadingHidden: false,
    })
    if (that.data.value == 2) {
      that._search(5, that.data.value);
      that.setData({
        value: 1
      })
    } else {
      that._search(5, that.data.value);
      that.setData({
        value: 2
      })
    }
    if (that.data.value == 1) {
      that.setData({
        xinping: 1
      })
    } else {
      that.setData({
        xinping: 2
      })
    }
  },
  ListSort: function () {
    let that = this
    that.setData({
      TabStatus: 3,
     loadingHidden: false
    })
    if (that.data.value == 1) {
      that.setData({
        ispaixu: 1
      })
    } else {
      that.setData({
        ispaixu: 2
      })
    }
    if (that.data.value == 2) {
      that._search(1, that.data.value);
      that.setData({
        value: 1
      })
    } else {
      that._search(1, that.data.value);
      that.setData({
        value: 2
      })
    }
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
  isOrderID: function (e) {
    let id = e.currentTarget.dataset.id
    console.log(id)
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if(this.data.show_result){
      // if (this.data.hasMore) {
      //   this._search_more();
      // }
      console.log(this.data.value)
      switch (this.data.TabStatus) {
        case 0:
          if (this.data.hasMore) {
            this._search_more(null, this.data.value);
          }
          break;
        case 1:
          if (this.data.hasMore) {
            this._search_more(4, this.data.value);
          }
          break;
        case 2:
          if (this.data.hasMore) {
            this._search_more(5, this.data.value);
          }
          break;
        case 3:
          if (this.data.hasMore) {
            this._search_more(1, this.data.value);
          }
          break;
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


  _search:function(key,value){
    var page = this;

    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page._getParams({ page: 1, per_page: 8, sort_key: key, sort_value: value}),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          goods_list: res.products,
          page: 1,
          hasMore: res.paged.more > 0,
          loadingHidden: true
        });
      }
    });
  },

  _search_more: function(){
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/ecapi.search.product.list',
      data: page._getParams({ page: page.data.page + 1, per_page: 8 }),
      success: function (res) {
        page.setData({
          goods_list: page.data.goods_list.concat(res.products),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          loadingHidden: true
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