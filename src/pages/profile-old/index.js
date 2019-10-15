const app = getApp()
const { appValidate } = require('../../utils/util.js')

Page({
  data: {
    avatar: '',
    name: ''
  },
  onLoad() {
    let userInfoStr = wx.getStorageSync('userInfo')
    let userInfo = null
    if (appValidate.isNullOrEmpty(userInfoStr)) {
      wx.getUserInfo({
        success: res => {
          userInfo = res.userInfo
          wx.setStorageSync('userInfo', JSON.stringify(userInfo))
        }
      })
    } else {
      userInfo = JSON.parse(userInfoStr)
    }

    this.setData({
      avatar: userInfo.avatarUrl,
      name: userInfo.nickName
    })
    console.log(this.data.avatar)
  }
})
