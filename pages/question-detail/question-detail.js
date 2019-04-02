// pages/question-detail/question-detail.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      qid: options.qid
    });
    call.getQuesDetail(this);
  },
  onReady: function () {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
  },
  back: function () {
    wx.navigateBack();
  }
});