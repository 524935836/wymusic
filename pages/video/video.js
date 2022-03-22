import request from '../../utils/request'
import decideLoginState from '../../utils/decideLoginState'

Page({

    /**
     * 页面的初始数据
     */
    data: {
      videoGroupList:[],
      navId:'',
      videoList:[],
      videoId:'',
      videoUpdateTime:[],
      isTriggered:false, //下拉状态
      videoPage:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    // 获取导航数据
    async getVideoGroupListData(){
      let videoGroupListData = await request('/video/group/list')
      this.setData({
        videoGroupList:videoGroupListData.data.slice(0,14),
        navId:videoGroupListData.data[0].id   //初始化显示
      })
      this.getVideoList(this.data.navId)
    },

    // 获取导航标签下的视频
    async getVideoList(navId){
      let videoListData = await request('/video/group',{id:navId})
      // console.log(videoListData)
      // 关闭加载提示框
      wx.hideLoading()

      let index = 0
      let videoList = videoListData.datas && videoListData.datas.map(item => {
        item.id = index++
        return item
      })
      this.setData({
        videoList,
        isTriggered:false  //关闭下拉刷新
      })
    },

    //点击切换标签的下划线
    changNav(event){
      let navId = event.currentTarget.id //获取的是字符串类型
      this.setData({
        navId:navId>>>0,   //右移零位将非number数据强制转换为number
        videoList:[]
      })

      // 显示加载提示框
      wx.showLoading({
        title:'正在加载'
      })

      // 动态获取导航栏对应视频
      this.getVideoList(this.data.navId)

    },

    // 点击播放的暂停另一个视频(单例模式)和切换图片与视频
    handlePlay(event){
      let vid = event.currentTarget.id
      // 关闭上一个视频
      // this.vid !== vid && this.videoContext && this.videoContext.stop()

      // this.vid = vid
      this.setData({
        videoId:vid
      })
      this.videoContext = wx.createVideoContext(vid)
    },

    // 视频元数据加载完成时触发
    handleloadedmetadata(event) {
      // 判断数组中是否有当前视频的播放记录
      let {videoUpdateTime} = this.data
      let videoItem = videoUpdateTime.find(item => item.vid === event.currentTarget.id)
      if(videoItem){
        // 跳转至播放记录
        this.videoContext.seek(videoItem.currentTime)
      }
      this.videoContext.play()
    },

    // 监听视频播放进度的回调
    handleTimeUpdate(event){
      let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime}
      let {videoUpdateTime} = this.data
      // 返回数组中存在的视频对象（判断数组中是否有当前视频的播放记录）
      let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid)
      if(videoItem){
        // 修改视频对象的播放进度属性
        videoItem.currentTime = videoTimeObj.currentTime
      }else{
        videoUpdateTime.push(videoTimeObj)
      }
      this.setData({
        videoUpdateTime
      })
    },

    // 视频结束时调用
    handleEnded(event){
      let {videoUpdateTime} = this.data
      // 移除数组中视频播放完的记录
      videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === event.currentTarget.id),1)
      this.setData({
        videoUpdateTime
      })
    },

    // 自定义下拉回调
    handleRefresher(){
      this.getVideoList(this.data.navId)
    },

    // 自定义触底上拉回调(数据分页)
    async handleTolower(){
      wx.showLoading({
        title:'正在加载'
      })
      // 获取下一页视频数据
      let videoListData = await request('/video/group',{id:this.data.navId,offset:++this.data.videoPage})
      wx.hideLoading()

      let index = 0
      let videoItem = videoListData.datas && videoListData.datas.map(item => {
        item.id = index++
        return item
      })

      //将下一页视频数据更新到数组
      let {videoList} = this.data
      videoList.push(...videoItem)

      this.setData({
        videoList
      })
    },

    toSearch(){
      wx.navigateTo({
        url:'/otherPackages/pages/search/search'
      })

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
      if(wx.getStorageSync('userInfo') && !this.data.videoList.length){
        wx.showLoading({title:'加载中'})
        
        // 调用获取导航数据函数
        this.getVideoGroupListData()
      }
    },

    /**
    * 监听 TabBar 切换点击
    */
    onTabItemTap: function (item) {
      // console.log(item)
      // 点击tabbar,再次请求登录
      if(!wx.getStorageSync('userInfo')){
        decideLoginState()
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
    onShareAppMessage: function ({from}) {
      let nickname = JSON.parse(wx.getStorageSync('userInfo')).nickname || ''
      if(from === 'button'){
        return {
          title:`来自${nickname}(button)的转发`
        }
      }else{
        return {
          title:`来自${nickname}(menu)的转发`
        }
      }
    }
})