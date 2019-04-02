//获取验证码
const getValidCode = "getValidCode";
 
//登录
const login = "login";

//車輛列表
const vehiclelist = "getDcData/get_vehicles";

//獲取車輛實時信息
const vehiclerealinfo = "getDcData/query_realtimeVehicleBaseInfo";

//獲取車輛報警信息
const vehiclealarminfo = "getDcData/query_realtimeVehicleAlarm";

//提交反饋
const feedback = "submitFeedback";

//修改密碼
const changepassword = "changePassword";

//获取历史充电信息
const gethistory = "getDcData/query_vehicleChargingHisList";

//搜索问题
const question = "getRelatedOrSearchQuestionInfo";

//获取问题详情信息接口定义
const questionDetail = "getQuestionDetailInfo";

//获取电桩及其搜索信息接口定义
const elctrical = "getChargePlaceInfo";

//导出模块
module.exports = {
  getValidCode,
  login,
  vehiclelist,
  vehiclerealinfo,
  vehiclealarminfo,
  feedback,
  changepassword,
  gethistory,
  question,
  questionDetail,
  elctrical
}