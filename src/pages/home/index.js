const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
Page({
  data: {
    current: 0,
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
    banner: [
      "1.jpg",
      "2.jpg",
      "3.jpg",
      "4.jpg",
      "5.jpg"
    ],
    category: [{
      img: "1.jpg",
      name: "短袖T恤"
    }, {
      img: "2.jpg",
      name: "足球"
    }, {
      img: "3.jpg",
      name: "运动鞋"
    }, {
      img: "4.png",
      name: "中老年"
    }, {
      img: "5.png",
      name: "甜美风"
    }, {
      img: "6.jpg",
      name: "鱼尾裙"
    }, {
      img: "7.jpg",
      name: "相机配件"
    }, {
      img: "8.jpg",
      name: "护肤套装"
    }, {
      img: "9.jpg",
      name: "单肩包"
    }, {
      img: "10.jpg",
      name: "卫衣"
    }],
    newProduct: [{
      name: "时尚舒适公主裙高街修身长裙",
      present: 198,
      original: 298,
      pic: "1.jpg",
      type: 1,
      isLabel: true
    }, {
      name: "高街修身雪纺衫",
      present: 398,
      original: 598,
      pic: "2.jpg",
      type: 2,
      isLabel: true
    }, {
      name: "轻奢商务上衣",
      present: 99,
      original: 199,
      pic: "3.jpg",
      type: 1,
      isLabel: true
    }, {
      name: "品质牛皮婚鞋牛皮婚鞋品质就是好",
      present: 99,
      original: 199,
      pic: "5.jpg",
      type: 1,
      isLabel: true
    }, {
      name: "轻奢时尚大包限时新品推荐",
      present: 99,
      original: 199,
      pic: "6.jpg",
      type: 1,
      isLabel: false
    }, {
      name: "高街修身长裙",
      present: 999,
      original: 1299,
      pic: "4.jpg",
      type: 2,
      isLabel: true
    }],
    productList: [{
      img: 1,
      name: "欧莱雅（LOREAL）奇焕光彩粉嫩透亮修颜霜 30ml（欧莱雅彩妆 BB霜 粉BB 遮瑕疵 隔离）",
      sale: 599,
      factory: 899,
      payNum: 2342
    },
    {
      img: 2,
      name: "德国DMK进口牛奶  欧德堡（Oldenburger）超高温处理全脂纯牛奶1L*12盒",
      sale: 29,
      factory: 69,
      payNum: 999
    },
    {
      img: 3,
      name: "【第2支1元】柔色尽情丝柔口红唇膏女士不易掉色保湿滋润防水 珊瑚红",
      sale: 299,
      factory: 699,
      payNum: 666
    },
    {
      img: 4,
      name: "百雀羚套装女补水保湿护肤品",
      sale: 1599,
      factory: 2899,
      payNum: 236
    },
    {
      img: 5,
      name: "百草味 肉干肉脯 休闲零食 靖江精制猪肉脯200g/袋",
      sale: 599,
      factory: 899,
      payNum: 2399
    },
    {
      img: 6,
      name: "短袖睡衣女夏季薄款休闲家居服短裤套装女可爱韩版清新学生两件套 短袖粉色长颈鹿 M码75-95斤",
      sale: 599,
      factory: 899,
      payNum: 2399
    },
    {
      img: 1,
      name: "欧莱雅（LOREAL）奇焕光彩粉嫩透亮修颜霜",
      sale: 599,
      factory: 899,
      payNum: 2342
    },
    {
      img: 2,
      name: "德国DMK进口牛奶",
      sale: 29,
      factory: 69,
      payNum: 999
    },
    {
      img: 3,
      name: "【第2支1元】柔色尽情丝柔口红唇膏女士不易掉色保湿滋润防水 珊瑚红",
      sale: 299,
      factory: 699,
      payNum: 666
    },
    {
      img: 4,
      name: "百雀羚套装女补水保湿护肤品",
      sale: 1599,
      factory: 2899,
      payNum: 236
    }
    ],
    pageIndex: 1,
    loadding: false,
    pullUpOn: true
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
      url: '/pages/navbar-2/navbar-2'
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
      console.log(res.data)
      if (res != null && res.data != null) {
        let list = res.data.list
        if (list["hometba"].length > 0) {
          if (list["hometba"][0].productSmallInfos.length < 5) {
            that.getProductList()
          }
          that.setData({
            tabProducts: list["hometba"][0].productSmallInfos,
            'getHometbaProductPage.pageEnd': true
          })
        }

        that.setData({
          confList: list,
          confTextList: res.data.textList
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