const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js')
const util = require('../../utils/util.js')
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js')
const qqmapsdk = new QQMapWX({ key: app.mapKey })
Page({
  data: {
    height: 64, //header高度
    top: 0, //标题图标距离顶部距离
    scrollH: 0, //滚动总高度
    opcity: 0,
    iconOpcity: 0.5,
    banner: [
      "https://www.thorui.cn/img/product/11.jpg",
      "https://www.thorui.cn/img/product/2.png",
      "https://www.thorui.cn/img/product/33.jpg",
      "https://www.thorui.cn/img/product/4.png",
      "https://www.thorui.cn/img/product/55.jpg",
      "https://www.thorui.cn/img/product/6.png",
      "https://www.thorui.cn/img/product/7.jpg",
      "https://www.thorui.cn/img/product/8.jpg"
    ],
    bannerIndex: 0,
    topMenu: [{
      icon: "message",
      text: "消息",
      size: 26,
      badge: 3
    }, {
      icon: "home",
      text: "首页",
      size: 23,
      badge: 0
    }, {
      icon: "people",
      text: "我的",
      size: 26,
      badge: 0
    }, {
      icon: "cart",
      text: "购物车",
      size: 23,
      badge: 2
    }, {
      icon: "kefu",
      text: "客服小蜜",
      size: 26,
      badge: 0
    }, {
      icon: "feedback",
      text: "我要反馈",
      size: 23,
      badge: 0
    }, {
      icon: "share",
      text: "分享",
      size: 26,
      badge: 0
    }],
    menuShow: false,
    popupShow: false,
    value: 1,
    collected: false,
    selectSku: {
      id: 0,
      image: '',
      price: 0,
      name: '',
      stock: 0,
      aids: [],
      vids: [],
      vnames: [],
      anames: [],
      checkAll: false,
      number: 1
    },
    cartCount: 0
  },

  bannerChange: function (e) {
    this.setData({
      bannerIndex: e.detail.current
    })
  },
  previewImage: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.banner[index],
      urls: this.data.banner
    })
  },
  //页面滚动执行方式
  onPageScroll(e) {
    let scroll = e.scrollTop <= 0 ? 0 : e.scrollTop;
    let opcity = scroll / this.data.scrollH;
    if (this.data.opcity >= 1 && opcity >= 1) {
      return;
    }
    this.setData({
      opcity: opcity,
      iconOpcity: 0.5 * (1 - opcity < 0 ? 0 : 1 - opcity)
    })
  },
  back: function () {
    wx.navigateBack()
  },
  openMenu: function () {
    this.setData({
      menuShow: true
    })
  },
  closeMenu: function () {
    this.setData({
      menuShow: false
    })
  },
  showPopup: function () {
    this.setData({
      popupShow: true
    })
  },
  hidePopup: function () {
    this.setData({
      popupShow: false
    })
  },
  change: function (e) {
    this.setData({
      value: e.detail.value
    })
  },
  collecting: function () {
    this.setData({
      collected: !this.data.collected
    })
  },
  common: function () {
    util.toast("功能开发中~")
  },
  submit() {
    this.setData({
      popupShow: false
    })
    wx.navigateTo({
      url: '../mall-extend/submitOrder/submitOrder'
    })
  },
  getProductInfo() {
    var that = this
    app.httpGet('shop/product/detail?guid=' + that.data.guid).then(res => {
      console.log(res)
      wx.stopPullDownRefresh()
      if (res && res.data) {
        let data = res.data
        that.setData({
          product: data
        })

        if (data.isSingle) {
          let selectSku = data.skuInfo[0]
          selectSku.image = data.resources[0].url
          selectSku.number = 1
          that.setData({
            selectSku: selectSku
          })
        }
      }
    })
  },
  onSkuNumberChange(e) {
    this.setData({
      'selectSku.number': e.detail.value
    })
  },
  //Add cart
  onClickAddShopCart(e) {
    let that = this
    if (this.data.selectSku.id <= 0) {
      this.setData({
        popupShow: true,
        buyNow: false,
        addCart: true
      })
      return
    }

    let data = {
      merId: this.data.product.merId,
      productNo: this.data.product.guid,
      productSkuId: this.data.selectSku.id,
      number: parseInt(this.data.selectSku.number),
      price: this.data.selectSku.price
    }

    app.httpPost('shop/cart/add', data).then(res => {
      if (res.code == 200) {
        that.setData({
          cartCount: parseInt(that.data.cartCount) + parseInt(that.data.selectSku.number)
        })
      }
      that.setData({
        popupShow: false
      })
    })
  },
  //nuy now
  onClickBuyNow(e) {
    if (this.data.selectSku.id <= 0) {
      this.setData({
        popupShow: true,
        buyNow: true,
        addCart: false
      })
      return
    }
    this.setData({
      popupShow: false
    })
    this.navigateToOrderSettlement()
  },
  //到结算页面
  navigateToOrderSettlement: function () {
    if (this.data.selectSku.id <= 0) {
      return
    }

    let data = [
      {
        merId: this.data.product.merId,
        skuList: [
          {
            productNo: this.data.product.guid,
            productName: this.data.product.name,
            id: this.data.selectSku.id,
            name: this.data.selectSku.name,
            price: this.data.selectSku.price,
            image: this.data.selectSku.image,
            number: this.data.selectSku.number,
            attributeInfo: this.data.selectSku.attributeInfo,
            shopCartId: 0,
            deliveryTypes: this.data.product.deliveryTypes,
          }
        ]
      }
    ]
    let json = JSON.stringify(data)
    wx.navigateTo({
      url: '/pages/orderSettlement/index?jsonData=' + json
    })
  },
  //Refresh
  onPullDownRefresh() {
    this.getProductInfo()
  },
  //选择规格
  onSelectSku(e) {
    const that = this

    if (this.data.selectSku.checkAll) {
      that.setData({
        selectSku: {
          aids: [],
          vids: [],
          anames: [],
          vnames: [],
          checkAll: false,
          name: '',
          id: 0,
          image: '',
          price: 0,
          stock: 0
        }
      })
    }

    let aid = e.currentTarget.dataset.aid
    let vid = e.currentTarget.dataset.vid
    let aname = e.currentTarget.dataset.aname
    let vname = e.currentTarget.dataset.vname

    let aids = that.data.selectSku.aids
    let vids = that.data.selectSku.vids
    let anames = that.data.selectSku.anames
    let vnames = that.data.selectSku.vnames

    anames.push(aname)
    vnames.push(vname)
    aids.push(aid)
    vids.push(vid)

    that.setData({
      'selectSku.aids': aids,
      'selectSku.vids': vids,
      'selectSku.anames': anames,
      'selectSku.vnames': vnames
    })
    let _new_vids = []
    for (var sku of this.data.product.skuInfo) {
      let _exist_aid = false
      let _exist_vid = false

      for (var _att_value of sku.attributeInfo) {
        if (_att_value.aid == aid && _att_value.vid == vid) {
          _exist_aid = true
          _exist_vid = true
          break
        }
      }

      if (_exist_aid && _exist_vid) {
        for (var _att_value of sku.attributeInfo) {
          if (
            that.data.selectSku.aids.indexOf(parseInt(_att_value.aid)) === -1
          ) {
            _new_vids.push(parseInt(_att_value.vid))
          }
        }
      }

      if (aids.length === sku.attributeInfo.length) {
        that.setData({
          'selectSku.checkAll': true
        })
      }
    }

    that.setData({
      attrInfo: _new_vids
    })

    //已选择全部sku
    if (that.data.selectSku.checkAll == true) {
      for (var sku of that.data.product.skuInfo) {
        let exist = false

        //是否存在 aid
        for (var i of that.data.selectSku.aids) {
          for (var av of sku.attributeInfo) {
            if (av.aid == i) {
              exist = true
              break
            }
          }
        }

        if (!exist) {
          continue
        }

        exist = false

        //是否存在 vid
        for (var i of this.data.selectSku.vids) {
          for (var av of sku.attributeInfo) {
            if (av.vid == i) {
              exist = true
              break
            }
          }
        }
        if (!exist) {
          continue
        }

        let img = that.data.product.resources[0].url
        if (sku.skuImage != null && sku.skuImage.url != "") {
          img = sku.skuImage.url
        }
        that.setData({
          'selectSku.id': sku.id,
          'selectSku.image': img,
          'selectSku.price': sku.price,
          'selectSku.name': sku.skuName,
          'selectSku.stock': sku.stock,
          'selectSku.number': 1,
          'selectSku.attributeInfo': sku.attributeInfo
        })
        break
      }
    }
  },
  //取消选择规格 暂时无效
  onCancelSku(e) {
    let aid = e.currentTarget.dataset.aid
    let vid = e.currentTarget.dataset.vid

    let aids = this.data.selectSku.aids
    let vids = this.data.selectSku.vids

    let aname = e.currentTarget.dataset.aname
    let vname = e.currentTarget.dataset.vname

    let anames = this.data.selectSku.anames
    let vnames = this.data.selectSku.vnames

    if (this.data.selectSku.vids.indexOf(vid) === -1) {
      return
    }

    aids.splice(aids.findIndex(item => item === aid), 1)
    vids.splice(vids.findIndex(item => item === vid), 1)

    anames.splice(anames.findIndex(item => item === aname), 1)
    vnames.splice(vnames.findIndex(item => item === vname), 1)

    this.setData({
      selectSku: {
        aids: aids,
        vids: vids,
        anames: anames,
        vnames: vnames,
        checkAll: false,
        name: '',
        id: 0,
        image: '',
        price: 0,
        stock: 0
      }
    })

    if (this.data.selectSku.aids.length <= 0) {
      this.setData({
        attrInfo: []
      })
      return
    }

    let _new_vids = []
    for (var sku of this.data.product.skuInfo) {
      let _exist_aid = false
      let _exist_vid = false

      for (var av of sku.attributeInfo) {
        if (av.aid == aid && av.vid == vid) {
          _exist_aid = true
          _exist_vid = true
          break
        }
      }

      if (_exist_vid && _exist_aid) {
        for (var av of sku.attributeInfo) {
          if (this.data.selectSku.aids.indexOf(parseInt(av.aid)) === -1) {
            _new_vids.push(parseInt(av.aid))
          }
        }
      }
    }

    this.setData({
      attrInfo: newVids
    })
  },
  onLoad(options) {
    //options.guid = "e164cd2b42f74af284ec1b258a93bcfd"
    if (options != null && options.guid != "") {
      this.setData({
        guid: options.guid
      })
      this.getProductInfo()
    }
    let obj = wx.getMenuButtonBoundingClientRect();
    this.setData({
      width: obj.left,
      height: obj.top + obj.height + 8,
      top: obj.top + (obj.height - 32) / 2
    }, () => {
      wx.getSystemInfo({
        success: (res) => {
          this.setData({
            scrollH: res.windowWidth
          })
        }
      })
    });
  }
})