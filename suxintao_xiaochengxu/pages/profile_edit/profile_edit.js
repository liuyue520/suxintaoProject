// pages/profile_edit/profile_edit.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:'',
    field:'',
    val:''
  },

  config:{
    declaration:{
      title:'个性宣言',
    },
    nickname: {
      title: '昵称',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title:this.config[options.field].title,
      field: options.field,
      val:options.val,
    });
  },


  onInput: function (e) {
    console.log("inputRealname", e);
    this.data.val = e.detail.value;
  },
  onSubmit:function(e){
    if (this.data.val == ''){
      wx.showToast({
        title: '请输入' + this.data.title,
        icon:'none'
      })
      return;
    }

    var page = this;
    var params = {};
    params[this.data.field] = this.data.val;
    app.request({
      url: 'v2/ecapi.user.profile.update',
      data: params,
      success: function (res) {
        wx.navigateBack({
          delta:1,
        })
      }
    });
  }
})