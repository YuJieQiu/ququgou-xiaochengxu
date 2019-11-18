const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })

Page({
  data: {
    queryParam: {
      page: 1, //默认第一页开始
      limit: 10, //默认每页10条
      text: '',//泛搜索 包括 商品名称 类型名称 商品内容等，只要商品有相关性就显示出来
      lat: 0,//当前搜索用户所在经纬度
      lon: 0,//当前搜索用户所在经纬度
      distance: 10,//距离范围 按 KM
      sortType: 1,//排序类型 1、默认 3、销量 正序 5、销量 倒叙  7、价格 正序 9、价格 倒叙 11、距离 最近
      categoryId: 0,//商品分类Id
    },
    pageEnd: false,
    list: [],
    goods: [],
    all: true,
    status: 0,
    active: 0,
    searchKey: "", //搜索关键词
    width: 200, //header宽度
    height: 64, //header高度
    inputTop: 0, //搜索框距离顶部距离
    arrowTop: 0, //箭头距离顶部距离
    dropScreenH: 0, //下拉筛选框距顶部距离
    attrData: [],
    attrIndex: -1,
    dropScreenShow: false,
    scrollTop: 0,
    tabIndex: 0, //顶部筛选索引
    isList: false, //是否以列表展示  | 列表或大图
    drawer: false,
    drawerH: 0, //抽屉内部scrollview高度
    selectedName: "综合",
    selectH: 0,
    dropdownList: [//下拉综合搜索
      {
        name: "综合",
        selected: true,
        sortType: 1,
      }, {
        name: "价格升序",
        selected: false,
        sortType: 9,
      }, {
        name: "价格降序",
        selected: false,
        sortType: 7,
      }
    ],
    attrArr: [],
    productList: [],
    pageIndex: 1,
    loadding: false,
    pullUpOn: true
  },

  onPullDownRefresh: function () {
    this.resetSearchQueryParam()
    this.searchProductList()
    wx.stopPullDownRefresh()
  },
  onReachBottom: function () {
    if (!this.data.pageEnd) {
      this.setData({
        'queryParam.page': this.data.queryParam.page + 1,
        loadding: true
      })
      this.searchProductList()
    }
  },
  //第二级筛选 更改事件
  btnDropChange: function (e) {
    let attrArr = this.data.attrArr
    let index = e.currentTarget.dataset.index;
    let arrItems = e.currentTarget.dataset.items;
    let attrSelectItemIndex = attrArr[index].attrSelectItemIndex;
    let isActiveObj = `attrArr[${index}].isActive`;
    if (attrSelectItemIndex == -1) {
      this.setData({
        [isActiveObj]: !attrArr[index].isActive
      })
    }
    if (arrItems != null && arrItems.length > 0) {
      this.setData({
        dropScreenShow: !this.data.dropScreenShow
      })
    }
    this.setData({
      scrollTop: 0
    })
  },

  //arr item 选择
  btnSelected: function (e) {
    let index = e.currentTarget.dataset.index;
    let arrIndex = e.currentTarget.dataset.arrindex;
    let selected = `attrData[${index}].selected`;
    let attrArr = this.data.attrArr

    for (let i = 0; i < attrArr[arrIndex].list.length; i++) {
      if (i != index) {
        attrArr[arrIndex].list[i].selected = false
      } else {
        attrArr[arrIndex].list[i].selected = !attrArr[arrIndex].list[i].selected
      }
    }
    this.setData({
      attrArr: attrArr
    })
  },
  // 下拉列表点击确定
  onClickDropBtnSure: function (e) {
    let index = e.currentTarget.dataset.index;
    let attrArr = this.data.attrArr
    let categoryId = 0

    let attrSelectItemIndex = -1

    for (let item of attrArr[index].list) {
      if (item.selected) {
        categoryId = item.id
        attrSelectItemIndex = attrArr[index].list.indexOf(item)
      }
    }
    attrArr[index].attrSelectItemIndex = attrSelectItemIndex

    if (attrSelectItemIndex == -1) {
      attrArr[index].isActive = false
    }
    this.btnCloseDrop();
    this.setData({
      attrArr: attrArr,
      'queryParam.categoryId': parseInt(categoryId)
    })

    this.resetSearchQueryParam()
    this.searchProductList()
  },
  //下拉列表点击重置
  onClickDropBtnReset(e) {
    let attrArr = this.data.attrArr
    let attrIndex = e.currentTarget.dataset.index;

    for (let i = 0; i < attrArr[attrIndex].list.length; i++) {
      attrArr[attrIndex].list[i].selected = false
    }
    this.setData({
      attrArr: attrArr
    })
  },
  btnCloseDrop() {
    this.setData({
      scrollTop: 0,
      dropScreenShow: false
    })
  },
  closeDropdownList: function () {
    if (this.data.selectH > 0) {
      this.setData({
        selectH: 0
      })
    }
  },
  showDropdownList: function () {
    this.setData({
      selectH: 246,
      tabIndex: 0
    })
  },
  hideDropdownList: function () {
    this.setData({
      selectH: 0
    })
  },
  dropdownItem: function (e) {
    let index = e.currentTarget.dataset.index;
    let sortType = e.currentTarget.dataset.sorttype;
    let arr = this.data.dropdownList;
    for (let i = 0; i < arr.length; i++) {
      if (i === index) {
        arr[i].selected = true;
      } else {
        arr[i].selected = false;
      }
    }

    this.setData({
      'queryParam.sortType': sortType
    })
    this.setData({
      dropdownList: arr,
      selectedName: index == 0 ? '综合' : '价格',
      selectH: 0
    })

    this.resetSearchQueryParam()
    this.searchProductList()
  },
  screen: function (e) {
    let index = e.currentTarget.dataset.index;

    if (index == 0) {
      if (this.data.selectH > 0) {
        this.closeDropdownList()
      } else {
        this.showDropdownList();
      }
      return
    }

    if (index == 1 && this.data.queryParam.sortType != 3) {//按销量排序
      this.closeDropdownList()
      this.setData({
        tabIndex: 1,
        'queryParam.sortType': 3
      })
      this.resetSearchQueryParam()
      this.searchProductList()
      return
    }

    if (index == 2 && this.data.queryParam.sortType != 11) {//按距离排序
      this.closeDropdownList()
      this.setData({
        tabIndex: 2,
        'queryParam.sortType': 11
      })
      this.resetSearchQueryParam()
      this.searchProductList()
      return
    }

    if (index == 3) {
      this.closeDropdownList()
      this.setData({
        isList: !this.data.isList
      })
      return
    }

    if (index == 4) {
      this.closeDropdownList()
      this.setData({
        drawer: true
      })
      return
    }
  },
  closeDrawer: function () {
    this.setData({
      drawer: false
    })
  },
  back: function () {
    if (this.data.drawer) {
      this.closeDrawer()
    } else {
      let arrPages = getCurrentPages()
      if (arrPages.length == 1) {
        wx.switchTab({
          url: "/pages/home/index"
        })
      } else {
        wx.navigateBack()
      }
    }
  },
  search: function () {
    wx.navigateTo({
      url: '/pages/newsSearch/index'
    })
  },
  showDetail(e) {
    let guid = e.currentTarget.dataset.guid
    wx.navigateTo({
      url: '/pages/productDetail/index?guid=' + guid
    })
  },
  resetSearchQueryParam() {
    this.setData({
      'pageEnd': false,
      'queryParam.page': 1,
      goods: []
    })
  },
  searchProductList() {
    const that = this
    if (that.data.queryParam.lat == 0 || that.data.queryParam.lon == 0) {
      let location = wx.getStorageSync('location')
      if (location == null) {
        app.getLocationInfo()
      }
      that.setData({ 'queryParam.lat': parseFloat(location.lat), 'queryParam.lon': parseFloat(location.lon) })
    }
    app.httpPost('mer/list/search', that.data.queryParam).then(res => {
      if (res.data == null || res.data.length <= 0) {
        that.setData({ 'pageEnd': true })
        return
      }
      let list = this.data.goods
      if (res.data.length < that.data.queryParam.limit) {
        that.setData({ 'pageEnd': true })
      }

      if (that.data.queryParam.page > 1) {
        list.push(...res.data)
      } else {
        list = res.data
      }
      that.setData({
        goods: list
      })
      if (res.data.length < 10) {
        that.setData({ 'pageEnd': true })
      }
    })
  },
  getConfigDataList: function () {
    const that = this
    app.httpGet('product/list/config', that.data.queryParam).then(res => {
      if (res && res.data) {
        that.setData({
          attrArr: res.data.attrArr
        })
      }
    })
  },
  onLoad: function (options) {
    let obj = wx.getMenuButtonBoundingClientRect();
    this.setData({
      width: obj.left,
      height: obj.top + obj.height + 8,
      inputTop: obj.top + (obj.height - 30) / 2,
      arrowTop: obj.top + (obj.height - 32) / 2,
      'queryParam.text': options.searchKey || "",
      'queryParam.categoryId': parseInt(options.categoryId) || 0,
    }, () => {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            //略小，避免误差带来的影响
            dropScreenH: this.data.height * 750 / res.windowWidth + 186,
            drawerH: res.windowHeight - res.windowWidth / 750 * 100 - this.data.height
          })
        }
      })
    });

    this.searchProductList()
    this.getConfigDataList()
  },
})