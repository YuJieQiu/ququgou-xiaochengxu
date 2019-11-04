const app = getApp()
const { appValidate } = require('../../utils/util.js')

Page({
  data: {
    userInfo: {
      productCollectionCount: 0
    },
    avatar: '',
    name: '',
    height: 64, //header高度
    top: 0, //标题图标距离顶部距离
    scrollH: 0, //滚动总高度
    opcity: 0,
    iconOpcity: 0.5,
    productList: [],
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    getProductListPage: {
      page: 1,
      limit: 10,
      pageEnd: false
    },
    goods: [],
    lat: 0,
    lon: 0,
    showGetUserInfoBut: false
  },
  onLoad: function (options) {
    let obj = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          width: obj.left || res.windowWidth,
          height: obj.top ? (obj.top + obj.height + 8) : (res.statusBarHeight + 44),
          top: obj.top ? (obj.top + (obj.height - 32) / 2) : (res.statusBarHeight + 6),
          scrollH: res.windowWidth * 0.6
        })
      }
    })
  },
  authorize() {
    wx.navigateTo({ url: '/pages/authorize/index' })
  },
  href(e) {
    let page = Number(e.currentTarget.dataset.type)
    let url = "";
    switch (page) {
      case 1:
        break;
      case 2:
        url = "../set/set"
        break;
      case 3:
        url = "../userInfo/userInfo"
        break;
      case 4:
        url = "/pages/orderList/index"
        break;
      default:
        break;
    }
    if (url) {
      wx.navigateTo({
        url: url
      })
    } else {
      // wx.showToast({
      //   title: "功能尚未完善~",
      //   icon: "none"
      // })
    }
  },
  detail: function () {
    // wx.navigateTo({
    //   url: '../../productDetail/productDetail'
    // })
  },
  onPageScroll(e) {
    let scroll = e.scrollTop <= 0 ? 0 : e.scrollTop;
    let opcity = scroll / this.data.scrollH;
    if (this.data.opcity >= 1 && opcity >= 1) {
      return;
    }
    this.setData({
      opcity: opcity,
      iconOpcity: 0.5 * (1 - opcity < 0 ? 0 : 1 - opcity)
    })
  },
  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 200)
  },
  getUserCenterInfo() {
    const that = this
    app.httpGet('user/center/get', {}).then(res => {
      if (res && res.data) {
        that.setData({
          userInfo: res.data
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
  onReachBottom: function () {
    if (!this.data.getProductListPage.pageEnd) {
      this.setData({ 'getProductListPage.page': this.data.getProductListPage.page + 1 })
      this.getProductList()
    }
  },
  onClickProductCollection() {
    wx.navigateTo({
      url: '/pages/productCollection/index'
    })
  },
  //获取推荐列表
  getProductList() {
    const that = this
    if (that.data.getProductListPage.pageEnd) {
      return
    }

    if (that.data.lat == 0 || that.data.lon == 0) {
      let location = wx.getStorageSync('location')
      if (location == null) {
        app.getLocationInfo()
      }
      if (location == null) {
        location = {
          lat: 0,
          lon: 0,
        }
      }
      that.setData({ 'lat': parseFloat(location.lat), 'lon': parseFloat(location.lon) })
    }

    let data = {
      page: that.data.getProductListPage.page,
      limit: that.data.getProductListPage.limit,
      lat: that.data.lat,
      lon: that.data.lon,
      source: parseInt(3)
    }
    app.httpPost('recommend/product/list', data).then(res => {
      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'getProductListPage.pageEnd': true })
        return
      }
      let list = this.data.goods
      if (that.data.getProductListPage.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      that.setData({
        goods: list
      })
      if (res.data.length < that.data.getProductListPage.limit) {
        that.setData({ 'getProductListPage.pageEnd': true })
      }
    })
  },
  onShow() {
    let userInfoStr = wx.getStorageSync('userInfo')
    if (userInfoStr != null && userInfoStr != "") {
      this.getUserCenterInfo()
    }
  },
  onLoad() {
    let userInfoStr = wx.getStorageSync('userInfo')
    let userInfo = null
    if (appValidate.isNullOrEmpty(userInfoStr)) {
      this.setData({
        showGetUserInfoBut: true,
      })
      // wx.getUserInfo({
      //   success: res => {
      //     userInfo = res.userInfo
      //     wx.setStorageSync('userInfo', JSON.stringify(userInfo))
      //   }
      // })
    } else {
      userInfo = JSON.parse(userInfoStr)
    }
    if (userInfo != null) {
      this.setData({
        avatar: userInfo.avatarUrl,
        name: userInfo.nickName
      })
    }
    this.getProductList()
  }
})