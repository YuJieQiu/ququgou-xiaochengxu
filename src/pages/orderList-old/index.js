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
    active: 0,
    pageEnd: false,
    tabIndex: 0,
    tabsList: [
      {
        title: "全部",
        name: 0,
        statusText: ""
      },
      {
        title: "待完成",
        name: 1,
        statusText: "待完成"
      },
      {
        title: "已完成",
        name: 2,
        statusText: "已完成"
      }
    ]
  },

  onShow: function () { },
  getOrderListInfo: function () {
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
      case 1: //待完成
        this.setData({
          all: false,
          status: "0001",
          list: [],
          page: 1,
          pageEnd: false,
          tabIndex: 1
        })
        break
      case 2: //已完成
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
