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
    banner: [],
    bannerIndex: 0,
    topMenu: [{
      icon: "home",
      text: "首页",
      size: 23,
      badge: 0,
      type: 'switchTab',
      url: "/pages/home/index",
    }, {
      icon: "people",
      text: "我的",
      size: 26,
      badge: 0,
      type: 'switchTab',
      url: "/pages/profile/index",
    }, {
      icon: "cart",
      text: "购物车",
      size: 23,
      badge: 0,
      type: 'switchTab',
      url: "/pages/shopCart/index",
    }, {
      icon: "order",
      text: "订单",
      size: 26,
      badge: 0,
      type: '',
      url: "/pages/orderList/index",
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
    cartCount: 0,
    refresh: false
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
    let arrPages = getCurrentPages()
    if (arrPages.length == 1) {
      wx.switchTab({
        url: "/pages/home/index"
      })
    } else {
      wx.navigateBack()
    }
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
    var that = this
    let data={
      productCode:that.data.guid
    }
    if(!this.data.product.collected){
        app.httpPost('shop/collection/add',data).then(res => {
          if(res.code==200){
            this.setData({
              'product.collected': true
            })
          }
      })
    }else{
      app.httpPost('shop/collection/remove',data).then(res => {
        if(res.code==200){
          this.setData({
            'product.collected': false
          })
        }
    })
    }
  },
  common: function (e) {
    let item = e.currentTarget.dataset.item
    if (item.url != "") {
      if (item.type == "switchTab") {
        wx.switchTab({
          url: item.url
        })
      } else {
        wx.navigateTo({
          url: item.url
        })
      }
    }
  },
  submit() {
    this.setData({
      popupShow: false
    })
  },
  getProductInfo() {
    var that = this
    app.httpGet('shop/product/detail?guid=' + that.data.guid).then(res => {
      wx.stopPullDownRefresh()
      if (res && res.data) {
        let data = res.data
        let banner = that.data.banner
        data.resources.forEach(element => {
          banner.push(element.url)
        });

        that.setData({
          product: data,
          banner: banner
        })

        if (data.isSingle) {

          let sku = data.skuInfo[0]
          let selectSku = {
            id: sku.id,
            number: 1,
            price: sku.price,
            stock: sku.stock,
            attributeInfo: sku.attributeInfo
          }

          selectSku.image = data.resources[0].url
          that.setData({
            'selectSku': selectSku
          })
          console.log(selectSku)
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
        merName: this.data.product.merName,
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
  onShow() {
    if (this.data.refresh) {
      this.getProductInfo()
      this.setData({
        refresh: false
      })
    }
  },
  onLoad(options) {
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