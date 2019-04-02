// pages/account-manage/account-manage.js
const call = require('../../utils/util');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: "",
    gender: "",
    contact: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    getUserInfo(this);
  },
  onReady: function () {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
  },
  /**
   * 退出登录
   */
  exit: function(e){
    wx.clearStorageSync();
    wx.reLaunch({
      url: "../index/index",
    });
  },
  back: function () {
    wx.navigateBack();
  }
});

 /**
   * 获取用户信息
   */
  function getUserInfo(page){
    let userinfo = wx.getStorageSync("userinfo");
    userinfo = JSON.parse(userinfo);
    let gender = userinfo.gender;
    if(gender == 0){
      gender = "男"
    }else{
      gender = "女"
    }
    page.setData({
      username: userinfo.username,
      gender: gender,
      contact: userinfo.phone
    });
  }