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
    isInvalid: false,
    pageIndex: 1,
    loadding: false,
    pullUpOn: true,
    totalPrice: ''
  },
  getInfo() {
    var that = this
    app.httpGet('shop/cart/get').then(res => {
      if (res.code == 200 && res.data != null && res.data.length > 0) {
        console.log(res.data)
        // var totalPrice = 0
        // res.data.forEach(item => {
        //   item.products.forEach(p => {
        //     totalPrice += p.number * p.price
        //   })
        //})
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
        that.setData({
          list: res.data
          //totalPrice: totalPrice
        })
      }
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
    var list = this.data.list
    var data = []
    var totalPrice = 0

    list.forEach(element => {
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
  handleCancel2(event) {
    const that = this
    const id = event.currentTarget.dataset.id
    var ids = [id]
    this.removeCart(ids)
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
    var list = this.data.list

    app.httpPost('shop/cart/remove', { ids: ids }).then(res => {
      if (res.code != 200) {
        console.log(res)
        return
      }

      if (isRefresh) {
        that.getInfo()
      }

      for (let index = 0; index < list.length; index++) {
        list[index].products.splice(
          list[index].products.findIndex(item => item.cartId === id),
          1
        )
        if (list[index].products.length == 0) {
          list.splice(
            list.findIndex(item => item.merId === list[index].merId),
            1
          )
        }
      }
      that.setData({
        list: list
      })
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
      element.products.forEach(p => {
        if (event.detail) {
          newData.push(p.cartId.toString())
        }
        // if (data.length > 0) {
        //   data.forEach(d => {
        //     if (p.cartId != parseInt(d) && event.detail) {
        //       newData.push(p.cartId.toString())
        //     }
        //   })
        // } else {

        // }
      })
    })
    this.setData({
      allCheckboxData: event.detail,
      checkboxData: newData
    })
    this.computeOrderProduct()
  },
  //修改数量
  onChangeNumber(e) {
    let number = e.detail
    let cartId = e.currentTarget.dataset.id
    var list = this.data.list
    for (let i = 0; i < list.length; i++) {
      var b = false
      for (let j = 0; j < list[i].products.length; j++) {
        var element = list[i].products[j]
        if (element.cartId == cartId) {
          list[i].products[j].number = number
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
  onLoad(options) { },
  onShow() {
    this.getInfo()
  },
  changeNum: function (e) {
    console.log(e)
    let value = `dataList[${e.detail.index}].buyNum`
    this.setData({
      [value]: e.detail.value
    })
  },
  handlerButton: function (e) {
    console.log(e)
    const that = this
    const id = e.currentTarget.dataset.id
    this.removeCart(id)
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
    if (!this.data.pullUpOn) return;
    this.setData({
      loadding: true
    })
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
        pageIndex: this.data.pageIndex + 1,
        loadding: false,
        productList: this.data.productList.concat(loadData)
      })
    }
  }
})