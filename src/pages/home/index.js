const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
const pageStart = 1

Page({
  data: {
    banners: [],
    tabs: [],
    confList: [],
    isIPX: app.globalData.isIPX,
    ad_info: {},
    sticky: false,
    fixTop: '',//区域离顶部的高度
    scrollTop: 0,//滑动条离顶部的距离
    tabProducts: [],
    goods: [],
    getHometbaProductPage: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      pageEnd: false,
      appConfigId: 0
    },
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
  getHomeConfigList() {
    const that = this
    app.httpGet('home/config/list').then(res => {
      if (res && res.data) {
        if (res.data["hometba"].length > 0) {
          that.setData({
            tabProducts: res.data["hometba"][0].productSmallInfos
          })
        }
        that.setData({
          confList: res.data
        })
      }
    })
  },
  getHometbaProductList() {
    const that = this
    app.httpGet('home/config/product/list', that.data.getHometbaProductPage).then(res => {
      if (res && res.data) {
        if (res.data.length <= 0) {
          that.setData({ 'getHometbaProductPage.pageEnd': true })
          return
        }
        let list = this.data.tabProducts
        if (this.data.getHometbaProductPage.page > 1) {
          list.push(...res.data)
        } else {
          list = res.data
        }
        that.setData({
          tabProducts: list
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
  onChangeHometba(event) {
    const index = event.detail.index
    const confId = this.data.confList["hometba"][index].id
    this.setData({
      'getHometbaProductPage.appConfigId': confId,
      'getHometbaProductPage.page': 1,
      'getHometbaProductPage.limit': 10,
      'getHometbaProductPage.pageEnd': false
    })
    this.getHometbaProductList()
  },
  onPullDownRefresh() {
    //this.getData('refresh', pageStart);
  },
  onReachBottom() {
    if (!this.data.getHometbaProductPage.pageEnd) {
      this.setData({ 'getHometbaProductPage.page': this.data.getHometbaProductPage.page + 1 })
      this.getHometbaProductList()
    }
  },
  onPageScroll(e) {
    // let self = this;
    // let sysn = wx.getSystemInfoSync();
    // wx.createSelectorQuery().select('.header').boundingClientRect(function (rect) {
    //   console.log(rect)
    //   self.setData({
    //     fixTop: rect.top,
    //   })
    // }).exec()
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
          success: function (res) {
            // console.log(JSON.stringify(res));
            // let province = res.result.ad_info.province
            // let city = res.result.ad_info.city

            _this.setData({
              ad_info: res.result.ad_info
            })
          },
          fail: function (res) {
            console.log(res)
          },
          complete: function (res) {
            // console.log(res);
          }
        })
      }
    })
    this.getBannerList()
    //this.getHomeData()
    this.getHomeConfigList()
  }
})
