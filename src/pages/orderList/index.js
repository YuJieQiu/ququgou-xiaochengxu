const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
import Toast from '../../dist/toast/toast'
import Dialog from '../../dist/dialog/dialog'
Page({
  data: {
    list: [],
    page: 1, //默认第一页开始
    limit: 10, //默认每页10条
    all: true,
    status: 0,
    pageEnd: false,
    tabIndex: 0
  },

  onShow: function() {},
  getOrderListInfo: function() {
    let data = {
      page: this.data.page,
      limit: this.data.limit,
      all: this.data.all,
      status: this.data.status
    }

    app.httpGet('order/get/list', data).then(res => {
      wx.stopPullDownRefresh()
      if (res.data.length <= 0) {
        this.setData({ pageEnd: true })
        return
      }
      let list = this.data.list
      if (this.data.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      this.setData({
        list: list
      })
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
      .catch(() => {})
  },
  onClickTab(e) {
    let data = e.detail

    switch (data.index) {
      case 0: //全部
        this.setData({
          all: true,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 0
        })
        break
      case 1: //待付款
        this.setData({
          all: false,
          status: 0,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 1
        })
        break
      case 2: //待发货
        this.setData({
          all: false,
          status: 1,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 2
        })
        break
      case 3: //待收货
        this.setData({
          all: false,
          status: 3,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 3
        })
        break
      case 4: //待评价
        this.setData({
          all: false,
          status: 5,
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 4
        })
        break
    }
    this.getOrderListInfo()
  },
  // onScrollTab(e){
  //     console.log(e)
  // },
  // onPageScroll(e){ // 获取滚动条当前位置
  //     console.log(e)
  //     //console.log(e.scrollTop)//获取滚动条当前位置的值
  // },
  onReachBottom() {
    if (!this.data.pageEnd) {
      this.setData({ page: this.data.page + 1 })
      console.log('onReachBottom')
      this.getOrderListInfo()
    }
    // Do something when page reach bottom.
  },
  //上拉刷新
  onPullDownRefresh() {
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
  onLoad(options) {
    this.getOrderListInfo()
  }
})
