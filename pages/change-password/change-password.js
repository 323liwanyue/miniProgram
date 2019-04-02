// pages/change-password/change-password.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    oldpwd: "",
    newpwd: "",
    repeatpwd: "",
    oldShow: false,
    newShow: false,
    repeatShow: false,
    buttonClick: true
  },
  /**
   * 改变类型
   */
  changeType: function(e){
    let index = Number(e.currentTarget.dataset.index);
    switch(index){
      case 1: {
        this.setData({
          oldShow: !this.data.oldShow
        });
      }
      break;
      case 2: {
        {
          this.setData({
            newShow: !this.data.newShow
          });
        }
      }
      break;
      case 3: {
        {
          this.setData({
            repeatShow: !this.data.repeatShow
          });
        }
      }
    }
  },
  /**
   * 获取原密码
   */
  getOldPwd: function(e){
    this.setData({
      oldpwd: e.detail.value
    });
  },
  /**
   * 获取新密码
   */
  getNewPwd: function (e) {
    this.setData({
      newpwd: e.detail.value
    });
  },
  /**
   * 获取重复密码
   */
  getRepeatPwd: function (e) {
    this.setData({
      repeatpwd: e.detail.value
    });
  },
  /**
   * 修改密码
   */
  changePassword: function(){
    call.changePwd(this);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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