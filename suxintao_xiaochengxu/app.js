//app.js
const systemInfo = wx.getSystemInfoSync();
import Monitor from '/utils/monitor';
App(Monitor.hookApp({
  //todo
  host: "http://47.99.59.250/",// http://47.99.59.250/ 
  // host:'https://suxintao.oioos.com/',
  onError(err) {
    console.log('进入onError:', err);
  },
  onLaunch: function () {
    console.log("app launch", "WRAuth", this.getToken(), typeof this.getToken(), this.getToken.length);
    if (this.getToken()) {
      console.log("WRAuth", "true");
    } else {
      console.log("WRAuth", "false");
    }
  },

  /**
   * request
   */
  request: function (obj) {
    let  that = this;
    wx.request({
      url: this.host + obj.url,
      header: this.getToken() ? { 'X-ECAPI-Authorization': this.getToken() } : {},
      method: obj.method || "POST",
      data: obj.data || {},
      dataType: obj.dataType || "json",
      success: function (response) {
        //console.log("request params", obj.data);
        var res = response.data;
        // console.log("app request", res);
        if (res.error_code == 10001) {
          wx.showToast({
            title: '请先登录!',
            icon: 'none'
          })
          console.log(this,that)
          console.log(that.whetherLogin(),'状态')
          if (that.whetherLogin() == false){
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }
        }
        else if (res.error_code == 10002) {
          wx.showToast({
            title: '登录过期',
            icon: 'none'
          })
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
        else if (res.error_code > 0) {
          if (obj.error) {
            obj.error(res);
          }else{
            wx.showToast({
              title: res.error_desc,
              icon: 'none'
            })
          }
        }
        else {
          if (obj.success) {
            obj.success(res);
          }
        }
      },
      fail: function (res) {
        if (obj.fail) {
          obj.fail(res);
        }
        wx.showToast({
          title: res.errMsg,
          icon: 'none'
        });
      },
      complete: function(res){
        // console.log("request", "app complete", obj);
        if (obj.complete) {
          obj.complete(res);
        }
      }
    })
  },

  /**
   * login
   *判断是否登陆 
   * 
  */
  checkLogin: function (page) {
    if (!this.getToken()) {
      // wx.navigateTo({
      //   url: '/pages/login/login',
      // })
    }
  },
  saveToken: function (token) {
    wx.setStorageSync("token", token);
  },
  getToken: function () {
    return wx.getStorageSync("token");
  },
  removeToken: function () {
    wx.removeStorageSync("token");
  },
  isLogin: function (aa){
    let text = '';
    try {
      text = wx.setStorageSync("LoginState", aa);
    } catch (e) {
      console.log(e)
    }
    return text;
  },
  whetherLogin: function (){
    return wx.getStorageSync("LoginState");//这个为什么不行
  },
  /**
   * 获取胶囊按钮位置
   */
  getMenuPosition() {
    let top = 4
    let right = 7
    let width = 87
    let height = 32
    if (systemInfo.platform === 'devtools' && systemInfo.system.indexOf('Android') === -1) {
      top = 6
      right = 10
    }
    else if (systemInfo.platform === 'devtools' && systemInfo.system.indexOf('Android') != -1) {
      top = 8
      right = 10
    }
    else if (systemInfo.system.indexOf('Android') != -1) {
      top = 8
      right = 10
      width = 95
    }
    return {
      top: systemInfo.statusBarHeight + top,
      left: systemInfo.windowWidth - width - right,
      width: width,
      height: height
    }
  },
  /**
   * 获取导航栏样式
   */
  getNavigationBarStyle() {
    let menuPosition = this.getMenuPosition()
    let navigationBarPosition = {
      top: systemInfo.statusBarHeight,
      left: 0,
      width: systemInfo.windowWidth,
      height: (menuPosition.top - systemInfo.statusBarHeight) * 2 + menuPosition.height
    }
    return navigationBarPosition
  },
  /**
   * 获取导航样式
   */
  getNavigationStyle() {
    let menuPosition = this.getMenuPosition()
    let padding = systemInfo.windowWidth - menuPosition.left - menuPosition.width
    let navigationPosition = {
      top: menuPosition.top,
      left: padding,
      width: systemInfo.windowWidth - padding * 3 - menuPosition.width,
      height: menuPosition.height
    }
    return navigationPosition
  },

  copyToClipboard:function(text){
    wx.setClipboardData({
      data: text,
      success: function(res){
        wx.showToast({
          title: '已复制',
          icon: 'none'
        })
      }
    })
  },
  onPay: function (params) {
    //todo
    //return;
    console.log(params);
    this.request({
      url: 'v2/wechat.pay.unifiedorder',
      data: {order_id: params.order_id},
      success: function(data){
        wx.requestPayment({
          timeStamp: data.unifiedorder.timeStamp,
          nonceStr: data.unifiedorder.nonceStr,
          package: data.unifiedorder.package,
          signType: data.unifiedorder.signType,
          paySign: data.unifiedorder.paySign,
          success: function (e) {
            console.log("success", e);
          },
          fail: function (e) {
            console.log("fail", e);
          },
          complete: function (e) {
            console.log("complete", e);
            console.log(e);
            if (e.errMsg == "requestPayment:fail" || e.errMsg == "requestPayment:fail cancel") {//支付失败转到待支付订单列表
              wx.showModal({
                title: "提示",
                content: "订单尚未支付",
                showCancel: false,
                confirmText: "确认",
                success: function (res) {
                  if(typeof params.success != "undefined"){
                    params.success();
                    return;
                  }
                  if (res.confirm) {
                    wx.redirectTo({
                      url: "/pages/order_list/order_list?order_type=10",
                    });
                  }
                }
              });
              return;
            }

            if (typeof params.success != "undefined") {
              params.success();
              return;
            }
            wx.redirectTo({
              url: "/pages/order_list/order_list?order_type=1",
            });
          },
        });
      }
    });
  },
  saveMember: function(member){
    wx.setStorageSync("member", member);
  },
  getMember:function(){
    return wx.getStorageSync("member");
  },
  saveParentReferCodeByOptions: function (options){
    var refer_code = null;
    if (typeof options.refer_code != "undefined") {
      refer_code = options.refer_code;
    }
    if (typeof options.scene != "undefined") {
      refer_code = options.scene;
    }

    if(refer_code != null){
      wx.setStorageSync("parent_refer_code", refer_code);
    }
  },
  getParentReferCode:function(){
    return wx.getStorageSync("parent_refer_code");
  },
  bindParent:function(callback){
    var refer_code = this.getParentReferCode();
    console.log('bindParent refercode ', typeof refer_code, refer_code);
    if(refer_code){
      this.request({
        url: 'v2/share.bind_parent',
        data: { refer_code: refer_code },
        success: function () {
          //不一定保证绑定成功 未登录时 登录过期时
          /*wx.removeStorage({
            key: 'parent_refer_code',
            success: function(res) {},
          })*/
          if (typeof callback != 'undefined') {
            callback();
            console.log(callback())
          }
        }
      });
    }else{
      if (typeof callback != 'undefined') {
        callback();
      }

      return;
    }
  }
}))