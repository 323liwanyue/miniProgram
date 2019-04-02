const md5 = require('md5');
const postinterface = require('postinterface');
const tiptime = 1000;

const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//const host = "http://192.168.0.142:8080/Iv4dmMaster/web/";
//const host = "http://192.168.0.105:8080/Iv4dmMaster/web/";
//const host = "http://192.168.0.142:8889/Iv4dmMaster/web/";
//const host = "http://192.168.0.142:8886/Iv4dmMaster/web/";
//const host = "http://192.168.0.135:8080/Iv4dmMaster/web/";
//const host = "http://192.168.0.201:8088/Iv4dmMaster/web/";
//const host = "http://192.168.0.201:8080/Iv4dmMaster/web/";
const host = "https://comingbus.com/Iv4dm/web/";

/**
 * post请求
 * url:接口
 * data: 参数，json类型
 * sucess: 成功的回调
 * fail:失败的回调
 */
const request = function(url, data, success, fail, page) {
  let device = "ivdc4dwechat";
  let token = wx.getStorageSync("token") ? wx.getStorageSync("token") : "";
  let timestamp = Date.parse(new Date());
  let signatureparam = device + timestamp + token;
  let userid = "";
  if (wx.getStorageSync("userinfo")) {
    userid = JSON.parse(wx.getStorageSync("userinfo")).userid;
  }
  data.i_userid = userid;
  data.device = device;
  data.timestamp = timestamp;
  data.sessionid = wx.getStorageSync("sessionid") ? wx.getStorageSync("sessionid") : "";
  data.signature = md5.hex_md5(signatureparam);
  wx.request({
    url: host + url,
    header: {
      'content-type': "application/x-www-form-urlencoded"
    },
    data: data,
    method: "post",
    success: function(res) {
      if (success) {
        success(res.data);
      }
    },
    fail: function(res) {
      fail();
    }
  });
};

/**
 * get请求
 * 不需传参，直接调用url
 */
const getData = function(url, success, fail) {
  wx.request({
    url: host + url,
    header: {
      'content-type': "application/x-www-form-urlencoded"
    },
    method: "get",
    success: function(res) {
      let code = res.code;
      let info = res.info;
      success(res.data);
    },
    fail: function() {
      fail();
    }
  });
}
/**
 * 获取缓存用户信息
 */
const getUserName = function() {
  let userinfo = wx.getStorageSync("userinfo");
  return JSON.parse(userinfo);
}

/**
 * 更新验证码
 */
const refreshVerifyCode = function(page) {
  getData(postinterface.getValidCode, function(res) {
    let data = res.data;
    let info = res.info;
    let sessionid = data.sessionid;
    wx.setStorageSync("sessionid", sessionid);

    let userinfo = wx.getStorageSync("userinfo") ? JSON.parse(wx.getStorageSync("userinfo")) : "";
    let openid = wx.getStorageSync("openid") ? wx.getStorageSync("openid") : "";
    let logined = wx.getStorageSync("logined") ? wx.getStorageSync("logined") : "";
    if (userinfo && logined) {
      let datas;
      if(userinfo.type == 1){
        datas = {
          c_username: userinfo.username,
          c_password: md5.hex_md5(userinfo.password),
          code: ""
        };
      }else if(userinfo.type == 2){
        datas = {
          openid: openid,
          type: 2
        };
      }
      getLoginRequest(page, {
        datas: datas,
        sessionid: sessionid
      });
    }
  }, function(e) {
    wx.showModal({
      title: info,
      content: e
    })
  });
}

/**
 * 登录接口调用
 */
