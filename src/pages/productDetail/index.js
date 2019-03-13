const app = getApp()
const {appUtils, appValidate} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: { 
        tabs:[],
        products:[],
        guid:"",
        show:false,
        selectSku:{
            id:0,
            image:"",
            price:0,
        }
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
    getProductInfo(guid){
        app.httpGet('shop/product/detail?guid='+guid).then((res) => {
            if(res && res.data) {
                this.setData({
                    products: res.data
                });
                console.log(res.data)
            }
        });
    },
    onClickIcon() {
        Toast('点击图标');
    },
    onClickButton() {
      console.log("点击立即购买按钮")
      this.setData({ show:true}); 
    },
    onClose(){
        this.setData({ show:false}); 
    },
    onPullDownRefresh() {
        //this.getData('refresh', pageStart);
    },
    onSkuSelectConfirm(e){
        this.setData({ show:false}); 
    },
    onSelectSku(e){
        let sku=e.currentTarget.dataset.sku;
       console.log(sku.image.url)
        this.setData({ selectSku:{
            id:sku.id, 
            image:sku.image[0].url,
            price:sku.price,
        }}); 
        //console.log(e.currentTarget.dataset.sku)
        //console.log(this.createSelectorQuery())
    },
    onReachBottom() {
        //this.getData('more', this.data.page);
    },
    onLoad(options) { 
      this.data.guid = options.guid;
      this.getProductInfo(options.guid)
    //    console.log(options.guid)
    }
})

