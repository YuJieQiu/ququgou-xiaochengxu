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
    goods: [],
    isShow: false,
    goodsShow: false,
    allColor: true,
    selectCategoryId: 0,
    selectCategoryTowId: 0,
    selectCategoryChildren: [],
    categoryList: [
      {
        "id": 1,
        "pid": 0,
        "text": "全部",
        "sort": 0,
        "remark": "",
        "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
        "children": [
          {
            "id": 2,
            "pid": 1,
            "text": "水果",
            "sort": 0,
            "remark": "",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          },
          {
            "id": 3,
            "pid": 1,
            "text": "汽车",
            "sort": 0,
            "remark": "测试",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          }
        ]
      },
      {
        "id": 4,
        "pid": 0,
        "text": "测试1",
        "sort": 0,
        "remark": "测试",
        "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
        "children": [
          {
            "id": 7,
            "pid": 4,
            "text": "水果",
            "sort": 0,
            "remark": "",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          },
          {
            "id": 8,
            "pid": 4,
            "text": "水果",
            "sort": 0,
            "remark": "",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          },
          {
            "id": 9,
            "pid": 4,
            "text": "水果",
            "sort": 0,
            "remark": "",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          }
        ]
      },
      {
        "id": 5,
        "pid": 0,
        "text": "测试2",
        "sort": 0,
        "remark": "测试",
        "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
        "children": [
          {
            "id": 10,
            "pid": 5,
            "text": "汽车",
            "sort": 0,
            "remark": "测试",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          },
          {
            "id": 11,
            "pid": 5,
            "text": "汽车",
            "sort": 0,
            "remark": "测试",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          },
          {
            "id": 12,
            "pid": 5,
            "text": "汽车",
            "sort": 0,
            "remark": "测试",
            "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
            "children": null
          }
        ]
      },
      {
        "id": 6,
        "pid": 0,
        "text": "测试3",
        "sort": 0,
        "remark": "测试",
        "img": "http://qiniu.media.q.dfocuspace.cn/static/images/d3b0531055ed452daac8664d6fdbdab1.jpg",
        "children": null
      }
    ],
    listtwos: [{
      "catId": 67,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/80edae5d-19f8-490d-8e78-31769adf5505.jpg",
      "isLeaf": false,
      "catName": "品类三",
      "sort": 2,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    }],
    listthrees: [{
      "catId": 67,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/80edae5d-19f8-490d-8e78-31769adf5505.jpg",
      "isLeaf": false,
      "catName": "品类三",
      "sort": 2,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    }],
    listfirsts: [{
      "catId": 65,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [
        {
          "catId": 67,
          "busiId": 10001,
          "busiName": "韩妮采旗舰店",
          "pid": 0,
          "pidList": [

          ],
          "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/80edae5d-19f8-490d-8e78-31769adf5505.jpg",
          "isLeaf": false,
          "catName": "品类三",
          "sort": 2,
          "statusDesc": "激活",
          "status": 1,
          "level": 0
        },
      ],
      "catPath": "https://img.love-bears.cn/img/n29/tfs/2018/11/29/8c654fe5-ef60-4e64-b3bf-5046c76d7f75.jpg",
      "isLeaf": false,
      "catName": "新客专享",
      "sort": 1,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    },
    {
      "catId": 66,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [
        {
          "catId": 67,
          "busiId": 10001,
          "busiName": "韩妮采旗舰店",
          "pid": 0,
          "pidList": [

          ],
          "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/80edae5d-19f8-490d-8e78-31769adf5505.jpg",
          "isLeaf": false,
          "catName": "品类三",
          "sort": 2,
          "statusDesc": "激活",
          "status": 1,
          "level": 0
        },
      ],
      "catPath": "https://img.love-bears.cn/img/n1/tfs/2018/11/01/8c8b5104-1d54-4643-8666-b2016ac6d736.jpg",
      "isLeaf": false,
      "catName": "品类二",
      "sort": 1,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    },
    {
      "catId": 67,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/80edae5d-19f8-490d-8e78-31769adf5505.jpg",
      "isLeaf": false,
      "catName": "品类三",
      "sort": 2,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    },
    {
      "catId": 68,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n25/tfs/2018/09/25/5a2ba1f6-9bf0-47c8-a990-51c935611291.jpg",
      "isLeaf": false,
      "catName": "品类四",
      "sort": 3,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    },
    {
      "catId": 69,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n15/tfs/2019/07/15/c1f09d4e-7f4c-474a-bb6f-95cb9e8804ad.jpeg",
      "isLeaf": false,
      "catName": "品类五",
      "sort": 5,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    },
    {
      "catId": 70,
      "busiId": 10001,
      "busiName": "韩妮采旗舰店",
      "pid": 0,
      "pidList": [

      ],
      "catPath": "https://img.love-bears.cn/img/n15/tfs/2019/07/15/6d9ac241-f159-4d5a-966a-9006aaab0f47.jpeg",
      "isLeaf": false,
      "catName": "皇家美素佳儿",
      "sort": 6,
      "statusDesc": "激活",
      "status": 1,
      "level": 0
    }]
  },
  cationLeft: function (e) {
    const that = this,
      _dataset = e.currentTarget.dataset,
      _index = _dataset.index,
      _item = _dataset.item;

    that.setData({
      selectCategoryId: _item.id,
      selectCategoryChildren: _item.children
    });
  },
  cationCenter: function (e) {
    const that = this,
      _dataset = e.currentTarget.dataset,
      _index = _dataset.index,
      _item = _dataset.item;

    that.setData({
      selectCategoryTowId: _item.id
    });
  },
  classificationBgc: function () {
    const that = this;
    that.setData({
      goodsShow: that.data.goodsShow
    });

    that.classification();
  },
  classification: function () {
    // 分类切换
    const _self = this;
    let _goodsShow = !_self.data.goodsShow;
    if (_goodsShow) {
      let data = {
        pid: 0,
      };
      // app.request.post('/Front/Cat/GetCat', data).then(function (res) {
      //   if (_self.data.listfirsts.length === 0) {
      //     res.data.forEach(function (item) {
      //       item.cationShow = false;
      //     });
      //     _self.setData({
      //       listfirsts: res.data
      //     });
      //   }
      // });
      _self.setData({
        'classification.styleShow': true,
        cationEdit: true
      });
      setTimeout(function () {
        _self.setData({
          'classification.styleRight': 0,
          goodsShow: _goodsShow,
          noScroll: true
        });
      });
    } else {
      _self.setData({
        'classification.styleRight': '-100%',
        noScroll: false,

      });
      setTimeout(function () {
        _self.setData({
          'classification.styleShow': false,
          goodsShow: _goodsShow,
          cationEdit: false
        });
      }, 200);
    }
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
    //this.getMerProductList()
  }
})
