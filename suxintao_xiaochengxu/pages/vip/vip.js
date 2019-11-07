// pages/vip/vip.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: null,
    goods_list: null,
    page: 1,
    hasMore: false,

    qrcode: null,
    show_qrcode: false,

    vip_goods_list:[],

    fans:{},
    income:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.refresh();
  },
  onShow:function(){
    this.refresh();
  },
  refresh:function(){
    var page = this;
    app.request({
      url: 'v2/ecapi.vip',
      success: function (res) {
        wx.stopPullDownRefresh();
        page.setData({
          user: res.user,
          vip_goods_list: res.vip_goods_list,
          fans: res.fans,
          income: res.income
        });
      }
    })
    this.refresh_goods_list();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.refresh();
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.more_goods_list();
    }
  },

  onCopy: function (e) {
    app.copyToClipboard(e.currentTarget.dataset.text);
  },

  onShowQrcode: function (e) {
    var page = this;
    if (page.data.qrcode == null) {
      wx.showLoading({
        title: 'loading...',
      })
      app.request({
        url: 'v2/share.qrcode',
        success: function (res) {
          wx.hideLoading();
          page.setData({
            qrcode: res.qrcode,
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
  refresh_goods_list: function () {
    var page = this;

    app.request({
      url: 'v2/vip.hot_goods',
      data: page.getParams({ page: 1, per_page: 8 }),
      success: function (res) {
        wx.stopPullDownRefresh();

        page.setData({
          goods_list: res.goods_list,
          page: 1,
          hasMore: res.paged.more > 0
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
      url: 'v2/vip.hot_goods',
      data: page.getParams({ page: page.data.page + 1, per_page: 8 }),
      success: function (res) {
        page.setData({
          goods_list: page.data.goods_list.concat(res.goods_list),
          page: page.data.page + 1,
          hasMore: res.paged.more > 0
        });
      }
    });
  },
})