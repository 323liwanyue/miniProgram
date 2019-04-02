// pages/feedback/feedback.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfoShow: false,
    feedback: "",
    contact: "",
    submitClick: true
  },
  /**
   * 获取反馈内容
   */
  getFeedbackCnt: function(e){
    this.setData({
      feedback: e.detail.value
    });
  },
  getFeedbackCnt2: function (e) {
    this.setData({
      feedback2: e.detail.value
    });
  },
  /**
   * 获取联系方式
   */
  getContact: function(e){
    this.setData({
      contact: e.detail.value
    });
  },
  getContact2: function (e) {
    this.setData({
      contact2: e.detail.value
    });
  },
  /**
   * 提交反馈
   */
  commitFeedback: function(){
    if(this.data.submitClick){
      this.setData({
        submitClick: false
      });
      call.feedback(this);
    }
  },
  /**
   * 显示用户信息框
   */
  showUserInfo: function () {
    this.setData({
      userInfoShow: !this.data.userInfoShow
    });
  },
  back: function () {
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
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let alarmindex = options.alarmindex;
    this.setData({
      alarmindex: alarmindex,
      uname: JSON.parse(wx.getStorageSync("userinfo")).username,
      ugender: JSON.parse(wx.getStorageSync("userinfo")).gender
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
  }
});

