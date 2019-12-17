const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })

Page({
  data: {
    queryParam: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      text: '',//泛搜索 包括 商品名称 类型名称 商品内容等，只要商品有相关性就显示出来
      lat: 0,//当前搜索用户所在经纬度
      lon: 0,//当前搜索用户所在经纬度
      distance: 10,//距离范围 按 KM
      sortType: 1,//排序类型 1、默认 3、销量 正序 5、销量 倒叙  7、价格 正序 9、价格 倒叙 11、距离 最近
      categoryId: 0,//商品分类Id
      computeDistance: true
    },
    pageEnd: false,
    list: [],
    status: 0,
    active: 0,
    searchKey: "", //搜索关键词
    width: 200, //header宽度
    height: 64, //header高度
    inputTop: 0, //搜索框距离顶部距离
    arrowTop: 0, //箭头距离顶部距离
    dropScreenH: 0, //下拉筛选框距顶部距离
    dropScreenShow: false,
    scrollTop: 0,
    tabIndex: 0, //顶部筛选索引
    isList: true, //是否以列表展示  | 列表或大图
    drawer: false,
    drawerH: 0, //抽屉内部scrollview高度 
    selectH: 0,
    pageIndex: 1,
    loadding: false,
    pullUpOn: true
  },
  onReachBottom: function () {
    if (!this.data.pageEnd) {
      this.setData({
        'queryParam.page': this.data.queryParam.page + 1,
        loadding: true
      })
      this.searchProductList()
    }
  },
  closeDropdownList: function () {
    if (this.data.selectH > 0) {
      this.setData({
        selectH: 0
      })
    }
  },
  screen: function (e) {
    let index = e.currentTarget.dataset.index;

    if (index == 0) {
      if (this.data.selectH > 0) {
        this.closeDropdownList()
      }
      return
    }

    if (index == 1 && this.data.queryParam.sortType != 3) {//按销量排序

      return
    }

    if (index == 2 && this.data.queryParam.sortType != 11) {//按距离排序

      return
    }

    if (index == 3) {
      this.closeDropdownList()
      this.setData({
        isList: !this.data.isList
      })
      return
    }

    if (index == 4) {
      this.closeDropdownList()
      this.setData({
        drawer: true
      })
      return
    }
  },
  back: function () {
    let arrPages = getCurrentPages()
    if (arrPages.length == 1) {
      wx.switchTab({
        url: "/pages/home/index"
      })
    } else {
      wx.navigateBack()
    }
  },
  search: function () {
    wx.navigateTo({
      url: '/pages/merchantList/search/index'
    })
  },
  showDetail(e) {
    let merId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/merchant/index?merId=' + merId
    })
  },
  resetSearchQueryParam() {
    this.setData({
      'pageEnd': false,
      'queryParam.page': 1,
      goods: []
    })
  },
  searchProductList() {
    const that = this
    if (that.data.queryParam.lat == 0 || that.data.queryParam.lon == 0) {
      let location = wx.getStorageSync('location')
      if (location == null) {
        app.getLocationInfo()
      }
      that.setData({ 'queryParam.lat': parseFloat(location.lat), 'queryParam.lon': parseFloat(location.lon) })
    }
    app.httpPost('mer/list/search', that.data.queryParam).then(res => {
      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'pageEnd': true })
        return
      }
      let list = this.data.list
      if (res.data.length < that.data.queryParam.limit) {
        that.setData({ 'pageEnd': true })
      }

      if (that.data.queryParam.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      that.setData({
        list: list
      })
      if (res.data.length < 10) {
        that.setData({ 'pageEnd': true })
      }
    })
  },
  onLoad: function (options) {
    let obj = wx.getMenuButtonBoundingClientRect();
    this.setData({
      width: obj.left,
      height: obj.top + obj.height + 8,
      inputTop: obj.top + (obj.height - 30) / 2,
      arrowTop: obj.top + (obj.height - 32) / 2,
      'queryParam.text': options.searchKey || "",
      'queryParam.categoryId': parseInt(options.categoryId) || 0,
    }, () => {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            //略小，避免误差带来的影响
            dropScreenH: this.data.height * 750 / res.windowWidth + 90,
            drawerH: res.windowHeight - res.windowWidth / 750 * 100 - this.data.height
          })
        }
      })
    });
    this.searchProductList()
  },
})