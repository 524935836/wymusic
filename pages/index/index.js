import request from '../../utils/request'
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      bannerList:[],
      recommendList:[],
      topList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad:async function (options) {
      //获取轮播图数据
      let bannerListData = await request('/banner',{type:2})
      this.setData({
        bannerList:bannerListData.banners
      })

      // 获取推荐歌曲
      let recommendListData = await request('/personalized',{limit: 10})
      this.setData({
        recommendList:recommendListData.result
      })

      //获取排行榜数据
      // let topListData = (await request('/toplist/detail')).list.slice(0,4)
      // topListData.forEach(item => {
        //   let topListItem = {name:item.name,coverImgUrl:item.coverImgUrl,tracks:item.tracks.slice(0,3)}
        //   resultArr.push(topListItem)
        //   this.setData({
          //     topList:resultArr
          //   })
          // })
      this.topHop(19723756)  

      this.topHop(3779629)    
      
      this.topHop(2884035)    

      this.topHop(3778678)    
      

    },

    async topHop (id){
      let {topList} = this.data
      let topListData = await request('/playlist/detail',{id})
      let topHotItem = topListData.playlist
      topHotItem.tracks = topHotItem.tracks.slice(0,3)
      topList.push(topHotItem)
      this.setData({
        topList
      })
    },

    // 跳转至推荐歌曲页面
    toRecommendSong(){
      wx.navigateTo({
        url:'/pages/recommendSong/recommendSong',
        success:() => {
          app.globalData.pageName = 'recommendSong'
        }
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