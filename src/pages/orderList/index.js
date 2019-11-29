const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
import Dialog from '../../dist/dialog/dialog'
import drawQrcode from '../../utils/weapp.qrcode.esm.js' //生成二维码js
Page({
  data: {
    showQrcode: false,
    tabs: [
      {
        title: "全部",
        name: 0,
        statusText: ""
      },
      {
        title: "待支付",
        name: 1,
        statusText: "待支付"
      },
      {
        title: "已支付",
        name: 2,
        statusText: "已支付"
      },
      {
        title: "待完成",
        name: 3,
        statusText: "待完成"
      },
      {
        title: "已完成",
        name: 4,
        statusText: "已完成"
      }
    ],
    list: [],
    page: 1, //默认第一页开始
    limit: 10, //默认每页10条
    all: true,
    status: 0,
    active: 0,
    pageEnd: false,
    tabIndex: 0,
    currentTab: 0,
    pageIndex: 1,
    loadding: true,
    pullUpOn: true,
    scrollTop: 0
  },
  getOrderListInfo: function () {
    let data = {
      page: this.data.page,
      limit: this.data.limit,
      all: this.data.all,
      status: this.data.status
    }

    app.httpGet('order/get/list', data).then(res => {
      wx.stopPullDownRefresh()
      if (res.data == null || res.data.length <= 0) {
        this.setData({
          pageEnd: true
        })
        return
      }

      let list = this.data.list
      if (this.data.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      if (res.data.length < 10) {
        this.setData({
          pageEnd: true
        })
      }
      this.setData({
        list: list
      })
    })
  },
  //立即支付
  onOrderPay(e) {
    let no = e.currentTarget.dataset.no
    let that = this
    app
      .httpPost('order/pay', { orderNo: no }, true)
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
  onOrderCancel(e) {
    let that = this
    let no = e.currentTarget.dataset.no
    Dialog.confirm({
      title: '取消订单',
      message: '是否取消订单'
    })
      .then(() => {
        app.httpPost('order/cancel', { orderNo: no }).then(res => {
          that.onClickTab({ detail: { index: that.data.tabIndex } })
        })
      })
      .catch(() => { })
  },
  onClickTab(e) {
    let data = e.detail

    switch (parseInt(data.name)) {
      case 0: //全部
        this.setData({
          all: true,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 0
        })
        break
      case 1: //待支付
        this.setData({
          all: false,
          status: "0000",
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 1
        })
        break
      case 2: //已支付
        this.setData({
          all: false,
          status: "0910",
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 1
        })
        break
      case 3: //待完成
        this.setData({
          all: false,
          status: "0001",
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 1
        })
        break
      case 4: //已完成
        this.setData({
          all: false,
          status: "9990",
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 2
        })
        break
    }
    this.getOrderListInfo()
  },
  onReachBottom() {
    if (!this.data.pageEnd) {

      this.setData({ page: this.data.page + 1 })
      this.getOrderListInfo()
    }
  },
  //上拉刷新
  onPullDownRefresh() {
    // setTimeout(() => {
    //   wx.stopPullDownRefresh()
    // }, 300);
    this.setData({ page: 1, pageEnd: false })
    this.getOrderListInfo()
  },
  onInputRemark(e) {
    this.setData({ remark: e.detail })
  },
  //跳转到详情页面
  onClickRedirectionDetail(e) {
    let that = this
    let no = e.currentTarget.dataset.no
    wx.navigateTo({ url: '/pages/orderDetail/index?orderNo=' + no })
  },
  onLoad: function (options) {
    this.getOrderListInfo()
  },
  change(e) {
    this.setData({
      currentTab: e.detail.index
    })
  },
  detail() {
    wx.showToast({
      title: '功能尚未完善~',
      icon: 'none'
    })
  },
  onPageScroll(e) {
    this.setData({
      scrollTop: e.scrollTop
    })
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