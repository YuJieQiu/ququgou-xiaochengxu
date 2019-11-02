const QQMapWX = require('utils/qqmap-wx-jssdk.min.js')
//app.js
App({
  onHide() {

  },
  onLaunch: function () {
    this.getLocationInfo()
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
          let arrPages = getCurrentPages()

          if (arrPages.length > 1) {
            if (arrPages[arrPages.length - 1].route == "pages/authorize/index") {
              return
            }
          }
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

          //返回授权前页面
          let arrPages = getCurrentPages()

          if (arrPages.length > 1) {
            arrPages[arrPages.length - 2].setData({
              refresh: true
            })
            wx.navigateBack({
              delta: arrPages.length - (arrPages.length - 1),
              success: res => {
              },
              fail: function (res) { },
              complete: function (res) { }
            })
          } else {
            arrPages[arrPages.length - 1].setData({
              refresh: true
            })
            wx.startPullDownRefresh()
            wx.stopPullDownRefresh()
          }
        })
      }
    })
  },
  mapKey: 'DSXBZ-6AY3U-QLAVO-4H6LL-ZOIT3-ALFUW',
  getLocationInfo: function (func) {//获取位置信息   
    let _this = this
    const qqmapsdk = new QQMapWX({ key: _this.mapKey })
    let location = {}
    //微信接口获取坐标
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        location.lat = res.latitude
        location.lon = res.longitude
        location.speed = res.speed
        location.accuracy = res.accuracy
        //通过腾讯地图接口获取详细信息
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: location.lat,
            longitude: location.lon
          },
          success: function (res) {
            location.city = res.result.ad_info.city
            location.province = res.result.ad_info.province
            location.info = res.result
            _this.globalData.location = location

            wx.setStorageSync('location', location)
          },
          fail: function (res) {
          },
          complete: function (res) {
          }
        })
      }
    })
  },
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
    statusBar: {},
    location: {
      lat: 0,
      lon: 0,
      speed: 0,
      accuracy: 0,
      province: '',
      city: '',
      info: {}
    }//位置信息
  }
})

// {
//   "pagePath": "pages/merchant/index",
//   "iconPath": "assets/images/tab/merchant.png",
//   "selectedIconPath": "assets/images/tab/merchantCur.png",
//   "text": "商户"
// },
