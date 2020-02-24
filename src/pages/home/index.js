const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
Page({
  data: {
    current: 0,
    headerBackgroundColor: '#F78421',
    headerFontColor: 'white',
    hotSearch: [],
    banner: [],
    category: [],
    newProduct: [],
    productList: [],
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    lat: 0,
    lon: 0,
    swiperAutoplay: true,
    refresh: false,
    location: null
  },
  //产品详情
  showDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  },
  //打开位置信息
  onOpenLocation: function () {
    wx.openSetting()
  },
  //刷新位置信息
  onRefreshLocation() {
    app.getLocationInfo()
    // location = wx.getStorageSync('location')
    // this.setData({
    //   location: location
    // })
  },
  //搜索
  search: function (e) {
    let key = e.currentTarget.dataset.key || ""
    if (key != null && key != "") {
      wx.navigateTo({
        url: '/pages/productList/index?searchKey=' + key
      })
    } else {
      wx.navigateTo({
        url: '/pages/newsSearch/index'
      })
    }
  },
  //banner change 事件
  onChangeBanner(e) {
    let index = e.detail.current
    let banner = this.data.banners[index]

    this.setData({
      headerBackgroundColor: banner.backgroundColor,
      headerFontColor: banner.fontColor
    })

    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: banner.backgroundColor,
      animation: {
        duration: 200,
        timingFunc: 'easeIn'
      }
    })
  },
  //获取banner 列表
  getBannerList() {
    app.httpGet('home/banner/getList').then(res => {
      if (res && res.data) {
        let banner = res.data[0]
        this.setData({
          banners: res.data,
          headerBackgroundColor: banner.backgroundColor,
          headerFontColor: banner.fontColor
        })
      }
    })
  },
  //获取首页配置列表
  getHomeConfigList() {
    const that = this
    app.httpGet('home/config/list').then(res => {
      if (res != null && res.data != null) {
        let list = res.data.list
        if (list["hometba"] == null || list["hometba"].length < 0 || list["hometba"][0].productSmallInfos == null ||
          list["hometba"][0].productSmallInfos.length < 10) {
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
  // getHometbaProductList() {
  //   const that = this
  //   if (that.data.getHometbaProductPage.pageEnd) {
  //     return
  //   }
  //   app.httpGet('home/config/product/list', that.data.getHometbaProductPage).then(res => {
  //     if (res.data == null || res.data.length <= 0) {
  //       that.setData({ 'getHometbaProductPage.pageEnd': true })
  //       that.getProductList()
  //       return
  //     }
  //     let list = this.data.tabProducts
  //     if (this.data.getHometbaProductPage.page > 1) {
  //       list.push(...res.data)
  //     } else {
  //       list = res.data
  //     }
  //     that.setData({
  //       tabProducts: list
  //     })
  //     if (res.data.length < 10) {
  //       that.setData({ 'getHometbaProductPage.pageEnd': true })
  //     }
  //   })
  // },
  //获取推荐列表
  getProductList() {
    const that = this
    if (that.data.getProductListPage.pageEnd) {
      return
    }

    if (that.data.lat == 0 || that.data.lon == 0) {
      let location = wx.getStorageSync('location')
      if (!location) {
        app.getLocationInfo()
      }
      if (!location) {
        location = {
          lat: 0,
          lon: 0,
        }
      }
      that.setData({
        'lat': parseFloat(location.lat),
        'lon': parseFloat(location.lon),
      })
    }

    let data = {
      page: that.data.getProductListPage.page,
      limit: that.data.getProductListPage.limit,
      lat: that.data.lat,
      lon: that.data.lon,
      source: parseInt(1)
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
  // getHomeData() {
  //   app.httpGet('home/productConfig/getConfigProductList').then(res => {
  //     if (res && res.data) {
  //       this.setData({
  //         tabs: res.data
  //       })
  //     }
  //   })
  // },
  getHomeInitInfo() {
    this.setData({
      'getHometbaProductPage.page': 1,
      'getHometbaProductPage.limit': 10,
      'getHometbaProductPage.pageEnd': false,
      'getProductListPage.page': 1,
      'getProductListPage.limit': 10,
      'getProductListPage.pageEnd': false
    })
    this.getHomeConfigList()
  },
  onReachBottom: function () {
    // if (!this.data.pullUpOn) return;
    // this.setData({
    //   loadding: true
    // }, () => {
    //   if (this.data.pageIndex == 4) {
    //     this.setData({
    //       loadding: false,
    //       pullUpOn: false
    //     })
    //   } else {
    //     let loadData = JSON.parse(JSON.stringify(this.data.productList));
    //     loadData = loadData.splice(0, 10)
    //     if (this.data.pageIndex == 1) {
    //       loadData = loadData.reverse();
    //     }
    //     this.setData({
    //       productList: this.data.productList.concat(loadData),
    //       pageIndex: this.data.pageIndex + 1,
    //       loadding: false
    //     })
    //   }
    // })
  },
  //下拉加载
  onReachBottom() {
    // if (!this.data.getHometbaProductPage.pageEnd) {
    //   this.setData({ 'getHometbaProductPage.page': this.data.getHometbaProductPage.page + 1 })
    //   this.getHometbaProductList()
    // }

    if (this.data.getHometbaProductPage.pageEnd) {
      if (!this.data.getProductListPage.pageEnd) {
        this.setData({ 'getProductListPage.page': this.data.getProductListPage.page + 1 })
        this.getProductList()
      }
    }
  },
  //上拉刷新
  onPullDownRefresh: function () {
    let loadData = JSON.parse(JSON.stringify(this.data.productList));
    loadData = loadData.splice(0, 10)
    this.setData({
      productList: loadData,
      pageIndex: 1,
      pullUpOn: true,
      loadding: false
    })
    if (this.data.banner.length <= 0) {
      this.getBannerList()
    }
    this.getHomeInitInfo()
    this.onLocationInit()
    wx.stopPullDownRefresh()
  },
  onLocationInit() {
    let location = this.data.location
    if (!location) {
      location = wx.getStorageSync('location')
      if (!location) {
        app.getLocationInfo()
        setTimeout(function () {
          location = wx.getStorageSync('location')
        }, 1000);
      }
      this.setData({
        location: location
      })
    }
  },
  onShow() {
    this.onLocationInit()
    if (this.data.refresh) {
      this.getHomeInitInfo()
      this.getBannerList()
      this.setData({
        refresh: false
      })
    }
  },
  onClickHomeCategory(e) {
    const item = e.currentTarget.dataset.item
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
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          menuHeight: res.windowHeight - res.windowWidth / 750 * 92,
          windowHeight: res.windowHeight,
          pixelRatio: res.pixelRatio
        });
      }
    });
    this.getBannerList()
    this.getHomeInitInfo()
    this.onLocationInit()
  },
  //  
  onHide() {
    this.setData({
      swiperAutoplay: false
    });
  },
  /**
  * 页面滚动距离
  */
  onPageScroll: function (e) {
    if (e.scrollTop > 0) {
      this.setData({
        swiperAutoplay: false
      });
    } else if (e.scrollTop == 0) {
      this.setData({
        swiperAutoplay: true
      });
    }
  }
})