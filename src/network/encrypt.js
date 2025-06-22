import CryptoJS from "crypto-js";
export const KEY = CryptoJS.enc.Utf8.parse('WD2024101encrypt').toString();
export const IVS = 'oHK2kLqTe7V7qNbi'

const base64ToUtf8 = (base64) => {
    const buffer = Buffer.from(base64, 'base64');
    return buffer.toString('utf8');
};

/**
 * KEY、IV解密
 * @param {Object} data 数据
 * @param {Object} ivs iv
 */
export function DecryptAESKey (data, ivThis = '8396046340549887', keyThis = '4PRLkYaV4f8BUaZT9CRgSacVbhOtTIYM', isAtob = 0) {
    if (!data || data.length <= 0) return data;
    if (isAtob == 1) {
        data = base64ToUtf8(data)
    } else {
        data = decodeURIComponent(data)
    }
    var key = CryptoJS.enc.Utf8.parse(keyThis);
    var iv = CryptoJS.enc.Utf8.parse(ivThis);
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let decryptedArray = decrypted.toString(CryptoJS.enc.Utf8).toString().split(' ').join('')

    let retrunData = null
    try {
        retrunData = JSON.parse(decryptedArray)
    } catch (e) {
        let retrunDataArray = decryptedArray.split('"').filter(n => n != '')
        if (retrunDataArray.length > 0) {
            retrunData = retrunDataArray[0].split("'")[0]
        }
    }
    return retrunData;
}

/**
 * data解密
 * @param {Object} data 数据
 * @param {String} ivs iv
 */
export function DecryptAES (data, ivThis = IVS, keyThis = KEY) {
    if (!data || data.length <= 0) return data;
    data = decodeURIComponent(data)
    var key = CryptoJS.enc.Utf8.parse(keyThis);
    var iv = CryptoJS.enc.Utf8.parse(ivThis);
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });

    let decryptedObject = decrypted.toString(CryptoJS.enc.Utf8).toString()
    let retrunData = null
    try {
        // 返回数据 存在n个 \x0F  补位，需要拆分
        let decryptedArray = decryptedObject.split('\x0F')
        retrunData = JSON.parse(decryptedArray[0].split('\x0E')[0]);

    } catch (e) {
        let decryptedArray = decryptedObject.split('}')
        decryptedArray.splice(decryptedArray.length - 1, 1)
        retrunData = JSON.parse(decryptedArray.join('}') + '}');
    }
    return retrunData;
}

/**
 * data 加密
 * @param {Object} data 数据
 * @param {String} ivs
 */
export function EncryptAES (datas) {
    let data = JSON.stringify(datas);
    if (!data || data.length <= 0) return data;
    var key = CryptoJS.enc.Utf8.parse(KEY);
    var iv = CryptoJS.enc.Utf8.parse(IVS);

    var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    let jsonStr = encrypted.toString();
    return jsonStr;
}
