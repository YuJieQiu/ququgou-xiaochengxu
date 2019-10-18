const app = getApp()

Page({
  data: {
    list: [],
    curList: [],
    tabCur: 0,
    mainCur: 0,
    verticalNavTop: 0,
    list: [],
    load: true,
    customBar: app.globalData.customBar,
    custom: app.globalData.custom,
    statusBar: app.globalData.statusBar
  },
  tabSelect(e) {
    var curList = {}
    let id = e.currentTarget.dataset.id
    this.data.list.forEach(element => {
      if (element.id == id) {
        curList = element
      }
    })
    this.setData({
      tabCur: id,
      mainCur: id,
      verticalNavTop: (e.currentTarget.dataset.id - 1) * 50,
      curList: curList
    })
  },
  verticalMain(e) {
    let that = this
    let list = this.data.list
    let tabHeight = 0
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select('#main-' + list[i].id)
        view
          .fields(
            {
              size: true
            },
            data => {
              list[i].top = tabHeight
              tabHeight = tabHeight + data.height
              list[i].bottom = tabHeight
            }
          )
          .exec()
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 100
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          verticalNavTop: (list[i].id - 1) * 50,
          tabCur: list[i].id,
          curList: list[i]
        })
        return false
      }
    }
  },
  goProductList(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/productList/index?categoryId=' + id
    })
  },
  getDataList: function () {
    const that = this
    app.httpGet('category/get/list').then(res => {
      if (res && res.data) {
        that.setData({
          list: res.data,
          curList: res.data[0],
          tabCur: res.data[0].id
        })
      }
      console.log(res)
    })
  },
  onLoad(options) {
    this.getDataList()
  }
})
