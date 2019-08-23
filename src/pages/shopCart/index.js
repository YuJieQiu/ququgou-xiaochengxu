const app = getApp()

Page({
  data: {
    list: [],
    actions: [
      {
        name: '删除',
        color: '#fff',
        fontsize: '20',
        width: 100,
        background: '#ed3f14'
      }
    ],
    totalPrice: 0,
    checkboxData: [],
    allCheckboxData: false,
    selectProductList: []
  },
  getInfo() {
    var that = this
    app.httpGet('shop/cart/get').then(res => {
      if (res.code == 200) {
        // var totalPrice = 0
        // res.data.forEach(item => {
        //   item.products.forEach(p => {
        //     totalPrice += p.number * p.price
        //     console.log(totalPrice)
        //   })
        //})

        that.setData({
          list: res.data
          //totalPrice: totalPrice
        })
      }
      console.log(that.data.list)
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
    console.log(data)
    this.setData({
      totalPrice: totalPrice,
      selectProductList: data
    })
  },
  //到结算页面
  navigateToOrderSettlement() {
    var data = this.data.selectProductList

    let json = JSON.stringify(data)
    console.log(json)
    this.setData({
      checkboxData: [],
      allCheckboxData: false,
      selectProductList: [],
      totalPrice: 0
    })

    wx.navigateTo({
      url: '/pages/orderSettlement/index?jsonData=' + json
    })
  },
  handleCancel2(event) {
    const that = this
    const id = event.currentTarget.dataset.id
    this.removeCart(id)
    console.log(id)
  },
  removeCart(id) {
    const that = this
    var list = this.data.list

    app.httpPost('shop/cart/remove', { id: id }).then(res => {
      if (res.code != 200) {
        console.log(res)
        return
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
    // console.log(data)
    // console.log(event.detail)
    // data.push(event.detail)
    console.log(data)
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
  onLoad(options) {},
  onShow() {
    this.getInfo()
  }
})