const getLoginRequest = function(page, yobj, flag, func) {
  let param = {
    data: JSON.stringify(yobj.datas),
  };
  let success = function(res) {
    let code = res.code;
    let info = res.info;
    if (code == 0) {
      let data = res.data;
      if (flag) {
        let userinfo = {
          type: data.type,
          userid: data.userid,
          username: data.username,
          password: page.data.userPassword,
          gender: data.gender,
          phone: data.contact
        };
        wx.setStorageSync("userinfo", JSON.stringify(userinfo));

        page.setData({
          uname: JSON.parse(wx.getStorageSync("userinfo")).username,
          ugender: JSON.parse(wx.getStorageSync("userinfo")).gender,
          logined: 1
        });
      }
      wx.setStorageSync("securitykey", data.securitykey);
      wx.setStorageSync("token", data.token);
      let time = new Date();
      wx.setStorageSync("logined", 1);

      getVehicleList(page);
      if (func) {
        func();
      }
    } else if (code == 6) {
      wx.showToast({
        title: info,
        icon: "none",
        mask: true,
        duration: tiptime
      });
      page.setData({
        titleDes: "用户绑定",
        btnDes: "绑定",
        bind: true,
        loginClick: true
      });
    } else if (code == 12) {
      page.setData({
        loginClick: true
      });
      refreshVerifyCode(page);
    } else {
      wx.showToast({
        title: info,
        icon: "none",
        mask: true,
        duration: tiptime
      });
      wx.clearStorageSync();
      let url = page.route;
      if (url != "pages/index/index" && page.data.logined != 1) {
        wx.navigateTo({
          url: '../index/index'
        });
      }
      page.setData({
        logined: 0,
        userPassword: "",
        userName: "",
        loginClick: true
      });
    }
  };
  request(postinterface.login, param, success, null, page);
}

/**
 * 獲取車輛列表
 */
const getVehicleList = function(page) {
  let param = {};
  let success = function(res) {
    let code = res.code;
    let data = res.data;
    if (code == 0) {
      page.setData({
        vehicleInfo: data,
        vehicleName: data[0].vname,
        vehiclePlate: data[0].vplatenum
      });
      let vid = data[0].vid;
      wx.setStorageSync("vid", vid);
      getVehicleRealtimeInfo(page, vid);
      getVehicleAlarmInfo(page, vid);
    } else if (code == 12) {
      refreshVerifyCode(page);
    }
  };
  request(postinterface.vehiclelist, param, success, null, page);
}

const vehicleInfo = {};
/**
 * 獲取車輛实时信息
 */
const getVehicleRealtimeInfo = function(page, vId) {
  let vid;
  if (vId) {
    vid = vId;
  } else {
    vid = wx.getStorageSync("vid");
  }
  let datas = {
    i_vehicleid: vid,
    page: 1,
    rows: 500
  };
  let param = {
    data: JSON.stringify(datas)
  };
  let success = function(res) {
    let code = res.code;
    let data = res.data;
    if (code == 0) {
      let uptime = data.i_datatime;
      let list = data.list;
      let length = list.length;
      let arrParam = [];
      let otherArrParam = [];
      let soc = "--";
      let tag = "车辆离线标识";
      let flag = "BMS充放电状态";
      let noData = "--";
      let keyName = "c_parametername";
      let keyVal = "c_datavalue";
      let pjson = {
        "总电流": noData,
        "总电压": noData,
        "最低电压": noData,
        "最高电压": noData,
        "最低温度": noData,
        "最高温度": noData,
        "电池故障总数": noData,
        "故障等级": noData,
        "绝缘电阻": noData,
        "OBC使能信号": noData
      };
      let qjson = {
        "充电继电器状态": noData,
        "最低温度电池编号": noData,
        "最低电压电池编号": noData,
        "最高电压电池编号": noData,
        "最高温度电池编号": noData
      };

      if (uptime) {
        uptime = switchYearMonthDay(uptime);
        page.setData({
          updatetime: uptime.y + "-" + uptime.m + "-" + uptime.d + " " + uptime.h + "时" + uptime.min + "分"
        });
      } else {
        page.setData({
          updatetime: "--"
        });
      }

      let vinfo = wx.getStorageSync("vehicleInfo");

      let offlinesign = data.offlinesign;
      let defaultnavtitle = "离线";
      let statustitle = "无充电状态";
      let electricState = "statusunknow";
      let navtitle = (offlinesign == 1 || offlinesign == 2) ? defaultnavtitle : statustitle;

      vinfo = vinfo ? JSON.parse(vinfo) : "";
      if (vinfo[vid]) {
        // statustitle = vinfo[vid]["navtitle"];
        soc = vinfo[vid]["soc"];
      }

      for (let i = 0; i < length; i++) {
        let key = list[i][keyName];
        if (pjson[key]) {
          pjson[key] = list[i][keyVal];
        }
        if (qjson[key]) {
          qjson[key] = list[i][keyVal];
        }

        if (key == "充电剩余时间参数") {
          let time = switchHourAndMinutes(Number(list[i].c_datavalue));
          page.setData(time);
        }
        if (key == "SOC") {
          soc = Number(list[i].c_datavalue);
        }
        if (key == flag) {
          let status = list[i].c_datavalue;
          if (status == 1 || status == 4) {
            if (offlinesign != 1 && offlinesign != 2) {
              navtitle = "充电";
            }
            electricState = "statuscd";
          } else if (status == 2 || status == 3 || status == "0") {
            if (offlinesign != 1 && offlinesign != 2) {
              navtitle = "未充电";
            }
            electricState = "statuswcd";
          } else {
            electricState = (page.data.electricState != null) ? page.data.electricState : "statusunknow";
          }
        }
      }
      page.setData({
        navtitle: navtitle,
        electricState: electricState
      });

      let vehicleInfo = {};
      vehicleInfo[vid] = {};
      // vehicleInfo[vid]["navtitle"] = navtitle;
      vehicleInfo[vid]["soc"] = soc;
      wx.setStorageSync("vehicleInfo", JSON.stringify(vehicleInfo));

      for (let k in pjson) {
        let obj = {};
        obj.param = k;
        obj.value = pjson[k];
        arrParam.push(obj);
      }
      for (let keys in qjson) {
        let obj = {};
        obj.param = keys;
        obj.value = qjson[keys];
        otherArrParam.push(obj);
      }
      page.setData({
        arrParam: arrParam,
        otherArrParam: otherArrParam,
        soc: soc
      });

    } else if (code == 12) {
      refreshVerifyCode(page);
    }
  };
  request(postinterface.vehiclerealinfo, param, success, null, page);
}

