import request from '../../utils/request'

let startY = 0
let moveY = 0
let moveDistance = 0

Page({

    /**
     * 页面的初始数据
     */
    data: {
      coverTransform:'translateY(0)',
      coverTransition:'',
      userInfo:{},
      recentPlayList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
   
        
    },

    // 获取用户播放记录的功能函数
    async getUserRecentPlayList(uid){
      let recentPlayListData = await request('/user/record',{uid,type:0})
      let index = 0
      let recentPlayList = recentPlayListData.allData.slice(0,10).map(item => {
        item.id = index++
        return item
      })
      this.setData({
        recentPlayList
      })

      wx.hideLoading()  // 关闭加载提示

    },

    // 滑动界面
    handleTouchStart(event){
      startY = event.touches[0].clientY

    },
    handleTouchMove(event){
      this.setData({
        coverTransition:''
      })
      moveY = event.touches[0].clientY
      moveDistance = moveY - startY
      if(moveDistance < 0) return
      if(moveDistance >= 80) moveDistance = 80
      this.setData({
        coverTransform:`translateY(${moveDistance}rpx)`
      })
    },
    handleTouchEnd(){
      this.setData({
        coverTransform:'translateY(0)',
        coverTransition:'transform 1s linear'
      })
    },

    // 跳转至登录界面
    toLogin(){
      // 未登录状态才可以点击
      if(!wx.getStorageSync('userInfo')){
        wx.navigateTo({
          url:'/pages/login/login'
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
      // 判断是否登录
      if(wx.getStorageSync('userInfo') && !this.data.recentPlayList.length){
        wx.showLoading({title:'加载中'})
        // 更新用户的状态
        this.setData({
          userInfo:JSON.parse(wx.getStorageSync('userInfo'))
        })
        // 更新用户的播放记录
        this.getUserRecentPlayList(this.data.userInfo.userId)

      }
  
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