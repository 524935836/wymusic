App({

  globalData:{
    isMusicPlay:false,
    musicId:'',
    currentTime:'00:00',
    currentWidth:0,
    pageName:''
  },

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    
  },

  // 设置监听器
  watch: function (ctx, obj) {
    Object.keys(obj).forEach(key => {
      this.observer(ctx.data, key, ctx.data[key], function (value) {
        obj[key].call(ctx, value)
      })
    })
  },
  // 监听属性，并执行监听函数
  observer: function (data, key, val, fn) {
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: function () {
        return val
      },
      set: function (newVal) {
        if (newVal === val) return
        // 执行监听属性的回调
        fn && fn(newVal)
        val = newVal
      },
    })
  },


  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})
