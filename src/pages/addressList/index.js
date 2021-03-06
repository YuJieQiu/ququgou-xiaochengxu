const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const pageStart = 1
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const mapInstance = new QQMapWX({ key: app.mapKey })
let mapContext = null

Page({
  data: {
    list: [
      {
        id: 0,
        city: '',
        region: '',
        town: '',
        address: '',
        username: '',
        phone: ''
      }
    ],
    selectId: '0',
    visible2: false,
    toggle: false,
    actions: [
      {
        name: '删除',
        color: '#fff',
        fontsize: '20',
        width: 100,
        background: '#ed3f14'
      }
    ]
  },
  getDataList: function () {
    app.httpGet('address/user/getList', {}).then(res => {
      let list = []

      for (var v of res.data) {
        list.push({
          id: v.id,
          city: v.city,
          region: v.region,
          town: v.town,
          address: v.address,
          username: v.name,
          phone: v.phone
        })
      }

      if (list.length > 0 && this.data.selectId <= 0) {
        this.setData({ selectId: list[0].id.toString() })
      }
      this.setData({ list: list })
    })
  },
  onRadioClick(e) {
    let id = e.currentTarget.dataset.id
    let index = e.currentTarget.dataset.index
    this.setData({ selectId: id.toString() })

    let arrPages = getCurrentPages()
    let address = this.data.list[index]
    // arrPages.forEach(v => {
    //   console.log(v)
    // });
    // console.log(arrPages.length)
    // console.log( arrPages[arrPages.length-2])
    // return
    wx.navigateBack({
      delta: arrPages.length - (arrPages.length - 1),
      success: res => {
        arrPages[arrPages.length - 2].setData({
          address: address
        })
      },
      fail: function (res) { },
      complete: function (res) { }
    })

    // arrPages[arrPages.length-2].setData({
    //   'address':address
    // })
    // {
    // this.arrPages[arrPages.length-2].setData({
    //   'address':address
    // })
    // }
    //console.log(arrPages[arrPages.length-2].data.address)
  },
  onEditClick(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/address/index?id=' + id
    })
  },
  onAddClick(e) {
    wx.navigateTo({
      url: '/pages/address/index'
    })
  },
  onChangeSwipeout(e) {
    const that = this
    let id = e.currentTarget.dataset.id
    app.httpPost('address/user/delete', { id: id }).then(res => {
      this.getDataList()
      if (id == that.data.selectId) {
        let arrPages = getCurrentPages()
        let address = { id: 0 }
        arrPages[arrPages.length - 2].setData({
          address: address
        })
      }
    })
  },
  onShow() {
    this.getDataList()
  },
  onLoad(options) {
    let id = options.id
    if (id != null && id > 0) {
      this.setData({ selectId: id.toString() })
    }
  }
})
