// pages/alarm-detail/alarm-detail.js
const call = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoShow: false,
    alarmindex: '',
    myselfSrc: "../../images/myself.png",
    historySrc: "../../images/history-record.png",
    link: true
  },
  showUserInfo: function(){
    this.setData({
      userInfoShow: !this.data.userInfoShow
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let alarmindex = options.alarmindex;
    this.setData({
      alarmindex: alarmindex
    });
    let alarminfo = JSON.parse(wx.getStorageSync("alarminfo"));
    let currentalarminfo = alarminfo[alarmindex];
    this.setData(currentalarminfo);
    this.setData({
      uname: JSON.parse(wx.getStorageSync("userinfo")).username,
      ugender: JSON.parse(wx.getStorageSync("userinfo")).gender
    });
    let s_alarmname = this.data.alarmname;
    if(s_alarmname.length > 18){
      s_alarmname = s_alarmname.substr(0,18) + "…";
      this.setData({
        alterAlign: true
      });
    }
    this.setData({
      s_alarmname: s_alarmname
    });
  },
  onReady: function () {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
  },
  onShow: function () {
    this.setData({
      myFlag: "",
      myselfSrc: "../../images/myself.png",
      historySrc: "../../images/history-record.png",
      link: true
    });
  },
  skipToFeedback: function(){
    let that = this;
    let url = "../feedback/feedback?alarmindex=" + this.data.alarmindex;
    call.link(url,that);
  },
  back: function(){
    wx.navigateBack();
  },
  toAccount: function () {
    call.link('../account-manage/account-manage', this);
  },
  toHistory: function () {
    call.link('../history-record/history-record', this);
  },
  toCustomService: function () {
    call.link('../custom-service/custom-service', this);
  },
  switchMyInfo: function (e) {
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
  switchMyStyle: function (e) {
    this.setData({
      myFlag: ""
    });
    wx.setStorageSync('myFlag', "");
  }
})