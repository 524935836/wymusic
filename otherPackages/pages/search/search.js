import request from '../../../utils/request'

Page({

    /**
     * 页面的初始数据
     */
    data: {
      placeholderContent:'',
      hotList:[],
      searchContent:'', //输入框内容
      searchList:[],
      historyList:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

      this.getIntData() //初始化

      this.getSearchHistory() //获取本地历史记录

    },

    // 获取初始化数据
    async getIntData(){
      // 获取默认搜索关键词
      let placeholderContentData = await request('/search/default') 

      // 获取热搜列表
      let hotListData = await request('/search/hot/detail')

      this.setData({
        placeholderContent:placeholderContentData.data.showKeyword,
        hotList:hotListData.data
      })

    },

    // 搜索框发生变化的回调
    handleInputChange(event){
      this.setData({
        searchContent:event.detail.value.trim()
      })

      this.newTime = Date.now()
      if(this.newTime - (this.lastTime || 0) < 3000) return   //节流，模拟点击
      this.lastTime = this.newTime

      this.getSearchList()   //获取搜索数据

    },

    // 获取搜索数据(每0.3ms发送一次,节流)
    async getSearchList(){
      if(!this.data.searchContent){  //表单为空值时返回
        this.setData({
          searchList:[]  //清空关键字列表数据
        })
        return
      }

      let searchListData = await request('/search',{keywords:this.data.searchContent,limit :10})
      this.setData({
        searchList:searchListData.result.songs  //关键字列表数据
      })

      this.setSearchHistory() //保存历史，结合节流模拟点击进关键字，留下历史记录
    },

    // 将历史记录保存到本地
    setSearchHistory(){
      let {searchContent,historyList} = this.data

      // 判断是否有重复的历史记录
      if(historyList.indexOf(searchContent) !== -1){
        historyList.splice(historyList.indexOf(searchContent),1) //删除重复的，再放入第一位
      }
      historyList.unshift(searchContent)

      this.setData({
        historyList
      })

      // 将历史记录添加到本地存储
      wx.setStorageSync('searchHistory',historyList)

    },

    // 为了使页面关闭历史记录也在，将读取本地存储
    getSearchHistory(){
      let historyList = wx.getStorageSync('searchHistory')

      // 判断是否有历史记录
      if(historyList){
        this.setData({
          historyList
        })
      }

    },

    // 点×清空搜索框
    clearSearchContent(){
      this.setSearchHistory() //保存历史

      this.setData({
        searchContent:'', //清空搜索框，需要搜索框绑定searchContent
        searchList:[]  //清空关键字列表数据
      })
    },

    // 点击清空历史记录
    deleteSearchHistory(){
      // 判断是否删除
      wx.showModal({
        content:'确认删除记录吗',
        success:(res) => {
          if(res.confirm){
            this.setData({
              historyList:[]  //清空historyList记录
            })
            wx.removeStorageSync('searchHistory') //删除本地记录
          }
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