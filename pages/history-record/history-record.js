// pages/history-record/history-record.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({
  data: {
    loading: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let day2 = new Date();
    day2.setTime(day2.getTime());
    let s2 = (day2.getMonth() + 1) + "月" + (day2.getDate() < 10 ? '0' + day2.getDate() : day2.getDate()) + "日";
    this.setData({
      today: s2
    });
    call.getHistoryRecord(this);
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
