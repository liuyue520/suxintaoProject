// pages/address_list/address_list.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    consigneeList:[],
    isChoose:false,
    loadingHidden:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;
    console.log(options,'隐藏');
    if (options.hide){
      page.setData({
        hide: options.hide
      })
    }
    // page.data.isChoose = options.choose && options.choose == 1;
    // console.log(page.data.isChoose);
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
    var page = this;

    app.request({
      url: 'v2/ecapi.consignee.list',
      success: function (res) {
        page.setData({
          isChoose: page.data.isChoose,
          consigneeList: res.consignees,
          loadingHidden: true
        });
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },
  onSwitchDefault:function(e){
    let that = this
    let index = e.currentTarget.dataset.index
    let consigneeList = that.data.consigneeList
    // console.log(that.data.consigneeList)
    for (let i = 0;i < consigneeList.length;i++){
      consigneeList[i].is_default = false
      consigneeList[index].is_default = true
      // if (consigneeList[index].is_default == true){
      //   wx.showToast({
      //     title: '已经是默认地址！',
      //   })
      // }
      that.setData({
        consigneeList: consigneeList
      })
    }
  },

  onChoose: function (e) {
    var dataSet = e.currentTarget.dataset;
    var index = dataSet.index;
    var consignee = JSON.stringify(this.data.consigneeList[index]);
    wx.setStorageSync("consignee", consignee);
    wx.navigateBack({
      delta: 1
    })
  },
  
  onEdit:function(e){
    var dataSet = e.currentTarget.dataset;
    var index = dataSet.index;

    var consignee = JSON.stringify(this.data.consigneeList[index]);
    wx.navigateTo({
      url: '/pages/address_info/address_info?consignee=' + consignee,
    })
  },
  
  onAdd:function(e){
    wx.navigateTo({
      url: '/pages/address_info/address_info',
    })
  },
  onRemove:function(e){
    console.log(e);
    var page = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除改地址吗',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          var dataSet = e.currentTarget.dataset;
          var consigneeID = dataSet.consigneeId;
          var index = dataSet.index;
          app.request({
            url:'v2/ecapi.consignee.delete',
            data: { consignee: consigneeID},
            success:function(){
              var consigneeList = page.data.consigneeList;
              consigneeList.splice(index, 1);
              page.setData({
                consigneeList:consigneeList,
              });

              wx.removeStorageSync("consignee");
            }
          });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})