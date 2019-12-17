const app = getApp()
const util = require('../../../utils/util.js')

Page({
  data: {
    merId: 0,
    history: [],
    hot: [],
    key: "",
    showActionSheet: false,
    tips: "确认清空搜索历史吗？"
  },
  getSearchHotList() {
    app.httpGet('hot/search/get', {}).then(res => {
      if (res.code == 200 && res.data.length > 0) {
        this.setData({
          hot: res.data
        })
      }
    })
  },
  onLoad: function (options) {
    let merId = options.merId
    this.setData({
      merId: merId
    })
    this.getSearchHotList()
  },
  onShow() {
    //本地缓存搜索历史
    let history = wx.getStorageSync('searchHistory')
    if (history != null && history.length > 0) {
      this.setData({
        'history': history
      })
    }
  },
  back: function () {
    wx.navigateBack();
  },
  input: function (e) {
    let key = util.trim(e.detail.value);
    this.setData({
      key: key
    })
  },
  search(e) {
    let key = util.trim(e.detail.value);
    this.setData({
      key: key
    })
    if (key != "") {
      this.addSearchHistory(key)
    }
    this.goProductList()
  },
  goProductList() {
    const that = this
    wx.reLaunch({
      url: '/pages/merchantList/index?searchKey=' + that.data.key
    })
  },
  cleanKey: function () {
    this.setData({
      key: ''
    });
  },
  closeActionSheet: function () {
    this.setData({
      showActionSheet: false
    })
  },
  openActionSheet: function () {
    this.setData({
      showActionSheet: true
    })
  },
  onClickItemSearch(e) {
    let key = e.currentTarget.dataset.text
    this.setData({
      key: key
    })
    this.addSearchHistory(key)
    this.goProductList()
  },
  addSearchHistory(key) {
    var history = this.data.history
    var bl = false
    history.forEach(element => {
      if (element == key) {
        bl = true
      }
    });
    if (!bl) {
      history.push(key)
      this.setData({
        history: history
      })
      wx.setStorageSync('searchHistory', history)
    }
  },
  itemClick: function (e) {
    let index = e.detail.index;
    if (index == 0) {
      this.setData({
        showActionSheet: false,
        history: []
      })
      wx.setStorageSync('searchHistory', [])
    }
  }
})