const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
Page({
  data: {
    list: [],
    skuList: [
      {
        id: 0,
        image: '',
        price: 0,
        name: '',
        stock: 0,
        pids: [],
        vids: [],
        vidNames: [],
        pidNames: [],
        checkAll: false,
        number: 0,
        attrNames: []
      }
    ],
    productAmount: 0,
    discountsAmount: 0,
    orderAmount: 0,
    remark: '',
    address: { id: 0 }
  },
  onClickAddress(e) {
    wx.navigateTo({
      url: '/pages/addressList/index'
    })
  },
  onShow: function() {},
  getAddressInfo: function() {
    app.httpGet('address/user/first', {}).then(res => {
      let address = res.data
      this.setData({
        address: {
          id: address.id,
          city: address.city,
          region: address.region,
          town: address.town,
          address: address.address,
          username: address.name,
          phone: address.phone
        }
      })
    })
  },
  onSubmitOrderCreate() {
    this.orderCreare()
  },
  onSubmitWait() {
    console.log('onSubmitWait')
    return
  },
  orderCreare: function() {
    const toast = Toast.loading({
      mask: true,
      message: '处理中...',
      duration: 0
    })

    let products = []

    this.data.list.forEach(l => {
      l.skuList.forEach(s => {
        products.push({
          merId: l.merId,
          productNo: s.productNo,
          productSkuId: s.id,
          productNumber: s.number,
          productAmount: s.price * s.number,
          productUnitPrice: s.price,
          shopCartId: s.shopCartId
        })
      })
    })

    let data = {
      productAmountTotal: this.data.productAmount,
      discountsAmountTotal: this.data.discountsAmount,
      orderAmountTotal: this.data.orderAmount,
      addressId: this.data.address.id,
      remark: this.data.remark,
      deliveryTypeId: 1,
      deliveryFee: 0,
      deliveryAddressId: 1,
      paymentType: 1,
      discounts: [],
      products: products
    }

    //TODO:倒计时结束自动关闭
    app
      .httpPost('order/create', data, false)
      .then(res => {
        toast.clear()
        console.log(res)
        // wx.navigateTo({
        //     url: '/pages/orderList/index'
        // })
        wx.redirectTo({
          url: '/pages/orderList/index'
        })
      })
      .catch(error => {
        toast.clear()
        console.log(error)
      })
  },
  //优惠卷选择
  //运输方式选择
  onInputRemark(e) {
    this.setData({ remark: e.detail })
  },
  onLoad(options) {
    let arrPages = getCurrentPages()

    console.log(arrPages)

    let object = JSON.parse(options.jsonData)

    let list = this.data.list
    list.push(...object)
    this.setData({ list: list })

    console.log(this.data.list)

    this.getAddressInfo()

    let productAmount = 0
    let discountsAmount = 0
    let orderAmount = 0

    //订单
    list.forEach(l => {
      l.skuList.forEach(s => {
        console.log(s.price)
        console.log(s.number)
        console.log(s.price * s.number)
        productAmount += s.price * s.number
      })
    })

    console.log(productAmount)
    console.log(discountsAmount)
    console.log(productAmount - discountsAmount)

    orderAmount = productAmount - discountsAmount

    this.setData({
      productAmount: productAmount,
      discountsAmount: discountsAmount,
      orderAmount: orderAmount
    })

    //this.setData({detail:object});
  }
})
