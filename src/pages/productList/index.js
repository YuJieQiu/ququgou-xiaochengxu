const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
const pageStart = 1

Page({
  data: {
    isIPX: app.globalData.isIPX,
    active: 0,
    sort: 1,//1 默认 
    page: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      pageEnd: false
    },
    goods: []
  },
  // event.detail 的值为当前选中项的索引
  onChange(event) {
    console.log(event.detail)
  },
  getMerProductList() {
    let data = {
      page: this.data.page.page,
      limit: this.data.page.limit,
      merId: "6de79d7d7f764e3981b35d8b9a36fcc3"
    }
    app.httpGet('mer/product/get/list', data).then(res => {
      if (res.data.length <= 0) {
        this.setData({ 'page.pageEnd': true })
        return
      }

      let list = this.data.goods
      if (this.data.page.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      this.setData({
        goods: list
      })
    })
  },
  onLoad(options) {
    this.getMerProductList()
  }
})
