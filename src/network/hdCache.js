// 简易缓存封装器，需要设置缓存时间的可以用一用
// 单位 s
// this.$cache.set()
// this.$cache.get()
// this.$cache.remove()
// this.$cache.clear()


function isTimeout (name) {
    const data = uni.getStorageSync(name)
    if (!data) return true
    if (data.timeout === 0) return false
    const currentTime = Date.now()
    const overTime = (currentTime - data.createTime) / 1000
    if (overTime > data.timeout) {
        try {
            uni.removeStorageSync(name)
        } catch (e) { }
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
    get (name) {
        let res = isTimeout(name) ? null : uni.getStorageSync(name).data
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
