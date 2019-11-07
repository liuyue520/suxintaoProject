// pages/classify/classify.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navLeftItems: [],
    navRightItems: [],
    RightItemsTitle:'',
    curNav: 1,
    curIndex: 0  
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    that.LoadData()
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

  },
  LoadData:function(){
    let that = this
    app.request({
      url: 'v2/ecapi.category.list',
      data: { page: 1, per_page: 1000 },
      success: function (res) {
        for (let i in res.categories) {
          that.setData({
            navLeftItems: res.categories,
            RightItemsTitle: res.categories[0].name,
            navRightItems: res.categories[0].categories
          });
        }
        console.log(that.data.navLeftItems, '分类数据');
      }
    });
  },
  switchRightTab: function (e) {
    // 获取item项的id，和数组的下标值  
    let id = e.target.dataset.id,
      index = parseInt(e.target.dataset.index);
    // 把点击到的某一项，设为当前index  
    this.setData({
      curNav: id,
      curIndex: index,
      navRightItems: this.data.navLeftItems[index].categories,
      RightItemsTitle:this.data.navLeftItems[index].name
    })
    console.log(this.data.navRightItems)
  },
  GoogList:function(e){
    console.log(e);
    let OnlyGoogId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/goods_list/goods_list?cat_id=' + OnlyGoogId,
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    let that = this
    // that.setData({
    //   curNav: 1,
    //   curIndex: 0  
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})