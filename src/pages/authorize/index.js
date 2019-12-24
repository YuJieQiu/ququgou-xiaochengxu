var app = getApp();

Page({
  data: {

  },
  bindGetUserInfo: function (e) {
    if (!e.detail.userInfo) {
      return;
    }
    let userInfo = e.detail.userInfo;

    wx.setStorageSync('userInfo', JSON.stringify(userInfo));

    app.login(userInfo);
  },
  refuseAuth() {
    wx.switchTab({ url: '/pages/home/index' })
  },
})