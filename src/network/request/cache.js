// 简易缓存封装器，需要设置缓存时间的可以用一用
// 单位 s
// 链接：https://juejin.cn/post/6844903870448009223
import {
    deepCompare
} from "./utils.js";


function isTimeout (name, params) {
    const data = uni.getStorageSync(name)
    if (!data) return true
    if (data.timeout === 0) return false
    const currentTime = Date.now()

    let targetData = data.data.filter(v => {
        return v.params && deepCompare(v.params, params)
    })

    if (!targetData?.[0]) return false

    const overTime = (currentTime - targetData[0].createTime) / 1000
    // console.log('overTime===', overTime)
    if (overTime > data.timeout) {
        // try {
        //     uni.removeStorageSync(name)
        // } catch (e) { }
        return true
    }
    return false
}

class CacheCell {
    constructor(data, timeout) {
        this.data = data
        this.timeout = timeout
    }
}

class Cache {
    constructor(timeout) {
        this.timeout = timeout
    }

    set (name, data, timeout) {
        const cachecell = new CacheCell(data, timeout)
        let cache = null
        try {
            uni.setStorageSync(name, cachecell)
        } catch (e) { }
        return cache
    }
    get (name, params) {
        let res = isTimeout(name, params) ? {
            data: uni.getStorageSync(name).data,
            isTimeout: true
        } : {
            data: uni.getStorageSync(name).data,
            isTimeout: false
        }
        return res
    }
    remove (name) {
        let value = false
        try {
            uni.removeStorageSync(name)
        } catch (e) { }
        return value
    }
    clear () {
        let value = false
        try {
            uni.clearStorageSync()
            value = true
        } catch (e) { }
        return value
    }
}

export default new Cache(0)
