const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
Page({
  data: {
    current: 0,
    headerBackgroundColor: '',
    headerFontColor: '',
    tabbar: [{
      icon: "home",
      text: "首页",
      size: 21
    }, {
      icon: "category",
      text: "分类",
      size: 24
    }, {
      icon: "cart",
      text: "购物车",
      size: 22
    }, {
      icon: "people",
      text: "我的",
      size: 24
    }],
    hotSearch: [
      "休闲零食",
      "自热火锅",
      "小冰箱迷你"
    ],
    banner: [],
    category: [],
    newProduct: [],
    productList: [],
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    lat:0,
    lon:0,
  },
  onLoad: function (options) {

  },
  tabbarSwitch: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      current: index
    })
    if (index != 0) {
      if (index == 1) {
        this.classify();
      } else if (index == 2) {
        wx.navigateTo({
          url: '../mall-extend/shopcart/shopcart'
        })
      } else {
        wx.navigateTo({
          url: '../mall-extend/my/my'
        })
      }
    }
  },
  onPullDownRefresh: function () {
    let loadData = JSON.parse(JSON.stringify(this.data.productList));
    loadData = loadData.splice(0, 10)
    this.setData({
      productList: loadData,
      pageIndex: 1,
      pullUpOn: true,
      loadding: false
    })
    this.getHomeInitInfo()
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    if (!this.data.pullUpOn) return;
    this.setData({
      loadding: true
    }, () => {
      if (this.data.pageIndex == 4) {
        this.setData({
          loadding: false,
          pullUpOn: false
        })
      } else {
        let loadData = JSON.parse(JSON.stringify(this.data.productList));
        loadData = loadData.splice(0, 10)
        if (this.data.pageIndex == 1) {
          loadData = loadData.reverse();
        }
        this.setData({
          productList: this.data.productList.concat(loadData),
          pageIndex: this.data.pageIndex + 1,
          loadding: false
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
  classify: function () {
    wx.navigateTo({
      url: '/pages/categoryList/index'
    })

  },
  more: function (e) {
    let key = e.currentTarget.dataset.key || "";
    wx.navigateTo({
      url: '../productList/productList?searchKey=' + key
    })

  },
  search: function () {
    wx.navigateTo({
      url: '/pages/newsSearch/index'
    })
  },
  onChangeBanner(e) {
    let index = e.detail.current
    let banner = this.data.banners[index]

    this.setData({
      headerBackgroundColor: banner.backgroundColor,
      headerFontColor: banner.fontColor
    })
    // wx.setNavigationBarColor({
    //   frontColor: banner.fontColor ,
    //   backgroundColor: banner.backgroundColor,
    // })
  },
  getBannerList() {
    app.httpGet('home/banner/getList').then(res => {
      if (res && res.data) {
        let banner = res.data[0]
        this.setData({
          banners: res.data,
          headerBackgroundColor: banner.backgroundColor,
          headerFontColor: banner.fontColor
        })
        // wx.setNavigationBarColor({
        //   frontColor: banner.fontColor,
        //   backgroundColor: banner.backgroundColor,
        // })
      }
    })
  },
  getHomeConfigList() {
    const that = this
    app.httpGet('home/config/list').then(res => {
      console.log(res.data)
      if (res != null && res.data != null) {
        let list = res.data.list
          if (list["hometba"]==null||list["hometba"].length < 0||list["hometba"][0].productSmallInfos==null||
          list["hometba"][0].productSmallInfos.length<10) {
            that.getProductList()
          }

          that.setData({
            tabProducts: list["hometba"][0].productSmallInfos,
            'getHometbaProductPage.pageEnd': true
          })
          that.setData({
            confList: list,
            confTextList: res.data.textList
          })
        }  
    })
  },
  //获取首页tab配置 产品列表
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
      if(location==null){
        location={
          lat: 0,
          lon:0,
        }
      }
      that.setData({ 'lat': parseFloat(location.lat), 'lon': parseFloat(location.lon) })
    }

    let data={
      page:that.data.getProductListPage.page,
      limit:that.data.getProductListPage.limit,
      lat:that.data.lat,
      lon:that.data.lon,
      source:parseInt(1)
    }

    app.httpPost('recommend/product/list', data).then(res => {
      if (res.data == null || res.data.length <= 0|| res.data.length <that.data.getProductListPage.limit) {
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
  getHomeInitInfo() {
    this.setData({
      'getHometbaProductPage.page': 1,
      'getHometbaProductPage.limit': 10,
      'getHometbaProductPage.pageEnd': false,
      'getProductListPage.page': 1,
      'getProductListPage.limit': 10,
      'getProductListPage.pageEnd': false
    })

    this.getBannerList()
    this.getHomeConfigList()
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
  onShow() {
    if (this.data.refresh) {
      this.getHomeInitInfo()
      this.setData({
        refresh: false
      })
    }
  },
  onClickHomeCategory(e) {
    const item = e.currentTarget.dataset.item
    console.log(item)
    if (item.linkUrl != "" && item.linkType == 0) {
      wx.navigateTo({
        url: item.linkUrl
      })
      return
    }
     
    if (item.categoryId > 0) {
      wx.navigateTo({
        url: "/pages/productList/index?categoryId=" + item.categoryId
      })
      return
    }

  },
  onLoad(options) {
    let location = wx.getStorageSync('location')
    console.log(location)
    if (location != null && location != "") {
      this.setData({
        location: location
      })
    }

    this.getHomeInitInfo()
  }
})