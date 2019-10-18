const app = getApp()
Page({
  data: {
    menuHeight: "", //菜单高度
    currentTab: 0, //预设当前项的值
    scrollTop: 0, //tab标题的滚动条位置
    windowHeight: 0,
    pixelRatio: 0,
    tabCurIndex: 0
  },
  getDataList: function () {
    const that = this
    app.httpGet('category/get/list').then(res => {
      if (res && res.data) {
        let list = res.data
        that.setData({
          list: list
        })
      }
    })
  },
  onLoad: function (options) {
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          menuHeight: res.windowHeight - res.windowWidth / 750 * 92,
          windowHeight: res.windowHeight,
          pixelRatio: res.pixelRatio
        });
      }
    });

    this.getDataList()
  },
  // 点击标题切换当前页时改变样式
  swichNav: function (e) {
    let cur = e.currentTarget.dataset.current;
    if (this.data.tabCurIndex == cur) {
      return false;
    } else {
      wx.pageScrollTo({
        scrollTop: 0
      })
      this.setData({
        tabCurIndex: cur
      })
      this.checkCor();
    }
  },
  //判断当前滚动超过一屏时，设置tab标题滚动条。
  checkCor: function () {
    let that = this;
    //这里计算按照实际情况进行修改，动态数据要进行动态分析
    //思路：窗体高度/单个分类高度 200rpx 转px计算 =>得到一屏幕所显示的个数，结合后台传回分类总数进行计算
    //数据很多可以多次if判断然后进行滚动距离计算即可
    // console.log(this.data.windowHeight)
    // console.log(this.data.pixelRatio)
    //let count = (this.data.windowHeight * this.data.pixelRatio) / 200

    if (that.data.tabCurIndex > 7) {
      that.setData({
        scrollTop: 500
      })
    } else {
      that.setData({
        scrollTop: 0
      })
    }
  },
  detail(e) {
    wx.navigateTo({
      url: '../extend-view/productDetail/productDetail'
    })
  },
  productList(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/productList/index?categoryId=' + id
    })
  },
  search: function () {
    wx.navigateTo({
      url: '/pages/newsSearch/index'
    })
  }
})