/**
 * 獲取車輛报警信息
 */
const getVehicleAlarmInfo = function(page, vId) {
  let vid;
  if (vId) {
    vid = vId;
  } else {
    vid = wx.getStorageSync("vid");
  }
  let datas = {
    vehicleids: vid,
    alarmtype: 0,
    alarmgroupids: "",
    page: 1,
    rows: 500
  };
  let param = {
    data: JSON.stringify(datas)
  };
  let success = function(res) {
    let code = res.code;
    let data = res.data;
    if (code == 0) {
      let list = data.list;
      let alarmList = [];
      let length = list.length;
      for (let i = 0; i < length; i++) {
        let obj = {};
        obj.vid = list[i].i_vehicleid;
        obj.alarmid = list[i].i_datasimplecode;
        obj.alarmname = list[i].c_parametername;
        obj.alarmdes = list[i].c_description;
        obj.alarmassist = list[i].c_assist;
        obj.alarmstarttiem = list[i].i_alarmstarttime;
        alarmList.push(obj);
      }
      wx.setStorageSync("alarminfo", JSON.stringify(alarmList));
      page.setData({
        alarmList: alarmList
      });
    }
  };
  request(postinterface.vehiclealarminfo, param, success, null, page);
}

/**
 * 反馈
 */
const feedback = function(page) {
  let fcnt = page.data.feedback;
  if (!fcnt) {
    fcnt = page.data.feedback2;
  }
  let fcontact = page.data.contact;
  if (!fcontact) {
    fcontact = page.data.contact2;
  }
  if (fcnt && fcontact) {
    let vid = wx.getStorageSync("vid");
    let alarmsingle = JSON.parse(wx.getStorageSync("alarminfo"))[page.data.alarmindex];
    let fdata = {};
    fdata.c_feedbackcnt = fcnt;
    fdata.i_vehicleid = vid;
    fdata.i_alarmstarttime = alarmsingle.alarmstarttiem;
    fdata.c_alarmname = alarmsingle.alarmname;
    fdata.c_contactinfo = fcontact;
    let param = {
      data: JSON.stringify(fdata)
    };
    let success = function(res) {
      let info = res.info;
      let code = res.code;
      let data = res.data;
      if (code == 0) {
        wx.showToast({
          title: info,
          icon: "none",
          duration: tiptime,
          mask: true,
          success: function() {
            setTimeout(function() {
              wx.navigateBack();
            }, tiptime);
          }
        });
      } else if (code == 12) {
        refreshVerifyCode(page);
        setTimeout(function() {
          if (wx.getStorageSync("logined")) {
            feedback(page);
          }
        }, tiptime);
      } else {
        page.setData({
          submitClick: true
        });
        wx.showToast({
          title: info,
          icon: "none",
          mask: true,
          duration: tiptime
        });
      }
    };
    request(postinterface.feedback, param, success, null, page);
  } else {
    wx.showToast({
      title: "输入内容不能为空",
      icon: "none",
      mask: true,
      duration: tiptime
    });
    page.setData({
      submitClick: true
    });
  }
}

