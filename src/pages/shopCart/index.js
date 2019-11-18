const app = getApp()
Page({
  data: {
    dataList: [{
      id: 1,
      buyNum: 2
    }, {
      id: 2,
      buyNum: 1
    }],
    actions: [
      //   {
      //   name: '收藏',
      //   width: 64,
      //   color: '#fff',
      //   fontsize: 28,
      //   background: '#FFC600'
      // },
      // {
      //   name: '看相似',
      //   color: '#fff',
      //   fontsize: 28,
      //   width: 64,
      //   background: '#FF7035'
      // },
      {
        name: '删除',
        color: '#fff',
        fontsize: 28,
        width: 64,
        background: '#F82400'
      }
    ],
    isEdit: false,
    productList: [],
    isInvalid: false,
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    totalPrice: '',
    getProductListPage: {
      page: 1,
      limit: 10,
      pageEnd: false
    },
    goods: [],
    lat: 0,
    lon: 0,
    isOnLoadPage: true
  },
  getInfo() {
    var that = this
    app.httpGet('shop/cart/get').then(res => {
      wx.stopPullDownRefresh()
      if (res.code == 200 && res.data != null && res.data.length > 0) {
        res.data.forEach(mer => {
          if (mer.invalidProducts != null && mer.invalidProducts.length > 0) {
            that.setData({
              isInvalid: true
            })
          } else {
            that.setData({
              isInvalid: false
            })
          }
        });
      }
      that.setData({
        list: res.data
      })
    })
  },
  onClickMerName(e) {
    const code = e.currentTarget.dataset.merCode
    wx.navigateTo({
      url: '/pages/merchant/index?merCode=' + code
    })
  },
  computeOrderProduct() {
    var serlctId = this.data.checkboxData
    if (serlctId == null) {
      return
    }
    var list = this.data.list
    var data = []
    var totalPrice = 0

    list.forEach(element => {
      if (element.products != null && element.products.length > 0) {
        element.products.forEach(p => {
          serlctId.forEach(e => {
            if (p.cartId == parseInt(e)) {
              let d = {
                productNo: p.productNo,
                productName: p.name,
                id: p.productSkuId,
                name: '',
                price: p.price,
                image: p.img.url,
                number: p.number,
                shopCartId: p.cartId,
                attributeInfo: p.attributeInfo
              }

              if (data.length > 0) {
                var b = false
                for (let index = 0; index < data.length; index++) {
                  if (data[index].merId == element.merId) {
                    data[index].skuList.push(d)
                    b = true
                    break
                  }
                }
                if (!b) {
                  data.push({
                    merId: element.merId,
                    merName: element.merName,
                    skuList: [d]
                  })
                }
              } else {
                data.push({
                  merId: element.merId,
                  merName: element.merName,
                  skuList: [d]
                })
              }

              totalPrice += p.number * p.price
            }
          })
        })
      }

    })
    this.setData({
      totalPrice: totalPrice,
      selectProductList: data
    })
  },
  //到结算页面
  navigateToOrderSettlement() {
    var data = this.data.selectProductList

    let json = JSON.stringify(data)

    wx.navigateTo({
      url: '/pages/orderSettlement/index?jsonData=' + json
    })
  },

  onRemoveInvalidProducts() {
    const that = this
    var ids = new Array()
    that.data.list.forEach(mer => {
      if (mer.invalidProducts != null && mer.invalidProducts.length > 0) {
        mer.invalidProducts.forEach(p => {

          ids.push(p.cartId)
        })
      }
    });
    if (ids.length > 0) {
      that.removeCart(ids, true)
    }

  },
  removeCart(ids, isRefresh) {
    const that = this
    app.httpPost('shop/cart/remove', { ids: ids }).then(res => {
      if (res.code != 200) {
        console.log(res)
        return
      }
      that.getInfo()
    })
  },
  onChangeCheckbox(event) {
    var data = this.data.checkboxData
    data = event.detail
    this.setData({ checkboxData: data })

    this.computeOrderProduct()
  },
  onChangeAllCheck(event) {
    var data = this.data.checkboxData
    var list = this.data.list
    var newData = []
    list.forEach(element => {
      if (element.products != null && element.products.length > 0) {
        element.products.forEach(p => {
          if (event.detail) {
            newData.push(p.cartId.toString())
          }
        })
      }
    })
    this.setData({
      allCheckboxData: event.detail,
      checkboxData: newData
    })
    this.computeOrderProduct()
  },
  //修改数量
  onChangeNumber(e) {
    console.log(e)

    let number = e.detail.value
    let cartId = e.currentTarget.dataset.id
    var list = this.data.list
    for (let i = 0; i < list.length; i++) {
      var b = false
      if (list[i].products == null || list[i].products.length < 1) {
        break
      }

      for (let j = 0; j < list[i].products.length; j++) {
        var element = list[i].products[j]
        if (element.cartId == cartId) {
          list[i].products[j].number = number
          console.log(list[i].products[j].number)
          b = true
          break
        }
      }
      if (b) {
        break
      }
    }
    this.setData({
      list: list
    })
    this.computeOrderProduct()
  },
  onLoad(options) {
    this.getInfo()
    this.getProductList()
    this.setData({
      isOnLoadPage: false
    })
  },
  //Refresh
  onPullDownRefresh() {
    this.getInfo()
  },
  onShow() {
    let userInfoStr = wx.getStorageSync('userInfo')
    if (userInfoStr != null && userInfoStr != "" && !this.data.isOnLoadPage) {
      this.getInfo()
    }
  },
  changeNum: function (e) {
    console.log(e)
    let value = `dataList[${e.detail.index}].buyNum`
    this.setData({
      [value]: e.detail.value
    })
  },
  handleCancel(event) {
    const that = this
    const id = event.currentTarget.dataset.id
    var ids = new Array()
    ids.push(id)
    console.log(ids)
    this.removeCart(ids)
  },
  editGoods: function () {
    this.setData({
      isEdit: !this.data.isEdit
    })
  },
  detail: function () {
    wx.navigateTo({
      url: '../../productDetail/productDetail'
    })
  },
  btnPay() {
    wx.navigateTo({
      url: '../submitOrder/submitOrder'
    })
  },
  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 200)
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
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    if (!this.data.getProductListPage.pageEnd) {
      this.setData({ 'getProductListPage.page': this.data.getProductListPage.page + 1 })
      this.getProductList()
    }
  },
  showDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
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
      source: parseInt(2)
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
})