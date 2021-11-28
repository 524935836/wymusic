const app = getApp()

export default () => {
  let userInfo = wx.getStorageSync('userInfo')
  if(!userInfo){
    wx.showModal({
      title:`用户未登录,
          是否进入登录界面？`,
      icon:'none',
      success:(res) => {
        if(res.confirm){  //点击确定跳转

          wx.navigateTo({
            url:'/pages/login/login'
          })
        }else{
            wx.navigateBack({  //返回上一页
              fail:() => {
              }
            })

        }
      },
    })
  }
}