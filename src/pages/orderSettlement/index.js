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
    merAddress: [],
    paymentTypeList: [],//支付方式
    selectPaymentTypeId: 0//选择的支付方式
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
  //支付方式获取
  getPaymentTypeList() {
    const that = this
    let data = {}
    app.httpGet('shop/payment/type/list', data).then(res => {
      that.setData({
        paymentTypeList: res.data,
        selectPaymentTypeId: res.data[0].id.toString(),
      })
    })
  },
  //支付方式选择 
  onPayTypeChange(event) {
    // this.setData({
    //   selectPaymentTypeId: event.detail
    // });
  },
  onPayTypeClick(event) {
    const { name, code } = event.currentTarget.dataset;
    this.setData({
      selectPaymentTypeId: name.toString()
    });
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
    if (this.data.selectPaymentTypeId == 0 || this.data.selectPaymentTypeId == "0") {
      Toast('请选择支付方式~');
      return
    }
    this.orderCreare()
  },
  onSubmitWait() {
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
      deliveryFee: 0,//配送费用
      paymentTypeId: parseInt(that.data.selectPaymentTypeId),
      discounts: [],
      products: products
    }

    //TODO:倒计时结束自动关闭
    app
      .httpPost('order/create', data, false)
      .then(res => {
        toast.clear()
        that.removeShopCart()
        if (res.code == 200) {
          let data = res.data
          let paymentType = null
          that.data.paymentTypeList.forEach(element => {
            if (element.id == that.data.selectPaymentTypeId) {
              paymentType = element
            }
          });
          if (paymentType != null && paymentType.code == "WeChatPay") {//如果是在线支付订单，调用支付接口
            wx.requestPayment(
              {
                'timeStamp': data.timestamp,
                'nonceStr': data.nonceStr,
                'package': data.package,
                'signType': data.signType,
                'paySign': data.paySign,
                'success': function (res) {
                  wx.redirectTo({
                    url: '/pages/orderSettlement/success/success'
                  })
                },
                'fail': function (res) {
                  wx.redirectTo({
                    url: '/pages/orderList/index'
                  })
                },
                'complete': function (res) {
                  //console.log(res)
                }
              })
          } else {
            wx.redirectTo({
              url: '/pages/orderSettlement/success/success'
            })
          }
        } else {
          Toast('创建订单失败~');
          console.log(res)
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
  onShow() {
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
    this.getPaymentTypeList()
  },
  chooseAddr() {
    wx.navigateTo({
      url: "/pages/addressList/index?id=" + this.data.address.id
    })
  },
  btnPay() {
  }
})