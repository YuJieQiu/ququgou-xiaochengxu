const app = getApp()
Page({
  data: {
    isIPX: app.globalData.isIPX,
    tabs: [],
    product: {},
    active: 0,
    guid: '',
    show: false,
    buyNow: false,
    addCart: false,
    cartCount: 0,
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
    attrInfo: [],
    refresh: false
  },
  changeIndicatorDots(e) {
    this.setData({
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay(e) {
    this.setData({
      autoplay: !this.data.autoplay
    })
  },
  intervalChange(e) {
    this.setData({
      interval: e.detail.value
    })
  },
  durationChange(e) {
    this.setData({
      duration: e.detail.value
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
  onClickIcon() {
    Toast('点击图标')
  },
  onClickButton() {
    this.setData({ show: true })
  },
  onClose() {
    this.setData({ show: false })
  },
  onSkuSelectConfirm(e) {
    this.setData({ show: false })
    if (this.data.addCart) {
      this.onClickAddShopCart(e)
    } else if (this.data.buyNow) {
      //到结算页面
      this.navigateToOrderSettlement()
    }
  },
  //选择规格
  onSelectSku(e) {
    const that = this

    if (this.data.selectSku.checkAll) {
      return
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
          'selectSku.number': 1
        })
        break
      }
    }
  },
  //取消选择规格
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
      // for (var key of Object.keys(sku.propPath)) {
      //   if (key == pid && sku.propPath[key] == vid) {
      //     existPid = true
      //     existVid = true
      //     break
      //   }
      // }

      if (_exist_vid && _exist_aid) {
        for (var av of sku.attributeInfo) {
          if (this.data.selectSku.aids.indexOf(parseInt(av.aid)) === -1) {
            _new_vids.push(parseInt(av.aid))
          }
        }

        // for (var key of Object.keys(sku.propPath)) {
        //   if (this.data.selectSku.pids.indexOf(parseInt(key)) === -1) {
        //     newVids.push(parseInt(sku.propPath[key]))
        //   }
        // }
      }
    }

    this.setData({
      attrInfo: newVids
    })
  },
  onSkuNumberChange(e) {
    this.setData({
      'selectSku.number': e.detail
    })
  },
  onSkuNumberOverlimit(e) {
    console.log(e.detail)
  },
  onReachBottom() {
    //this.getData('more', this.data.page);
  },
  //Add cart
  onClickAddShopCart(e) {
    let that = this
    if (this.data.selectSku.id <= 0) {
      this.setData({
        show: true,
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
      console.log(res)
      if (res.code == 200) {
        that.setData({
          cartCount: parseInt(that.data.cartCount) + parseInt(that.data.selectSku.number)
        })
      }
    })
  },
  //nuy now
  onClickBuyNow(e) {
    if (this.data.selectSku.id <= 0) {
      this.setData({
        show: true,
        buyNow: true,
        addCart: false
      })
      return
    }
    this.navigateToOrderSettlement()
  },
  //Refresh
  onPullDownRefresh() {
    this.getProductInfo()
  },
  onShareAppMessage22() {
    console.log('123')
    let that = this
    wx.shareAppMessage({ title: '', imageUrl: '', query: '', imageUrlId: '' })
  },
  //分享
  onShareAppMessage() {
    let that = this
    wx.onShareAppMessage(() => {
      return {
        title: that.data.product.name,
        imageUrl: that.data.product.resources[0].url // 图片 URL
      }
    })
  },
  onShow(o) {
    console.log(this.data.refresh)
    if (this.data.refresh) {
      this.setData({
        refresh: false
      })
      this.getProductInfo()
    }
  },
  onLoad(options) {
    console.log("onload")
    if (options != null && options.guid != "") {
      this.setData({
        guid: options.guid
      })
      this.getProductInfo()
    }
    //this.getProductInfo()
  },
  navigateToOrderSettlement: function () {
    if (this.data.selectSku.id <= 0) {
      return
    }
    //到结算页面
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
  }
})