/**
 * 获取历史数据
 */
const getHistoryRecord = function(page) {
  let vid = wx.getStorageSync("vid");
  let datas = {
    i_vehicleid: vid
  };
  let param = {
    data: JSON.stringify(datas),
  };
  let success = function(res) {
    let code = res.code;
    let info = res.info;
    if (code == 0) {
      let his = res.data;
      let h = {};
      for (let i = 0; i < his.length; i++) {
        h[his[i]["yearandmonth"]] = h[his[i]["yearandmonth"]] ? h[his[i]["yearandmonth"]] : [];
        let hobj = {};
        hobj.status = his[i]["status"];
        if (hobj.status == 1) {
          hobj.chargetime = switchHourAndMinutes(Number(his[i]["chargetime"] * 60));
          if (his[i]["startchargevolume"] == -1) {
            hobj.startchargevolume = "";
          } else if (his[i]["startchargevolume"] != -1 && his[i]["endchargevolume"] == -1) {
            hobj.startchargevolume = his[i]["startchargevolume"] + "%";
          } else {
            hobj.startchargevolume = his[i]["startchargevolume"] + "% > ";
          }
          if (his[i]["endchargevolume"] == -1) {
            hobj.endchargevolume = "";
          } else {
            hobj.endchargevolume = his[i]["endchargevolume"] + "%";
          }
          hobj.totalvolume = his[i]["totalvolume"];
          hobj.isEnd = his[i]["isEnd"];
        }
        hobj.chargeclock = his[i]["chargeclock"];
        h[his[i]["yearandmonth"]].push(hobj);
      }
      let historys = [];
      for (let key in h) {
        let obj = {};
        obj.date = key;
        obj.data = h[key];
        historys.push(obj);
      }
      page.setData({
        datetimes: historys,
        loading: false
      });
    } else if (code == 12) {
      refreshVerifyCode(page);
      setTimeout(function() {
        if (wx.getStorageSync("logined")) {
          getHistoryRecord(page);
        }
      }, tiptime);
    } else {
      page.setData({
        loading: false
      });
      wx.showToast({
        title: info,
        icon: "none",
        mask: true,
        duration: tiptime
      });
    }
  };
  request(postinterface.gethistory, param, success, null, page);
}

/**
 * 获取问题列表
 */
const getQuesList = function(page, tag, title) {
  let datas = {
    flag: tag,
    qtitle: title
  };
  let param = {
    data: JSON.stringify(datas)
  };
  let success = function(res) {
    let code = res.code;
    let data = res.data;
    let info = res.info;
    if (code == 0) {
      switch (tag) {
        case 0:
          {
            page.setData({
              allData: data
            });
            break;
          }
        case 1:
          {
            page.setData({
              softData: data
            });
            break;
          }
        case 2:
          {
            page.setData({
              vehicleData: data
            });
            break;
          }
      }
    } else if (code == 12) {
      refreshVerifyCode(page);
      setTimeout(function() {
        if (wx.getStorageSync("logined")) {
          getQuesList(page, tag, title);
        }
      }, tiptime);
    } else {
      wx.showToast({
        title: info,
        icon: "none",
        mask: true,
        duration: tiptime
      });
    }
  };
  request(postinterface.question, param, success, null, page);
}

/**
 * 获取问题详情信息
 */
const getQuesDetail = function(page) {
  let datas = {
    qid: page.data.qid
  };
  let param = {
    data: JSON.stringify(datas)
  };
  let success = function(res) {
    let code = res.code;
    let data = res.data;
    let info = res.info;
    if (code == 0) {
      let c_s_title = data.c_title;
      if (c_s_title.length >= 12) {
        c_s_title = c_s_title.substr(0, 12) + "…";
        page.setData({
          alterAlign: true
        });
      }
      page.setData({
        c_s_title: c_s_title
      });
      page.setData(data);
    } else if (code == 12) {
      refreshVerifyCode(page);
      setTimeout(function() {
        if (wx.getStorageSync("logined")) {
          getQuesDetail(page);
        }
      }, tiptime);
    } else {
      wx.showToast({
        title: info,
        mask: true,
        icon: "none",
        duration: tiptime
      });
    }
  };
  request(postinterface.questionDetail, param, success, null, page);
}

