const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')

Page({
  data: {
    active: "0",
    merCode: '',
    merId: 0,
    merInfo: {},
    tabs: [],
    isIPX: app.globalData.isIPX,
    currency: '¥',
    page: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      count: 0,
      pageEnd: false
    },
    goods: [],
    refresh: false
  },
  showDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  },
  onPhoneClick() {
    wx.makePhoneCall({
      phoneNumber: this.data.merInfo.phones
    })
  },
  onAddressClick() {
    const latitude = this.data.merInfo.address.latitude
    const longitude = this.data.merInfo.address.longitude
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  onClickToShowDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  },
  getMerProductList() {
    let data = {
      page: this.data.page.page,
      limit: this.data.page.limit,
      merCode: this.data.merCode,
      merId: this.data.merId
    }
    app.httpGet('mer/product/get/list', data).then(res => {
      if (res.data.length <= 0) {
        this.setData({ 'page.pageEnd': true })
        return
      }

      let list = this.data.goods
      if (this.data.page.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      this.setData({
        goods: list
      })
    })
  },
  getMerInfo() {
    let that = this
    app
      .httpGet('merchant/get', { merId: that.data.merId, merCode: that.data.merCode })
      .then(res => {
        wx.stopPullDownRefresh()
        let data = res.data

        wx.setNavigationBarTitle({
          title: data.name//页面标题为路由参数
        })

        //label处理S
        let label = data.label
        let arrayLabel = []
        if (label != null) {
          const mapLabel = new Map(Object.entries(label))
          for (var [key, value] of mapLabel) {
            arrayLabel.push({ id: key, text: value })
          }
          data.label = arrayLabel
        }
        //label处理 E 
        this.setData({
          merInfo: data
        })
      })
  },
  onReachBottom() {
    if (!this.data.page.pageEnd) {
      this.setData({ 'page.page': this.data.page.page + 1 })
      this.getMerProductList()
    }
  },
  onPullDownRefresh() {
    this.setData({ 'page.page': 1, 'page.pageEnd': false })
    this.getMerInfo()
    this.getMerProductList()
  },
  onShow(o) {
    if (this.data.refresh) {
      this.setData({
        refresh: false
      })
      this.getMerInfo()
      this.getMerProductList()
    }
  },
  onLoad(options) {
    //undefined
    if (options.merCode != null && options.merCode != "" && options.merCode != "undefined") {
      this.setData({
        merCode: options.merCode
      })
    } if (options.merId != null && options.merId != "" && options.merId != "undefined") {
      this.setData({
        merId: options.merId
      })
    }

    this.getMerInfo()
    this.getMerProductList()
  }
})
