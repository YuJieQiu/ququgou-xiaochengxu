const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
const pageStart = 1

Page({
  data: {
    merId: '',
    merInfo: {},
    tabs: [],
    isIPX: app.globalData.isIPX,
    currency: '¥',
    ifScrollY: false,
    page: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      pageEnd: false
    },
    goods: []
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
  onTabsScroll(e) {
    if (e.detail.isFixed == true) {
      this.setData({
        ifScrollY: true
      })
    } else {
      this.setData({
        ifScrollY: false
      })
    }
  },
  onClickToShowDetail(e) {
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
  getMerProductList() {
    let data = {
      page: this.data.page.page,
      limit: this.data.page.limit,
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
    app
      .httpGet('merchant/get', { id: '6de79d7d7f764e3981b35d8b9a36fcc3' })
      .then(res => {
        wx.stopPullDownRefresh()
        let data = res.data
        console.log(res.data)
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
    if (!this.data.page.pageEnd && this.data.ifScrollY == true) {
      this.setData({ 'page.page': this.data.page.page + 1 })
      this.getMerProductList()
    }
  },
  onPullDownRefresh() {
    this.setData({ 'page.page': 1, ifScrollY: false })
    this.getMerInfo()
    this.getMerProductList()
  },

  onLoad(options) {
    this.data.merId = '6de79d7d7f764e3981b35d8b9a36fcc3'
    this.getMerInfo()
    this.getMerProductList()
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
    // const _this=this
    //   wx.getLocation({
    //     type: 'wgs84',
    //     success(res) {
    //       const latitude = res.latitude
    //       const longitude = res.longitude
    //       const speed = res.speed
    //       const accuracy = res.accuracy
    //       qqmapsdk.reverseGeocoder({
    //         location: {
    //             latitude: latitude,
    //             longitude: longitude
    //         },
    //         success: function (res) {
    //             // console.log(JSON.stringify(res));
    //             // let province = res.result.ad_info.province
    //             // let city = res.result.ad_info.city
    //             _this.setData({
    //                 ad_info:res.result.ad_info
    //             })
    //           },
    //           fail: function (res) {
    //             console.log(res);
    //           },
    //           complete: function (res) {
    //             // console.log(res);
    //           }
    //     });
    // }});
    // this.getBannerList();
    // this.getHomeData();
  }
})
