const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
import Dialog from '../../dist/dialog/dialog'
import drawQrcode from '../../utils/weapp.qrcode.esm.js' //生成二维码js
Page({
  data: {
    showQrcode: false,
    orderNo: '',
    order: {},
    address: {},
    products: [],
    merAddress: {}
  },
  getMerAddressInfo() {
    const that = this
    let data = {
      merIds: [that.data.order.merId]
    }
    app.httpPost('mer/addresses', data).then(res => {
      if (res.data != null && res.data.length > 0) {
        that.setData({
          merAddress: res.data[0]
        })
      }

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
  getDataInfo: function (orderNo) {
    let that = this
    app.httpGet('order/get/detail', { orderNo: orderNo }).then(res => {

      that.setData({
        address: res.data.address,
        products: res.data.products,
        order: res.data
      })

      if (res.data.deliveryType == 10) {
        that.getMerAddressInfo()
      }
    })
  },
  //订单支付
  onOrderPay() {
    let that = this
    app
      .httpPost('order/pay', { orderNo: that.data.orderNo }, true)
      .then(res => {
        if (res.code == 200) {
          let data = res.data
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
                Toast('支付失败~');
              },
              'complete': function (res) {
                console.log(res)
              }
            })
        }
      })
  },
  onOrderCancel() {
    let that = this
    Dialog.confirm({
      title: '取消订单',
      message: '是否取消订单'
    })
      .then(() => {
        app
          .httpPost('order/cancel', { orderNo: that.data.orderNo })
          .then(res => {
            Toast('已取消~');
            this.getDataInfo(that.data.orderNo)
          })
      })
      .catch(() => { })
  },
  onLoad(options) {
    let orderNo = options.orderNo
    if (orderNo == null || orderNo == '') {
      wx.redirectTo({ url: '/pages/orderList/index' })
    }

    this.setData({
      orderNo: orderNo
    })
    this.getDataInfo(orderNo)
  },
  //生成二维码
  generateQrcode(e) {
    let no = e.currentTarget.dataset.no
    let data = {
      type: 'order',
      code: no
    }

    drawQrcode({
      width: 200,
      height: 200,
      canvasId: 'myQrcode',
      text: JSON.stringify(data)
    })

    this.setData({
      showQrcode: true
    })
  }
})
