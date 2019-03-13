const app = getApp()
const {appUtils, appValidate} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: {
        imgUrls: [],
        tabs:[]
    },
   
    getBannerList() {
        app.httpGet('home/banner/getList').then((res) => {
            if(res && res.data) {
                this.setData({
                    imgUrls: res.data
                });
            }
        });
    },
    getHomeData(){
        app.httpGet('homeProductConfig/getConfigProductList').then((res) => {
            if(res && res.data) {
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
            url: '/pages/productDetail/index?guid='+guid
        });
    },
    onPullDownRefresh() {
        //this.getData('refresh', pageStart);
    },
    onReachBottom() {
        //this.getData('more', this.data.page);
    },
    onLoad(options) { 
       this.getBannerList(); 
       this.getHomeData(); 
    }
})

