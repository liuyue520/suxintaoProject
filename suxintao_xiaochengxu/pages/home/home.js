// pages/home/home.js
var app = getApp();
import Monitor from '../../utils/monitor.js';
Page(Monitor.hookPage({

  /**
   * 页面的初始数据
   */
  data: {
    banners:null,
    Wstate: 1,
    current_promotion_index: -1,
    promotions: null,

    hot_goods_list:[],
    page: 1,
    hasMore: false,

    topis:[],
    brands:[],

    showAcitivity:false,
    nonet: true,
    Position:false,
    TabStatus:0,
    ScrollLength:1,
    ImgState:true,
    loadingHidden:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    console.log("options home load", options);
    app.saveParentReferCodeByOptions(options);
    app.checkLogin(this);
    that.refresh();
    console.log(app.HomeState, '状态');
  },

  onShow: function () {
    let that = this
    console.log("options home show", app.getParentReferCode());
    app.bindParent();
    if(that.data.ImgState == true){
        that.setData({
          ImgState: false
        })
      // 倒计时30分钟
      // setTimeout(function () {
      //   that.setData({
      //     ImgState: false
      //   })
      // }, 18000)
    }
    // if (app.HomeState == true) {
    //   that.setData({
    //     ImgState: true
    //   })
    // }
  },
  onTapPromotionTab: function (e) {
    let that = this
    var index = e.currentTarget.dataset.index;
    this.setData({ current_promotion_index: index });
    let isList = that.data.promotions
    that.setData({
      ScrollLength: isList[index].goods_list.length
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var title = "苏心淘";
    var member = app.getMember();
    var path = "/pages/home/home?refer_code=" + member.refer_code;
    console.log("member", member, path);
    var imageUrl = '';

    return {
      title: title,
      path: path,
      imageUrl: imageUrl
    }
  },

  onPullDownRefresh: function () {
    let that = this
    that.refresh();
    setTimeout(function(){
      that.setData({
        ImgState: false
      })
    },1000)
  },

  onReachBottom: function () {
    
    switch (this.data.TabStatus) {
      case 0:
        if (this.data.hasMore) {
          this.more_goods_list();
        }
        break;
      case 1:
        if (this.data.hasMore) {
          this.ListVolume2()
        }
        break;
      case 2:
        if(this.data.hasMore){
          this.NewProd2()
        }
        break;
      case 3:
      if(this.data.hasMore){
        this.ListSort2();
      }
      break;
    }
  },

  refresh: function () {
    var page = this;

    app.request({
      url: "v2/ecapi.home.product.list",
      success: function (res) {
        var promtions = res.promote_products;
        console.log(res)
        var current = -1;
        for(var i=0; i<promtions.length; i++){
          if (promtions[i].status == 0){
            current = i;
          }
          let All = promtions[i].goods_list
          for(let y = 0;y < All.length;y++){
            let jindu = All[y].sales_count + All[y].good_stock
            let satrt = All[y].sales_count  / jindu
            promtions[i].goods_list[y].jinsuStart = Math.floor(satrt * 100)
          }
        }
        console.log(promtions)
        page.setData({
          banners:res.banners,
          promotions: promtions,
          current_promotion_index: 1,
          topics:res.topics,
          channels:res.channels,
          brands: res.brands,
          ScrollLength: promtions[0].goods_list.length
        });
        wx.stopPullDownRefresh();
      }
    });
    page.refresh_goods_list();
    page.activityInit();
  },


  refresh_goods_list: function () {
    var page = this;
    app.request({
      url: 'v2/home.hot_goods',
      data: page.getParams({ page: 1, per_page: 8 ,stateCode:0}),
      success: function (res) {
        wx.stopPullDownRefresh();
        console.log(res.goods_list,'商品')
        page.setData({
          hot_goods_list: res.goods_list,
          page: 1,
          hasMore: res.paged.more > 0,
          loadingHidden: true
        });
      }
    });
  },

  getParams: function (params) {
    return params;
  },

  more_goods_list: function () {
    var page = this;
    app.request({
      url: 'v2/home.hot_goods',
      data: page.getParams({ page: page.data.page + 1, per_page: 8, stateCode: 0}),
      success: function (res) {
        page.setData({
          hot_goods_list: page.data.hot_goods_list.concat(res.goods_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          loadingHidden: true
        });
      }
    });
  },

  //activity
  activityInit:function(){
    var page = this;

    app.request({
      url: "v2/activity.check_show",
      success: function (res) {
        page.setData({ showAcitivity: res.can_show, activity_pop: res.image_url});
      }
    });
  },

  onCloseModal:function(e){
    this.setData({ showAcitivity: false });
  },
  //今日热卖
  // 综合
  Synthe: function () {
    let that = this
    that.refresh_goods_list()
    that.setData({
      TabStatus:0,
      loadingHidden: false
    })
  },
  // 销量
  ListVolume: function () {
    let that = this
    that.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: { page: 1, per_page: 8, stateCode: 1 },
      success: function (res) {
        that.setData({
          hot_goods_list: res.goods_list,
          page: 1,
          hasMore: res.paged.more > 0,
          TabStatus: 1,
          loadingHidden: true
      })
      }
    });
  }, 
  ListVolume2: function () {
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: page.getParams({ page: page.data.page + 1, per_page: 8, stateCode: 1 }),
      success: function (res) {
        page.setData({
          hot_goods_list: page.data.hot_goods_list.concat(res.goods_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          TabStatus: 1,
          loadingHidden: true
        });
      }
    });
    console.log(page.data.hot_goods_list)
  },
  // 新品
  NewProd:function(){
    let that = this
    that.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: { page: 1, per_page: 8, stateCode: 2 },
      success: function (res) {
        that.setData({
          hot_goods_list: res.goods_list,
          page: 1,
          hasMore: res.paged.more > 0,
          TabStatus: 2,
          loadingHidden: true
        })
      }
    });
  },
  NewProd2: function () {
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: page.getParams({ page: page.data.page + 1, per_page: 8, stateCode: 2 }),
      success: function (res) {
        console.log(res)
        page.setData({
          hot_goods_list: page.data.hot_goods_list.concat(res.goods_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          TabStatus: 2,
          loadingHidden: true
        });
      }
    });
  },
  // // 价格
  ListSort: function () {
    let that = this
    that.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: { page: 1, per_page: 8, stateCode: 3 },
      success: function (res) {
        console.log(res)
        that.setData({
          hot_goods_list: res.goods_list,
          page: 1,
          hasMore: res.paged.more > 0,
          TabStatus: 3,
          loadingHidden: true
        })
      }
    });
  },
  ListSort2: function () {
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/home.hot_goods',
      data: page.getParams({ page: page.data.page + 1, per_page: 8, stateCode: 3 }),
      success: function (res) {
        console.log(res)
        page.setData({
          hot_goods_list: page.data.hot_goods_list.concat(res.goods_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0,
          TabStatus: 3,
          loadingHidden: true
        });
      }
    });
  },
  // 布局切换
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
  // 跳转页面
  isOrderID: function (e) { 
    let id = e.currentTarget.dataset.id
    console.log(id)
    wx.navigateTo({
      url: '/pages/goods/goods?id=' + id,
    })
  },
  onColse:function(){
    let that = this
    that.setData({
      ImgState:true
    })
    // // 倒计时30分钟
    // setTimeout(function(){
    //   that.setData({
    //     ImgState:false
    //   })
    // },18000)
  },
  activity:function(){
    wx.navigateTo({
      url: '/pages/activity_goods/activity_goods',
    })
  }
}))