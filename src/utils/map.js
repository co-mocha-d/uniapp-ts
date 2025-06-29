// 百度地图转腾讯地图经纬度
export const BaiduToQQ = (point = {}) => {
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = point.lng - 0.0065;
  let y = point.lat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta);
  let lats = z * Math.sin(theta);
  return {
    lng: lngs,
    lat: lats,
  };
};

// 腾讯地图转百度地图经纬度
export const QQToBaidu = (point = {}) => {
  let x_pi = (3.14159265358979324 * 3000.0) / 180.0;
  let x = point.lng;
  let y = point.lat;
  let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta) + 0.0065;
  let lats = z * Math.sin(theta) + 0.006;
  return {
    lng: lngs,
    lat: lats,
  };
};

// 根据定位经纬度获取具体地址信息
export const getAddressByLocation = (pointer = {}) => {
  return new Promise((resolve, reject) => {
    // let url = uni.$urls.common.latlngAreaInfo;
    // let postData = {
    //   lng: pointer?.longitude || '104.072425',
    //   lat: pointer?.latitude || '30.663503',
    // };
    // uni.$doHttp
    //   .post(url, postData, {
    //     load: false,
    //   })
    //   .then((res) => {
    //     let myObj = {
    //       ...res,
    //       longitude: postData?.lng,
    //       latitude: postData?.lat,
    //     };
    //     resolve(myObj);
    //   });
  });
};
