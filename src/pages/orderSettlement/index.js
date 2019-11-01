const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
Page({
  data: {
    hasCoupon: true,
    insufficient: false,
    active: 5,
    deliveryId: 5,
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
        attrNames: [],
        deliveryTypes: []
      }
    ],
    productAmount: 0,
    discountsAmount: 0,
    orderAmount: 0,
    remark: '',
    address: { id: 0 },
    merAddress: []
  },
  //收货地址
  onClickAddress(e) {
    wx.navigateTo({
      url: '/pages/addressList/index'
    })
  },
  //商户自提地址
  onClickMerAddress(e) {
    const latitude = e.currentTarget.dataset.latitude
    const longitude = e.currentTarget.dataset.longitude
    wx.openLocation({
      latitude,
      longitude,
      scale: 18
    })
  },
  //选择收货方式
  onChangeDeliveryType(e) {
    const that = this
    const id = e.detail.name
    that.setData({
      deliveryId: id
    })
    console.log(this.data.deliveryId)
  },
  getAddressInfo: function () {
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
  getMerAddressInfo() {
    const that = this
    var merIds = new Array()
    that.data.list.forEach(item => {
      merIds.push(item.merId)
    });
    let data = {
      merIds: merIds
    }

    app.httpPost('mer/addresses', data).then(res => {
      that.setData({
        merAddress: res.data
      })
    })
  },
  onSubmitOrderCreate() {
    //创建订单数据校验
    if (this.data.deliveryId == 5 && this.data.address.id == 0) {
      Toast('请选择收货地址~');
      return
    }
    this.orderCreare()
  },
  onSubmitWait() {
    console.log('onSubmitWait')
    return
  },
  orderCreare: function () {
    let that = this
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
      deliveryTypeId: parseInt(this.data.deliveryId),
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
        that.removeShopCart()
        // wx.navigateTo({
        //     url: '/pages/orderList/index'
        // })
        if (res.code == 200) {
          wx.redirectTo({
            url: '/pages/orderSettlement/success/success'
          })
        }

      })
      .catch(error => {
        toast.clear()
      })
  },
  //优惠卷选择
  //运输方式选择
  onInputRemark(e) {
    this.setData({ remark: e.detail })
  },
  removeShopCart() {
    let currentPages = getCurrentPages()
    if (currentPages.length > 1) {
      let cartPage = currentPages[currentPages.length - 2]
      if (cartPage.route == 'pages/shopCart/index') {
        cartPage.setData({
          checkboxData: [],
          allCheckboxData: false,
          selectProductList: [],
          totalPrice: 0
        })
      }
    }
  },
  onLoad(options) {
    let object = JSON.parse(options.jsonData)

    let list = this.data.list
    list.push(...object)
    this.setData({ list: list })

    this.getAddressInfo()

    let productAmount = 0
    let discountsAmount = 0
    let orderAmount = 0

    //订单
    list.forEach(l => {
      l.skuList.forEach(s => {
        productAmount += s.price * s.number
      })
    })

    orderAmount = productAmount - discountsAmount

    this.setData({
      productAmount: productAmount,
      discountsAmount: discountsAmount,
      orderAmount: orderAmount
    })

    this.getMerAddressInfo()
  },
  chooseAddr() {
    wx.navigateTo({
      url: "/pages/addressList/index"
    })
  },
  btnPay() {

  }
})