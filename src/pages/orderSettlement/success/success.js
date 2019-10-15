Page({
  data: {

  },
  onLoad: function (options) {

  },
  goHome() {
    wx.switchTab({
      url: "/pages/home/index"
    })
  },
  goOrder() {
    wx.redirectTo({
      url: '/pages/orderList/index'
    })
  }
})