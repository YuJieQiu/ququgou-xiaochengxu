const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js');
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const qqmapsdk = new QQMapWX({ key: app.mapKey });
const pageStart = 1;

Page({
    data: {
        imgUrls: [],
        tabs: [],
        tlist:[1,1,2,4,5,6,7,8,9,0,1,1,2,4,5,6,7,8,9,0,1,1,2,4,5,6,7,8,9,0],
        isIPX: app.globalData.isIPX,
        ad_info:{},
        thumb:"http://qiniu.media.q.dfocuspace.cn/static/images/c427dca3e80a4fceb39e415d65f1dea3.jpg",
        title:"越南进口红心火龙果 3个装 大果 单果约450~500g 新鲜水果",
        desc:"desc",
        currency:"¥",
        price:"10.00",
        originPrice:"9.99",
        num:10,
        ifScrollY:false
    },

    getBannerList() {
        app.httpGet('home/banner/getList').then((res) => {
            if (res && res.data) {
                this.setData({
                    imgUrls: res.data
                });
            }
        });
    },
    getHomeData() {
        app.httpGet('homeProductConfig/getConfigProductList').then((res) => {
            if (res && res.data) {
                this.setData({
                    tabs: res.data
                });
            }
        });
    },
    showDetail(e) {
        console.log(e.currentTarget.dataset.guid)
        let guid = e.currentTarget.dataset.guid;

        //console.log(this.data)
        // let index = e.currentTarget.dataset;
        // let data = this.data.tabs[index];
        // console.log(index)
        // console.log(data)
        wx.navigateTo({
            url: '/pages/productDetail/index?guid=' + guid
        });
    },
    onPullDownRefresh() {
        //this.getData('refresh', pageStart);
    },
    onReachBottom() {
        //this.getData('more', this.data.page);
    },
    onPhoneClick(){
        wx.makePhoneCall({
            phoneNumber: '1340000' // 仅为示例，并非真实的电话号码
          })
    },
    onAddressClick(){
        wx.getLocation({
            type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
            success(res) {
              const latitude = res.latitude
              const longitude = res.longitude
              wx.openLocation({
                latitude,
                longitude,
                scale: 18
              })
            }
          })
        // wx.openLocation({
        //     latitude,
        //     longitude,
        //     scale: 18
        //   })
    },
    onTabsScroll(e){
        if(e.detail.isFixed==true){
            this.setData({
                'ifScrollY':true
            })
        }else{
            this.setData({
                'ifScrollY':false
            })
        }
    },
    onClickToShowDetail(e) {
        console.log(e.currentTarget.dataset.guid)
        let guid = e.currentTarget.dataset.guid;

        //console.log(this.data)
        // let index = e.currentTarget.dataset;
        // let data = this.data.tabs[index];
        // console.log(index)
        // console.log(data)
        wx.navigateTo({
            url: '/pages/productDetail/index?guid=' + guid
        });
    },
    onLoad(options) {
        // wx.getLocation({
        //     type: 'wgs84', //
        //     success(res) {
        //       const latitude = res.latitude
        //       const longitude = res.longitude
        //       const speed = res.speed
        //       const accuracy = res.accuracy

        //       console.log(res)
        //     }
        //   })
        // const _this=this

        //   wx.getLocation({
        //     type: 'wgs84',
        //     success(res) {
        //       const latitude = res.latitude
        //       const longitude = res.longitude
        //       const speed = res.speed
        //       const accuracy = res.accuracy

        //       qqmapsdk.reverseGeocoder({
        //         location: {
        //             latitude: latitude,
        //             longitude: longitude
        //         },
        //         success: function (res) {
        //             // console.log(JSON.stringify(res));
        //             // let province = res.result.ad_info.province
        //             // let city = res.result.ad_info.city
                    
        //             _this.setData({
        //                 ad_info:res.result.ad_info
        //             })
 
        //           },
        //           fail: function (res) {
        //             console.log(res);
        //           },
        //           complete: function (res) {
        //             // console.log(res);
        //           }
        //     });
        // }});
        // this.getBannerList(); 
        // this.getHomeData(); 
    }
})

