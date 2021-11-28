import PubSub from 'pubsub-js'
import moment from 'moment'

import request from '../../utils/request'
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
      isPlay:false,
      state:'', //碟盘运动状态
      song:{},
      musicId:'',
      musicLink:'',
      durationTime:'00:00',
      currentTime:'00:00',
      currentWidth:0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      // 调用app实例的watch方法
      app.watch(this,{
        isPlay:function (newVal) {
          // 关闭上一个定时器
          clearTimeout(this.timer)
          // 监听音乐状态，判断碟盘状态
          if(newVal === true){
            this.timer = setTimeout(() => {
              this.setData({
                state:'running'
              })
            }, 200);
          }else{
            this.setData({
              state:''
            })
          }
        }
      })

      // 获取歌曲详情id
      let musicId = options.musicId*1  //转换成数字

      this.setData({
        musicId
      })

      // 判断是否是暂停的歌曲
      if(app.globalData.musicId === musicId){
        this.setData({
          currentTime:app.globalData.currentTime,  //页面加载更新全局里的时间
          currentWidth:app.globalData.currentWidth
        })
      }

      // 调用获取歌曲详情的回调
      this.getMusicInfo(musicId)

      // console.log(app.globalData.musicId === musicId,app.globalData.musicId,musicId)

      // 判断当前音乐是否播放
      if(app.globalData.isMusicPlay && (app.globalData.musicId === musicId)){
        this.setData({
          isPlay:true
        })
      }

      // 创建音乐的监听实例
      this.backgroundAudioManager = wx.getBackgroundAudioManager()

      // 监听背景音频播放事件
      this.backgroundAudioManager.onPlay(() => {
        this.changePlayState(true)

        app.globalData.musicId = this.data.musicId  //修改全局音乐的id 
      })

      // 监听背景音频暂停事件
      this.backgroundAudioManager.onPause(() => {
        this.changePlayState(false)

      })

      // 监听背景音频停止事件
      this.backgroundAudioManager.onStop(() => {
        this.changePlayState(false)

        this.setData({
          musicLink:'', //清空音乐路径
        })

      })

      // 监听背景音频自然播放结束事件
      this.backgroundAudioManager.onEnded(() => {
        this.changePlayState(false)
        
        this.setData({
          currentTime:'00:00',
          currentWidth:0,
          musicLink:''
        })

        PubSub.publish('switchType','next')   //切换到下一首


      })

      // 监听背景音频播放进度更新事件
      this.backgroundAudioManager.onTimeUpdate(() => {
        // 获取当前时间进度
        let currentTime = moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss')

        // 计算当前进度条长度
        let currentWidth = this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration*450

        let {musicId} = this.data
        // console.log(app.globalData.musicId,musicId)

        // 判断是否是当前歌曲页面
        if(app.globalData.isMusicPlay && (app.globalData.musicId === musicId)){
          this.setData({
            currentTime,
            currentWidth
          })
        }
      })
      
      // 订阅recommendSong发布的musicId,放在onload开始就绑定
      PubSub.subscribe('musicId',(msg,musicId) => {

        this.getMusicInfo(musicId)  //加载歌曲详情
        this.musicControl(true,musicId) //点击下一首立即开始播放音乐
        this.setData({
          musicId //更新歌曲id
        })
  
        // console.log(111)

        })

    },

    // isPlay的状态(动画的状态)
    changePlayState(isPlay){
      // clearTimeout(this.timer)
      // this.timer = setTimeout(() => {
        this.setData({
          isPlay
        })
      // }, 800);

      // 修改全局音乐播放的状态
      app.globalData.isMusicPlay = isPlay

    },

    // 点击播放和暂停按钮的回调
    handleMusicPlay(){
      let isPlay = !this.data.isPlay
      // 点击立即修改图标状态
      this.setData({
        isPlay
      })

      // 调用控制音乐状态的回调
      this.musicControl(isPlay,this.data.musicId,this.data.musicLink)

    },

    // 控制音乐播放状态
    async musicControl(isPlay,musicId,musicLink){
      // 关闭上一个定时器
      // clearTimeout(this.musicState)

      // 判断音乐状态
      if(isPlay){
        // 判断data数据中是否有音乐路径,避免重复发请求
        if(!musicLink){
        // 获取歌曲地址
        let musicLinkData = await request('/song/url',{id:musicId})
        musicLink = musicLinkData.data[0].url
        
        this.setData({
          musicLink,   //更新musicLink
          // isPlay //作为参数传进来也要更新isPlay
        })
      }
      
      
      // this.musicState = setTimeout(() => {
        // wx.showLoading({title:'加载中'})
        console.log(this.data.song.name,musicLink)
        this.backgroundAudioManager.title = this.data.song.name  //设置歌曲名为音频标题
        // this.backgroundAudioManager.src && (this.backgroundAudioManager.src = musicLink)
        this.backgroundAudioManager.src = musicLink
        
        // wx.hideLoading()
      // }, 800);
      

      }else{
        this.backgroundAudioManager.pause()
      }

    },

    // 获取歌曲详情
    async getMusicInfo(musicId){
      wx.showLoading({title:'加载中'})

      // 获取歌曲数据
      let songData = await request('/song/detail',{ids:musicId})
      // 获取和转换总时长
      let durationTime = moment(songData.songs[0].dt).format('mm:ss')

      this.setData({
        song:songData.songs[0],
        durationTime
      })

      wx.hideLoading()

      // 设置标题为歌名
      wx.setNavigationBarTitle({
        title:this.data.song.name
      })

      // 判断是否暂停，否需要播放
      console.log(!(app.globalData.musicId === musicId))

      if(!(app.globalData.musicId === musicId)){
        
        this.musicControl(true,musicId)

      }

    },

    // 点击切歌
    handleSwitch(event){
      let type = event.currentTarget.id

      this.setData({
        musicLink:'', //清空音乐路径
        currentTime:'00:00',
        currentWidth:0,
      })

      this.backgroundAudioManager.pause() //切换前关闭上一首歌曲

      // 发布type给recommendSong,开始切歌
      PubSub.publish('switchType',type)

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
      // 取消消息订阅
      PubSub.unsubscribe('musicId')

      // 将卸载前的音乐进度保存到全局
      let {currentTime,currentWidth} = this.data

      app.globalData.currentTime = currentTime

      app.globalData.currentWidth = currentWidth


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