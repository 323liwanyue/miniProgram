//index.js
//获取应用实例
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
const app = getApp();
const md5 = require('../../utils/md5');
let swiperCurrent = 0;
let timer = null;
const APP_ID = "wxcafd082ac73fdfe5";
const APP_SECRET = "3121879e95938c9bc09408733000c9a3";
var OPEN_ID = "";//储存获取到的openid
var SESSION_KEY = "";//储存获取到的session_key
var ENCRYPTEDDATA = "";//存储用户数据信息

Page({
  data: {
    titleDes: "用户登录",
    btnDes: "登录",
    userName: "",
    userPassword: "",
    verifyCode: "",
    verifySrc: "",//登錄
    vehicleName: "",
    vehiclePlate: "",
    vehicleInfo: "",
    current:0,
    swiperIndex: 0, //这里不写第一次启动展示的时候会有问题
    alarmListShow: false,
    userInfoShow: false,
    uname: "",
    vname: "",
    alarmList: [],
    soc: "--",
    loginClick: true,
    link: true//第一次跳转
  },
  onLoad: function () {
    this.wxLogin();
    if (app.globalData.wxuserInfo) {
      this.setData({
        wxuserInfo: app.globalData.wxuserInfo,
        hasUserInfo: true
      });
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          wxuserInfo: res.userInfo,
          hasUserInfo: true
        });
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.wxuserInfo = res.userInfo
          this.setData({
            wxuserInfo: res.userInfo,
            hasUserInfo: true
          });
        }
      })
    }
  },
  onReady: function () {
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      titleBarHeight: app.globalData.titleBarHeight
    });
  },
  onShow: function () {
    this.wxLogin();
    this.setData({
      myFlag: "",
      myselfSrc: "../../images/myself.png",
      historySrc: "../../images/history-record.png",
      link: true
    });
    let that = this;
    clearInterval(timer);
    if(this.data.logined){
      timer = setInterval(function () {
        call.getVehicleRealtimeInfo(that);
        call.getVehicleAlarmInfo(that);
      }, 10000);
    }
  },
  clearPassword: function () {
    this.setData({
      userPassword: ""
    });
  },
  getUserInfo: function (e) {
    app.globalData.wxuserInfo = e.detail.userInfo;
    this.setData({
      wxuserInfo: e.detail.userInfo ? e.detail.userInfo : "",
      hasUserInfo: true
    });
    //通过openid登录
    if (this.wxuserInfo || e.detail.userInfo){
      let datas = {
        openid: OPEN_ID,
        type: 2
      };
      
      let that = this;
      call.getLoginRequest(this, { datas: datas, }, 1, function () {
        wx.setStorageSync("openid", OPEN_ID);
        clearInterval(timer);
        timer = setInterval(function () {
          call.getVehicleRealtimeInfo(that);
          call.getVehicleAlarmInfo(that);
        }, 10000);
      });
    }
  },
  wxLogin: function(){
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          let lastopenid = wx.getStorageSync("openid");
          wx.request({
            //获取openid接口
            url: 'https://api.weixin.qq.com/sns/jscode2session',
            data: {
              appid: APP_ID,
              secret: APP_SECRET,
              js_code: res.code,
              grant_type: "authorization_code"
            },
            method: "GET",
            success: function (res) {
              OPEN_ID = res.data.openid;//获取到的openid
              SESSION_KEY = res.data.session_key;//获取到session_key
            },
            fail: function (res) {
              // wx.showModal({
              //   title: res.errMsg,
              // })
             },
            complete: function () {
              that.setData({
                openid: OPEN_ID,
                session_key: SESSION_KEY
              });
              if (lastopenid != OPEN_ID){
                wx.removeStorageSync("logined");
                wx.removeStorageSync("useriinfo");
              }

              let logined = wx.getStorageSync("logined");
              if (logined == undefined) {
                logined = 0;
              }
              that.setData({
                logined: logined
              });
              if (logined) {
                call.getVehicleList(that);
                that.setData({
                  uname: JSON.parse(wx.getStorageSync("userinfo")).username,
                  ugender: JSON.parse(wx.getStorageSync("userinfo")).gender
                });
              } else {
                call.refreshVerifyCode(that);
              }
              console.log(OPEN_ID);
            }
          });
        } else {
          console.log("登录失败！" + res.errMsg);
        }
      }
    });
  },
  /**
   * 获取登录用户名
   */
  getUserName: function (e) {
    this.setData({
      userName: e.detail.value
    });
  },
  getUser: function (e) {
    this.setData({
      userName2: e.detail.value
    });
  },
  /**
   * 获取密码
   */
  getPassword: function (e) {
    this.setData({
      userPassword: e.detail.value
    });
  },
  /**
   * 获取验证码
   */
  getVerifyCode: function (e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },
  /**
   * 登录
   */
  login: function () {
    let that = this;
    let userName = this.data.userName ? this.data.userName : this.data.userName2;
    let userPassword = this.data.userPassword;
    let verifyCode = this.data.verifyCode;

    if(!userName){
      wx.showToast({
        title: "用户名不能为空",
        icon: "none",
        mask: true,
        duration: call.tiptime
      });
      return false;
    }else if(!userPassword){
      wx.showToast({
        title: "密码不能为空",
        icon: "none",
        mask: true,
        duration: call.tiptime
      });
      return false;
    }
    let datas = {
      c_username: userName,
      c_password: md5.hex_md5(userPassword),
      code: verifyCode
    };

    if(this.data.bind){
      datas.openid = OPEN_ID;
      datas.type = 2;
    }else{
      datas.type = 1;
    }

    if(this.data.loginClick){
      this.setData({
        loginClick: false
      });
      call.getLoginRequest(this, { datas: datas, }, 1,function(){
        wx.setStorageSync("openid", OPEN_ID);
        clearInterval(timer);
        timer = setInterval(function () {
          call.getVehicleRealtimeInfo(that);
          call.getVehicleAlarmInfo(that);
        }, 10000);
      });
    }
  },
  bindchange: function (e) {
    let index = e.detail.current;
    swiperCurrent = index;
    this.setData({
      swiperIndex: index,
      // current: index,
      vehicleName: this.data.vehicleInfo[index].vname,
      vehiclePlate: this.data.vehicleInfo[index].vplatenum
    });
    let vid = this.data.vehicleInfo[index].vid;
    wx.setStorageSync("vid", vid);
    call.getVehicleRealtimeInfo(this,vid);
    call.getVehicleAlarmInfo(this,vid);
  },
  prevchange: function (e) {
    let index = swiperCurrent;
    index = index > 0 ? index - 1 : this.data.vehicleInfo.length - 1;
    this.setData({
      swiperIndex: index,
      current: index
    });
  },
  nextchange: function (e) {
    let index = swiperCurrent;
    index = index < (this.data.vehicleInfo.length - 1) ? index + 1 : 0;
    this.setData({
      swiperIndex: index,
      current: index
    });
  },
  switchAlarmList: function (e) {
    let flag = e.currentTarget.dataset.flag;
    if(flag == 1){
      this.setData({
        alarmListShow: true
      });
    }else{
      this.setData({
        alarmListShow: false
      });
    }
  },
  toAlarmDetail: function (e) {
    let alarmindex = e.currentTarget.dataset.index;
    let that = this;
    if (that.data.link){
      that.setData({
        link: false,
      },function(){
        wx.navigateTo({
          url: "../alarm-detail/alarm-detail?alarmindex=" + alarmindex,
          success: function () {
            clearInterval(timer);
          }
        });
      });
    }
  },
  toCustomService: function(){
    clearInterval(timer);
    call.link('../custom-service/custom-service', this);
  },
  showUserInfo: function () {
    this.setData({
      userInfoShow: !this.data.userInfoShow
    });
  },
  toAccount: function(){
    call.link('../account-manage/account-manage', this);
  },
  toHistory: function(){
    call.link('../history-record/history-record', this);
  },
  switchMyInfo: function (e) {
    clearInterval(timer);
    let flag = e.currentTarget.dataset.flag;
    if (flag == 1) {
      this.setData({
        myFlag: 1
      });
    } else if (flag == 2) {
      this.setData({
        myFlag: 2
      });
    }
    wx.setStorageSync('myFlag', flag);
  },
  switchMyStyle: function(e){
    this.setData({
      myFlag: ""
    });
    wx.setStorageSync('myFlag', "");
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(timer);
  },
  onHide: function(){
    clearInterval(timer);
  }
});
