import PubSub from 'pubsub-js'

import request from '../../utils/request'
import decideLoginState from '../../utils/decideLoginState'
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      day:'',
      month:'',
      recommendList:[],
      index:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

      // 判断是否登录（本地存储中是否有userInfo）
      decideLoginState()
      
      // 更新日期
      this.setData({
        day:new Date().getDate(),
        month:new Date().getMonth() + 1
      })

      // 订阅songDetail页面发布的tyoe
      PubSub.subscribe('switchType',(msg,type) => {
        // console.log(type)
        let {recommendList,index} = this.data
        if(type === 'pre'){
          index === 0 && (index = recommendList.length)
          index--
        }else{
          index === recommendList.length - 1 && (index = index = -1)
          index++
        }

        // 将musicId发布给songDetail页面
        let musicId = recommendList[index].id
        PubSub.publish('musicId',musicId)

        // 更新下标
        this.setData({
          index
        })

      })

    },

    // 获取用户的每日推荐数据
    async getRecommendList(){
      let recommendListData = await request('/recommend/songs')
      this.setData({
        recommendList:recommendListData.recommend
      })
      wx.hideLoading()

    },

    // 跳转至歌曲详情页
    toSongDetail(event){
      // song 为每个歌曲的recommendList
      let {song,index} = event.currentTarget.dataset
      this.setData({
        index  //更新data中的index为音乐的下标
      })
      // console.log(index)
      // 跳转并发送歌曲id
      wx.navigateTo({
        url:'/pages/songdetail/songdetail?musicId=' + song.id
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
      // 判断是否登录
      if(wx.getStorageSync('userInfo') && !this.data.recommendList.length){
        wx.showLoading({title:'加载中'})
        this.getRecommendList() //重新获取推荐歌曲
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
      PubSub.unsubscribe('switchType')
      
      app.globalData.pageName = ''
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