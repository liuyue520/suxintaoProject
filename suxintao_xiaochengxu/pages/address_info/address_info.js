// pages/address_info/address_info.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

    //regions 
    multiArray: [],
    multiIndex: [],
    regions:null,

    consignee:null,

    isChoose:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initRegions();

    if(typeof options.consignee != "undefined"){
      this.setData({
        consignee: JSON.parse(options.consignee)
      });
    }

    if (typeof options.choose != "undefined" && options.choose == 1) {
      this.data.isChoose = true
    }
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


  /**
   * module regions
   */
  initRegions:function(){
    var page = this;
    app.request({
      url: "v2/ecapi.region.list",
      success: function (res) {
        var multiIndex = [0, 0, 0];//default province City district
        if(page.data.consignee){
          var consignee = page.data.consignee;

          var regions_province = res.regions[0].regions;
          for (var i = 0; i < regions_province.length; i++) {
            var province = regions_province[i];
            if (province.id == consignee.regions[1].id){
              multiIndex[0] = i;
              break;
            }
          }

          var regions_cities = regions_province[multiIndex[0]].regions;
          for (var i = 0; i < regions_cities.length; i++) {
            var city = regions_cities[i];
            if (city.id == consignee.regions[2].id) {
              multiIndex[1] = i;
              break;
            }
          }

          var regions_districts = regions_cities[multiIndex[1]].regions;
          for (var i = 0; i < regions_districts.length; i++) {
            var district = regions_districts[i];
            if (district.id == consignee.regions[3].id) {
              multiIndex[2] = i;
              break;
            }
          }
        }

        var provinces = [];
        var cities = [];
        var districts = [];

        var regions_province = res.regions[0].regions;
        page.data.regions = regions_province;
        for (var i = 0; i < regions_province.length; i++) {
          var province = regions_province[i];
          provinces.push(province.name);
        }

        //default province 0
        var regions_cities = regions_province[multiIndex[0]].regions;
        for (var i = 0; i < regions_cities.length; i++) {
          var city = regions_cities[i];
          cities.push(city.name);
        }

        //default city 0
        var regions_districts = regions_cities[multiIndex[1]].regions;
        for (var i = 0; i < regions_districts.length; i++) {
          var district = regions_districts[i];
          districts.push(district.name);
        }

        page.setData({
          multiIndex: multiIndex,
          multiArray: [provinces, cities, districts],
        });
      }
    });
  },
  bindMultiPickerChange(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiIndex: e.detail.value
    })
  },
  bindMultiPickerColumnChange(e) {
    var page = this;
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    
    switch (e.detail.column) {
      case 0:
        data.multiIndex[0] = e.detail.value;
        data.multiIndex[1] = 0;
        data.multiIndex[2] = 0;
        
        data.multiArray[1] = getSubRegions(data.multiIndex[0], -1);
        data.multiArray[2] = getSubRegions(data.multiIndex[0], data.multiIndex[1]);
        break

      case 1:
        data.multiIndex[1] = e.detail.value;
        data.multiIndex[2] = 0;
        
        data.multiArray[2] = getSubRegions(data.multiIndex[0], data.multiIndex[1]);
        break

      case 2:
        data.multiIndex[2] = e.detail.value;
        break
    }
    console.log(data.multiIndex)
    this.setData(data)

    function getSubRegions(proviceIndex, cityIndex) {
      var res = [];

      console.log("page.data.regions", page.data.regions);

      var regions = [];
      if (cityIndex >= 0) {
        regions = page.data.regions[proviceIndex].regions[cityIndex].regions;
      } else {
        regions = page.data.regions[proviceIndex].regions;
      }

      for (var i = 0; i < regions.length; i++) {
        res.push(regions[i].name);
      }
      return res;
    }
  },

  onFormSubmit:function(e){
    console.log(e, this.data.multiIndex);
    var page = this;
    
    var params = e.detail.value;
    if (params.name.length < 1){
      wx.showToast({
        title: '收货人姓名不能为空',
        icon: "none"
      })
      return;
    }
    if (params.mobile.length < 1) {
      wx.showToast({
        title: '手机号码不能为空',
        icon: "none"
      })
      return;
    }
    if (params.address.length < 1) {
      wx.showToast({
        title: '详细地址不能为空',
        icon: "none"
      })
      return;
    }

    if(this.data.multiIndex.length < 2){
      wx.showToast({
        title: '所在地区不能为空',
        icon: "none"
      })
      return;
    }
    params.region = this.data.regions[this.data.multiIndex[0]]
                    .regions[this.data.multiIndex[1]]
                    .regions[this.data.multiIndex[2]].id;
    console.log(params);
    if (page.data.consignee) {
      params.consignee = page.data.consignee.id;
      app.request({
        url: 'v2/ecapi.consignee.update',
        data: params,
        success: function (res) {
          wx.showToast({
            title: '保存成功!',
            icon: 'success',
            duration: 1500
          })
          setTimeout(function(){
            wx.navigateBack()
          },1500)
        }
      });
    }else{
      app.request({
        url: 'v2/ecapi.consignee.add',
        data: params,
        success: function (res) {
          if(page.data.isChoose){
            wx.setStorageSync("consignee", JSON.stringify(res.consignee));
          }

          wx.navigateBack({
            delta:1
          })
        }
      });
    }
  }
})