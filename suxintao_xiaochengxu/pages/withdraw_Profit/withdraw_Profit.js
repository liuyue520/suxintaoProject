// pages/withdraw_Profit/withdraw_Profit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingHidden:false,
    show: false,//控制下拉列表的显示隐藏，false隐藏、true显示
    selectData: ['1', '2', '3', '4', '5', '6'],//下拉列表的数据
    index: 0,//选择的下拉列表下标
    year:[],
    withdraw_Profit: [
      { confirm: 129, personal: 89, Tiem:'2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      { confirm: 129, personal: 89, Tiem: '2019-11-18' },
      ]
  },
  // 点击下拉显示框
  selectTap() {
    this.setData({
      show: !this.data.show
    });
  },
  // 点击下拉列表
  optionTap(e) {
    let Index = e.currentTarget.dataset.index;//获取点击的下拉列表的下标
    this.setData({
      index: Index,
      show: !this.data.show
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    var myDate = new Date();
    var startYear = myDate.getFullYear() - 1;//起始年份 
    var endYear = myDate.getFullYear() + 50;//结束年份 
    var obj = that.data.year
    for (var i = startYear - 1; i <= endYear; i++) {
      obj.push(i)
    }
    obj[0] = myDate.getFullYear();
    console.log(obj)
    that.setData({
      selectData:obj
    })
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
    let that = this
    that.refresh_list()
  },
  refresh_list: function () {
    var page = this;
    app.request({
      url: 'v2/withdraw.apply.list2',
      data: { page: 1, per_page: 8},
      success: function (res) {
        wx.stopPullDownRefresh();
        console.log(res)
        page.setData({
          withdraw_Profit: res.apply_list,
          page: 1,
          hasMore: res.paged.more > 0,
          loadingHidden: true
        });
      }
    });
  },
  more_refresh_list: function () {
    var page = this;
    page.setData({
      loadingHidden: false
    })
    app.request({
      url: 'v2/withdraw.apply.list2',
      data:{ page: page.data.page + 1, per_page: 8},
      success: function (res) {
        if (res.error_code == 0){
          page.setData({
            withdraw_Profit: page.data.withdraw_Profit.concat(res.apply_list),
            page: page.data.page + 1,
            hasMore: res.paged.more > 0,
            loadingHidden: true
          });
        }else{
          page.setData({
            loadingHidden: true
          });
        }
      }
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
    let that = this
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this
    that.more_refresh_list()
    console.log(111)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})