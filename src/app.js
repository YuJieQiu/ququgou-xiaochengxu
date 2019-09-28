//app.js
App({
  onLaunch: function () {
    //判断机型(适配iphoneX)
    wx.getSystemInfo({
      success: res => {
        const that = this
        const screenList = new Array("iPhone X", "iPhone 11", "iPhone12")

        let custom = wx.getMenuButtonBoundingClientRect()
        this.globalData.statusBar = res.statusBarHeight
        this.globalData.custom = custom
        this.globalData.customBar =
          custom.bottom + custom.top - res.statusBarHeight

        const model = res.model
        for (let index = 0; index < screenList.length; index++) {
          if (model.search(screenList[index]) != -1) {
            that.globalData.isIPX = true
            break
          }
        }
      }
    })
  },
  beforeLogin() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              let userInfo = res.userInfo

              wx.setStorageSync('userInfo', JSON.stringify(userInfo))

              this.login(userInfo)
            }
          })
        } else {
          wx.navigateTo({ url: '/pages/authorize/index' })
        }
      }
    })
  },
  login(userInfo) {
    wx.login({
      success: res => {
        this.httpPost(
          'wechat/login',
          { code: res.code, ...userInfo },
          true
        ).then(res => {
          wx.setStorageSync('token', res.data)
          wx.reLaunch({
            url: '/pages/merchant/index'
          })
        })
      }
    })
  },
  mapKey: 'DSXBZ-6AY3U-QLAVO-4H6LL-ZOIT3-ALFUW',
  //baseUrl: 'http://148.70.176.93/user/api/v1/',
  //baseUrl: 'https://ququgo.club/user/api/v1/',
  baseUrl: 'http://127.0.0.1:8070/user/api/v1/',
  httpBase: function (method, url, data, loading) {
    let _this = this
    let requestUrl = this.baseUrl + url
    let token = wx.getStorageSync('token')

    if (loading) {
      wx.showLoading({
        title: '加载中...'
      })
    }

    function request(resolve, reject) {
      wx.request({
        header: {
          token: token
        },
        method: method,
        url: requestUrl,
        data: data,
        success: function (result) {
          if (loading) {
            wx.hideLoading()
          }

          var res = result.data

          if (res && res.code === 200) {
            resolve(res)
          } else if (res && res.code == 400) {
            if (res.message) {
              wx.showToast({
                title: res.message,
                icon: 'none'
              })
            }
            reject(res)
          } else if (res && res.code == 401) {
            wx.removeStorageSync('token')
            _this.beforeLogin()
            reject(res)
          } else {
            reject(res)
          }
        },
        fail: function (res) {
          reject(res)
          if (loading) {
            wx.hideLoading()
          }
          wx.showToast({
            title: '网络出错',
            icon: 'none'
          })
        }
      })
    }

    return new Promise(request)
  },
  httpGet: function (url, data, loading) {
    return this.httpBase('GET', url, data, loading)
  },
  httpPost: function (url, data, loading) {
    return this.httpBase('POST', url, data, loading)
  },
  globalData: {
    version: '1.0.0',
    isIPX: false,
    custom: {},
    customBar: {},
    statusBar: {}
  }
})

// {
//   "pagePath": "pages/merchant/index",
//   "iconPath": "assets/images/tab/merchant.png",
//   "selectedIconPath": "assets/images/tab/merchantCur.png",
//   "text": "商户"
// },
