import request from '../../utils/request'

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      phone:'',
      password:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    // 获取输入框id
    handleInput(event){
      let type = event.currentTarget.id
      this.setData({
        [type]:event.detail.value
      })
    },

    async login(){
      let {phone,password} = this.data
      // 前端验证
      if(!phone){
        wx.showToast({
          title:'手机号不能为空',
          icon:'none'
        })
        return
      }
      let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
      if(!phoneReg.test(phone)){
        wx.showToast({
          title:'手机号格式错误',
          icon:'none'
        })
        return
      }
      if(!password){
        wx.showToast({
          title:'密码不能为空',
          icon:'none'
        })
        return
      }
      
      // 后端验证
      let result = await request('/login/cellphone',{phone,password,isLogin:true})
      wx.showLoading({title:'登录中'})

      if(result.code === 200){
        
        wx.showToast({
          title:'登录成功',
          icon:'success',
          success:() => {
            wx.hideLoading()  // 关闭加载提示
          }
        })

        // 将用户数据存储和cookies到本地
        wx.setStorageSync('userInfo',JSON.stringify(result.profile))

        // 关闭页面，返回上一级
        setTimeout(() => {
          app.globalData.pageName = '' //修改pageName为空
          
          wx.navigateBack()

        }, 2000);
      }else if(result.code === 400){
        wx.showToast({
          title:'手机号错误',
          icon:'error',
          success:() => {
            wx.hideLoading()  // 关闭加载提示
          }
        })
      }else if(result.code === 502){
        wx.showToast({
          title:'密码错误',
          icon:'error',
          success:() => {
            wx.hideLoading()  // 关闭加载提示
          }
        })
      }else{
        wx.showToast({
          title:'登录失败,请重新登录',
          icon:'error',
          success:() => {
            wx.hideLoading()  // 关闭加载提示
          }
        })
      }
      
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
      if(app.globalData.pageName === 'recommendSong'){
        wx.navigateBack({
          delta:2, //返回主页
          success:() => {
            app.globalData.pageName = ''
          }
        })

      }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})