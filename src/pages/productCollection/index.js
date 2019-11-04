const app = getApp()
Page({
  data: {
    dataList: [{
      id: 1,
      buyNum: 2
    }, {
      id: 2,
      buyNum: 1
    }],
    actions: [ 
      {
        name: '移除收藏',
        color: '#fff',
        fontsize: 20,
        width: 64,
        background: '#F82400'
      }
    ],
    isEdit: false, 
    isInvalid: false,
    pageIndex: 1,
    loadding: false,
    pullUpOn: true, 
    getListPage: {
      page: 1,
      limit: 10,
      pageEnd: false
    }, 
    list:[]
  },
  getList() {
    var that = this
    if (that.data.getListPage.pageEnd) {
      return
    }
    app.httpGet('shop/collection/get').then(res => {
      wx.stopPullDownRefresh()
      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'getListPage.pageEnd': true })
        return
      }
      let list = this.data.list
      if (that.data.getListPage.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      that.setData({
        list: list
      })
      if (res.data.length < that.data.getListPage.limit) {
        that.setData({ 'getListPage.pageEnd': true })
      } 
    })
  },  
  onLoad(options) { 
  },
  onShow() {
    this.getList()
  }, 
  handleCancel(event) {
    const that = this
    const guid = event.currentTarget.dataset.guid
   
    let data={
      productCode:guid
    }
    app.httpPost('shop/collection/remove',data).then(res => {
      if(res.code==200){
        this.getInfo()
      }
  })
  },  
  onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 200)
  },
  onPullDownRefresh: function () {
    this.getList()
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    if (!this.data.getListPage.pageEnd) {
      this.setData({ 'getListPage.page': this.data.getListPage.page + 1 })
      this.getList()
    }
  },
  showDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  }
})