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
    pageEnd: false
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
      console.log(list)
    })
  },
  onOrderCancel(e) {
    let no = e.currentTarget.dataset.no
    Dialog.confirm({
      title: '取消订单',
      message: '是否取消订单'
    })
      .then(() => {
        app.httpPost('order/cancel', { orderNo: no }).then(res => {
          console.log(res)
        })
      })
      .catch(() => {
        // on cancel
      })
  },
  onClickTab(e) {
    let data = e.detail

    switch (data.index) {
      case 0: //全部
        this.setData({ all: true, list: [], page: 1, pageEnd: false })
        break
      case 1: //待付款
        this.setData({
          all: false,
          status: 0,
          list: [],
          page: 1,
          pageEnd: false
        })
        break
      case 2: //待发货
        this.setData({
          all: false,
          status: 1,
          list: [],
          page: 1,
          pageEnd: false
        })
        break
      case 3: //待收货
        this.setData({
          all: false,
          status: 3,
          list: [],
          page: 1,
          pageEnd: false
        })
        break
      case 4: //待评价
        this.setData({
          all: false,
          status: 5,
          list: [],
          page: 1,
          pageEnd: false
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
  onInputRemark(e) {
    this.setData({ remark: e.detail })
  },
  onLoad(options) {
    this.getOrderListInfo()
  }
})
