// pages/supplier_apply/supplier_apply.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    upload_images: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onFormSubmit:function(e){
    console.log("form submit ", e, this.data.upload_images);
    let params = {};

    params.company = e.detail.value.company;
    if (params.company == ""){
      wx.showToast({
        title: '请输入品牌/公司',
        icon: "none"
      })
      return;
    }

    params.goods_name = e.detail.value.goods_name;
    if (params.goods_name == "") {
      wx.showToast({
        title: '请输入产品名称',
        icon: "none"
      })
      return;
    }

    params.contact_name = e.detail.value.contact_name;
    if (params.contact_name == "") {
      wx.showToast({
        title: '请输入您的姓名',
        icon: "none"
      })
      return;
    }

    params.contact_mobile = e.detail.value.contact_mobile;
    if (params.contact_mobile == "") {
      wx.showToast({
        title: '请输入您的联系电话',
        icon: "none"
      })
      return;
    }

    params.remark = e.detail.value.remark;

    params.image_urls = JSON.stringify(this.data.upload_images);

    var page = this;
    app.request({
      url: 'v2/supplier_apply.add',
      data:params,
      success: function (res) {
        wx.showModal({
          content: '您的资料已提交，我们将尽快处理',
          success(res) {
            if (res.confirm) {
              console.log('用户点击确定')
              wx.navigateBack({
                delta: 1,
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
              wx.navigateBack({
                delta: 1,
              })
            }
          }
        })
      }
    })
  },

  onAddImage: function (e) {
    console.log("upload image ", e);
    if(this.data.upload_images.length >= 4){
      wx.showToast({
        title: '最多上传四张',
        icon: "none"
      })
      return;
    }
    var page = this;
    wx.chooseImage({
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.host + 'v2/supplier_apply.upload', // 仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          success(res) {
            var response = JSON.parse(res.data);
            // do something
            const { upload_images } = page.data;
            upload_images.push(response.url);

            page.setData({ upload_images: upload_images });
          }
        })
      }
    })
  },

  onRemoveImageUrl:function(e){
    var index = e.currentTarget.dataset.index;
    const {upload_images} = this.data;
    upload_images.splice(index, 1);
    this.setData({ upload_images: upload_images});
  }
})