/**
 * 修改密码
 */
const changePwd = function(page) {
  let oldpwd = page.data.oldpwd;
  let newpwd = page.data.newpwd;
  let repeatpwd = page.data.repeatpwd;
  if (!oldpwd) {
    wx.showToast({
      title: "原密码不能为空",
      icon: "none",
      mask: true,
      duration: tiptime
    });
  } else if (!newpwd) {
    wx.showToast({
      title: "新密码不能为空",
      icon: "none",
      mask: true,
      duration: tiptime
    });
  } else if (!repeatpwd) {
    wx.showToast({
      title: "重复密码不能为空",
      icon: "none",
      mask: true,
      duration: tiptime
    });
  } else if (newpwd != repeatpwd) {
    wx.showToast({
      title: "新密码和重复密码不一致",
      icon: "none",
      mask: true,
      duration: tiptime
    });
  } else {
    if (page.data.buttonClick) {
      let datas = {
        oldpwd: oldpwd,
        newpwd: newpwd
      };
      let param = {
        data: Encrypt(JSON.stringify(datas)),
        isencryption: 1
      };
      let success = function(res) {
        let code = res.code;
        let info = res.info;
        if (code == 0) {
          page.data.buttonClick = false;
          wx.showToast({
            title: info,
            icon: "none",
            duration: tiptime,
            mask: true,
            success: function() {
              setTimeout(function() {
                wx.navigateBack();
              }, tiptime);
            }
          });
        } else if (code == -1) {
          wx.showToast({
            title: info,
            icon: "none",
            mask: true,
            duration: tiptime
          });
        } else if (code == 12) {
          refreshVerifyCode(page);
          setTimeout(function() {
            if (wx.getStorageSync("logined")) {
              changePwd(page);
            }
          }, tiptime);
        }
      };
      request(postinterface.changepassword, param, success, null, page);
    }
  }
}

/**
 * 将秒转换为时分格式
 */
const switchHourAndMinutes = function(s) {
  let h = parseInt(s / 3600);
  let m = parseInt((s % 3600) / 60);
  return {
    hour: h,
    minute: m
  }
}
/**
 * 时间戳转换为年月日时分
 */
const switchYearMonthDay = function(timestamp) {
  let date;
  if (timestamp.length == 10) {
    date = new Date(timestamp * 1000);
  } else {
    date = new Date(timestamp);
  }
  let Y = date.getFullYear();
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  let D = date.getDate();
  let h = date.getHours();
  let m = date.getMinutes();
  let s = date.getSeconds();
  return {
    y: Y,
    m: M,
    d: D,
    h: h,
    min: m,
    s: s
  }
}

/**
 * 跳轉方法
 */
const link = function(url, that) {
  if (that.data.link == true) {
    that.setData({
      link: false
    }, function() {
      wx.navigateTo({
        url: url,
        complete: function() {
          // that.setData({
          //   link: true
          // });
        }
      })
    });

  } else {
    return;
  }
}

let CryptoJS = require('aes.js');  //引用AES源码js
let key = CryptoJS.enc.Utf8.parse("1234123412ABCDEF"); //十六位十六进制数作为秘钥
let iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); //十六位十六进制数作为秘钥偏移量
//解密方法
function Decrypt(word) {
  let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
  let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  let decrypt = CryptoJS.AES.decrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
//加密方法
function Encrypt(word) {
  let srcs = CryptoJS.enc.Utf8.parse(word);
  let encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

module.exports = {
  formatTime: formatTime,
  request: request,
  getData: getData,
  getUserName: getUserName,
  tiptime,
  switchHourAndMinutes: switchHourAndMinutes,
  Decrypt: Decrypt,
  Encrypt: Encrypt,
  switchYearMonthDay: switchYearMonthDay,
  link: link,
  getVehicleAlarmInfo: getVehicleAlarmInfo,
  getVehicleRealtimeInfo: getVehicleRealtimeInfo,
  getVehicleList: getVehicleList,
  refreshVerifyCode: refreshVerifyCode,
  getLoginRequest: getLoginRequest,
  feedback: feedback,
  getHistoryRecord: getHistoryRecord,
  getQuesList: getQuesList,
  getQuesDetail: getQuesDetail,
  changePwd: changePwd
}