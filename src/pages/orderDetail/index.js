const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
import Dialog from '../../dist/dialog/dialog'
Page({
  data: {
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
      console.log(res)
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
            console.log(res)
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
  }
})
