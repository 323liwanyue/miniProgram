// pages/custom-service/custom-service.js
const call = require('../../utils/util');
const postinterface = require('../../utils/postinterface');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    softwareSrc: "../../images/rec-active.png",
    vehicleSrc: "../../images/vehicle.png",
    tag: 1,
    softData: [],
    vehicleData: [],
    link: true
  },
  /**
   * 电话咨询
   */
  tel: function(){
    wx.makePhoneCall({
      phoneNumber: '18380460787',
    });
  },
  /**
   * 切换问题类别
   */
  changeQesType: function(e){
    let tag = e.currentTarget.dataset.tag;
    if(tag == 1){
      this.setData({
        tag: 1,
        softwareSrc: "../../images/rec-active.png",
        vehicleSrc: "../../images/vehicle.png"
      });
      call.getQuesList(this,1);
    }else if(tag == 2){
      this.setData({
        tag: 2,
        softwareSrc: "../../images/rect.png",
        vehicleSrc: "../../images/vehicle-active.png"
      });
      call.getQuesList(this,2);
    }
  },
  /**
   * 搜索问题
   */
  searchQues: function(){
    let that = this;
    call.link("../searchAllQes/searchAllQes",that);
    // wx.navigateTo({
    //   url: "../searchAllQes/searchAllQes"
    // });
  },
  /**
   * 获取输入的搜索信息
   */
  getInptInfo: function(e){
    let title = e.detail.value;
    wx.setStorageSync("searchquestitle",title);
  },
  /**
   * 跳转到详情页面
   */
  toQuesDetail: function(e){
    let qid = e.currentTarget.dataset.id;
    let that = this;
    let url = "../question-detail/question-detail?qid=" + qid
    call.link(url,that);
    // wx.navigateTo({
    //   url: "../question-detail/question-detail?qid=" + qid
    // });
  },
  back: function () {
    wx.navigateBack();
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    call.getQuesList(this,1);
  },
  onReady: function () {
    const vm = this
    vm.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      titleBarHeight: getApp().globalData.titleBarHeight
    })
  },
  onShow: function(){
    this.setData({
      link: true
    });
  }
});
