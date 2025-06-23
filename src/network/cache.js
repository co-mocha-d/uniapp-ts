// 链接：https://juejin.cn/post/6844903870448009223

let timeoutDefault = 1200
function isTimeout (name) {
    const data = uni.getStorageSync(name)
    if (!data) return true
    if (data.timeout === 0) return false
    const currentTime = Date.now()
    const overTime = (currentTime - data.createTime) / 1000
    if (overTime > data.timeout) {
        try {
            uni.removeStorageSync(name)
        } catch (e) {
        }
        return true
    }
    return false
}

class CacheCell {
    constructor(data, timeout) {
        this.data = data
        this.timeout = timeout
        this.createTime = Date.now()
    }
}

class HdCache {
    constructor(timeout) {
        try {
            const res = uni.getStorageInfoSync()
            res.keys.forEach(name => {
                try {
                    const value = uni.getStorageSync(name)
                } catch (e) {
                }
            })
        } catch (e) {
        }
        timeoutDefault = timeout
    }
    set (name, data, timeout = timeoutDefault) {
        const cachecell = new CacheCell(data, timeout)
        let cache = null
        try {
            uni.setStorageSync(name, cachecell)
        } catch (e) {
        }
        return cache
    }
    get (name) {
        let res = isTimeout(name) ? null : uni.getStorageSync(name).data
        return res
    }
    delete (name) {
        let value = false
        try {
            uni.removeStorageSync(name)
        } catch (e) {
        }
        return value
    }
    has (name) {
        return !isTimeout(name)
    }
    clear () {
        let value = false
        try {
            uni.clearStorageSync()
            value = true
        } catch (e) {
        }
        return value
    }
}

// HdCache.install = function (Vue, {timeout = 1200} = {}) {
//   Vue.prototype.$cache = new HdCache(timeout)
// }

export default new HdCache(0)


