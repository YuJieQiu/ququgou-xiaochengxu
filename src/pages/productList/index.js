const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
const pageStart = 1

Page({
  data: {
    banners: [],
    tabs: [],
    isIPX: app.globalData.isIPX,
    ad_info: {}
  },

  getBannerList() {
    app.httpGet('home/banner/getList').then(res => {
      if (res && res.data) {
        this.setData({
          banners: res.data
        })
      }
    })
  },
  getHomeData() {
    app.httpGet('home/productConfig/getConfigProductList').then(res => {
      if (res && res.data) {
        this.setData({
          tabs: res.data
        })
      }
    })
  },
  showDetail(e) {
    console.log(e.currentTarget.dataset.guid)
    let guid = e.currentTarget.dataset.guid

    //console.log(this.data)
    // let index = e.currentTarget.dataset;
    // let data = this.data.tabs[index];
    // console.log(index)
    // console.log(data)
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  },
  onPullDownRefresh() {
    //this.getData('refresh', pageStart);
  },
  onReachBottom() {
    //this.getData('more', this.data.page);
  },
  onLoad(options) {
    // wx.getLocation({
    //     type: 'wgs84', //
    //     success(res) {
    //       const latitude = res.latitude
    //       const longitude = res.longitude
    //       const speed = res.speed
    //       const accuracy = res.accuracy

    //       console.log(res)
    //     }
    //   })
    const _this = this

    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy

        qqmapsdk.reverseGeocoder({
          location: {
            latitude: latitude,
            longitude: longitude
          },
          success: function(res) {
            // console.log(JSON.stringify(res));
            // let province = res.result.ad_info.province
            // let city = res.result.ad_info.city

            _this.setData({
              ad_info: res.result.ad_info
            })
          },
          fail: function(res) {
            console.log(res)
          },
          complete: function(res) {
            // console.log(res);
          }
        })
      }
    })
    this.getBannerList()
    this.getHomeData()
  }
})
