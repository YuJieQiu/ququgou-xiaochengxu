const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })

Page({
  data: {
    banners: [],
    tabs: [],
    active: 0,
    confList: [],
    isIPX: app.globalData.isIPX,
    ad_info: {},
    sticky: false,
    fixTop: '',//区域离顶部的高度
    scrollTop: 0,//滑动条离顶部的距离
    tabDatas: [],
    tabProducts: [],
    goods: [],
    getHometbaProductPage: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      total: 0,
      pageEnd: false,
      appConfigId: 0
    },
    getProductListPage: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      total: 0,
      pageEnd: false,
    },
    location: {
      city: "上海市"
    }//位置信息
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
    if (that.data.getHometbaProductPage.pageEnd) {
      return
    }

    app.httpGet('home/config/product/list', that.data.getHometbaProductPage).then(res => {

      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'getHometbaProductPage.pageEnd': true })
        that.getProductList()
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
    })
  },
  getProductList() {
    const that = this
    if (that.data.getProductListPage.pageEnd) {
      return
    }

    app.httpGet('shop/product/info/getList', that.data.getProductListPage).then(res => {
      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'getProductListPage.pageEnd': true })
        return
      }
      let list = this.data.goods
      if (this.data.getProductListPage.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      that.setData({
        goods: list
      })
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
    let guid = e.currentTarget.dataset.guid
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

    if (this.data.getHometbaProductPage.pageEnd) {
      if (!this.data.getProductListPage.pageEnd) {
        this.setData({ 'getProductListPage.page': this.data.getProductListPage.page + 1 })
        this.getProductList()
      }
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
    let location = wx.getStorageSync('location')
    console.log(location)
    if (location != null && location != "") {
      this.setData({
        location: location
      })
    }

    this.getBannerList()
    this.getHomeConfigList()
  }
})
