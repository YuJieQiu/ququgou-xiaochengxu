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

