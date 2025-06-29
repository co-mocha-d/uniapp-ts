import { useUserStore } from '@/store/index';

/**
 * 判断微信浏览器
 */
export const isWechatBrowser = () => {
  //#ifdef H5
  let status = navigator.userAgent.toLowerCase();
  if (status.match(/MicroMessenger/i) == 'micromessenger') {
    //微信浏览器
    return true;
  } else {
    return false;
  }
  //#endif
};

/**
 * 是否是ios
 */
export const isIOS = () => {
  let isios = false;
  //#ifdef APP-PLUS
  isios = uni.getSystemInfoSync().platform == 'ios';
  //#endif
  return isios;
};

/**
 * 是否是安卓
 */
export const isAndroid = () => {
  let isAndroid = false;
  //#ifdef APP-PLUS
  isAndroid = uni.getSystemInfoSync().platform == 'android';
  //#endif
  return isAndroid;
};

//判断是否微信内
export const isWeiXin = () => {
  let ua = null;
  // #ifdef H5
  ua = window.navigator.userAgent.toLowerCase();
  // #endif
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true; // 微信中打开
  } else {
    return false; // 普通浏览器中打开
  }
};

/**
 * 设备类型
 * @returns {number}
 */
export const getDeviceType = () => {
  let userStore = useUserStore();

  // 同步方式获取设备信息
  let deviceType = {};

  try {
    deviceType = uni.getSystemInfoSync();
    console.log('当前设备', deviceType);
  } catch (e) {
    console.error('获取系统信息失败', e);
  }

  // 设置设备信息
  userStore?.setDevice(deviceType);

  return deviceType;
};
