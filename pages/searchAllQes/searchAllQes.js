// pages/custom-service/custom-service.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputvalue: "",
    allData: [],
    link: true
  },
  /**
   * 电话咨询
   */
  tel: function () {
    wx.makePhoneCall({
      phoneNumber: '18380460787',
    });
  },
  /**
   * 搜索问题
   */
  searchQues: function () {
    let title = this.data.inputvalue;
    call.getQuesList(this, 0, title);
  },
  /**
   * 获取输入的搜索信息
   */
  getInptInfo: function (e) {
    wx.removeStorageSync("searchquestitle");
    let title = e.detail.value;
    this.setData({
      inputvalue: title
    });
  },
  back: function(){
    wx.navigateBack();
  },
  /**
   * 跳转到详情页面
   */
  toQuesDetail: function (e) {
    let qid = e.currentTarget.dataset.id;
    let that = this;
    let url = "../question-detail/question-detail?qid=" + qid;
    call.link(url,that);
    // wx.navigateTo({
    //   url: "../question-detail/question-detail?qid=" + qid
    // });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let title = wx.getStorageSync("searchquestitle");
    this.setData({
      inputvalue: title
    });
    call.getQuesList(this, 0,title);
  },
  onReady: function () {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
  },
  onShow: function(){
    link: true
  }
});