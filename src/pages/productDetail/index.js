const app = getApp()
const {appUtils, appValidate} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: { 
        tabs:[],
        products:[],
        guid:"",
        show:false,
        buyNow:false,
        selectSku:{
            id:0,
            image:"",
            price:0,
            name: "",
            stock: 0,
            pids:[],
            vids:[],
            vidNames: [],
            pidNames: [],
            checkAll: false,
            number: 0,
            attrNames: []
        },

        attrInfo:[]
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
      this.setData({ "show":true}); 
    },
    onClose(){
        this.setData({ "show":false}); 
    },
    onPullDownRefresh() {
        //this.getData('refresh', pageStart);
    },
    onSkuSelectConfirm(e){
        this.setData({ "show":false});
        console.log(this.data.buyNow)
        if(this.data.buyNow==true){
            //到结算页面
            this.navigateToOrderSettlement()
        } 
    },
    onSelectSku(e){
        
        if(this.data.selectSku.checkAll){
            return
        }

        //let sku=e.currentTarget.dataset.sku;
        let pid=e.currentTarget.dataset.pid;
        let vid=e.currentTarget.dataset.vid; 
        let pidName=e.currentTarget.dataset.pidname; 
        let vidName=e.currentTarget.dataset.vidname; 
        // this.data.selectSku.pids.push(pid);
        // this.data.selectSku.vids.push(vid);
        let pids=this.data.selectSku.pids;
        let vids=this.data.selectSku.vids;

        let pidNames=this.data.selectSku.pidNames;
        let vidNames=this.data.selectSku.vidNames;

        pidNames.push(pidName);
        vidNames.push(vidName);

        pids.push(pid);
        vids.push(vid);

        console.log()

        this.setData({
            'selectSku.pids':pids,
            'selectSku.vids':vids,
            'selectSku.pidNames':pidNames,
            'selectSku.vidNames':vidNames
        });

        // let aaa={
        //     2:4,
        //     5:6,
        //     1:3
        // };
        // console.log(aaa.length);
        // let arr=Object.keys(aaa)
        // console.log(arr)

        // console.log( this.data.selectSku.pids)
        //console.log(this.data.vidss.indexOf(-1))
       
        let newVids=[]
        for (var sku of  this.data.products.skuInfo) {  
            let existPid=false;
            let existVid=false;
            
            for(var key of Object.keys(sku.propPath)){
                if(key==pid&&sku.propPath[key]==vid){
                    existPid=true;
                    existVid=true;
                    break;
                }
            }

            if(existPid&&existVid){
                for(var key of Object.keys(sku.propPath)){
                    if(this.data.selectSku.pids.indexOf(parseInt(key))===-1){
                        newVids.push(parseInt(sku.propPath[key]));
                    }
                   
                }
            }

            if(pids.length===Object.keys(sku.propPath).length){
                this.setData({ 
                    'selectSku.checkAll':true
                }); 
            }
        }   
        
        this.setData({ 
            'attrInfo':newVids
        }); 

       
        if(this.data.selectSku.checkAll==true){
            let attrNames=""
            for (var sku of  this.data.products.skuInfo) {  
                let exist=true;
                for(var i of this.data.selectSku.pids){
                   
                    if(Object.keys(sku.propPath).indexOf(i.toString())===-1){
                        exist=false;
                        break;
                    }
                }
              
                if(!exist){
                    continue;
                }
                for(var i of this.data.selectSku.vids){
                    if(Object.values(sku.propPath).indexOf(i)===-1){
                        exist=false;
                        break;
                    }
                }
               
                if(!exist){
                    continue;
                }
               
                this.setData({ 
                    'selectSku.id': sku.skuId,
                    'selectSku.image': sku.skuImage[0].url,
                    'selectSku.price': sku.price,
                    'selectSku.name': sku.skuName,
                    'selectSku.stock': sku.stock,
                    'selectSku.number': 1
                }); 
                break;
            }
            console.log(this.data.selectSku);
        }

        // console.log(this.data.attrInfo);
        // console.log(this.data.selectSku.checkAll);
        // console.log(this.data.selectSku.pids);
         //console.log(newVids)
 // for(var p of this.data.selectSku.pids){
                    //     if(key!=p){
                    //         console.log("p:"+p)
                    //         console.log("p1:"+key)
                    //         console.log("sku:"+sku.propPath[key])
                    //         //newVids.push(sku.propPath[key])
                    //     }
                    // }
             // console.log(this.data.selectSku.pids)
                    // console.log(this.data.selectSku.pids.indexOf(1))
            // let aa=this.data.attrInfo;
            // aa.push(...vids)
            // this.setData({
            //     attrInfo:aa
            // }); 
            // for(var value of Object.values(sku.propPath)){
            //     if(value==vid){
            //         existVid=true;
            //         continue;
            //     }
            // }
            
            // if(existPid&&existVid){
            //     console.log(vids)
            //     // let aa=this.data.attrInfo;
            //     // aa.push(...vids)
            //     // this.setData({
            //     //     attrInfo:aa
            //     // }); 
            //     // console.log(this.data.attrInfo)
            // }

            // for(var value of Object.values(sku.propPath)){
            //     if(value==vid){
            //         existVid=true;
            //     }
            //     for(var i of this.data.selectSku.pids){
            //         if(value!=sku.propPath[i]){
            //             vids.push(value)
            //         }
            //     }
            // }
            // console.log(existVid);
            // console.log(existPid);
          
        
              // console.log(value.keys(value));
                // console.log(value.values(value));
            // console.log(sku);  
            // console.log(Object.keys(sku.propPath));
            // console.log(Object.values(sku.propPath));
        // this.setData({ selectSku:{
        //     id:sku.id, 
        //     image:sku.image[0].url,
        //     price:sku.price,
        // }}); 
        //console.log(e.currentTarget.dataset.sku)
        //console.log(this.createSelectorQuery())
    },
    onCancelSku(e){
        let pid=e.currentTarget.dataset.pid;
        let vid=e.currentTarget.dataset.vid; 

        let pids=this.data.selectSku.pids;
        let vids=this.data.selectSku.vids;

        let pidName=e.currentTarget.dataset.pidname; 
        let vidName=e.currentTarget.dataset.vidname; 

        let pidNames=this.data.selectSku.pidNames;
        let vidNames=this.data.selectSku.vidNames;

        if(this.data.selectSku.vids.indexOf(vid)===-1){
            return
        }
        
        pids.splice(pids.findIndex(item => item === pid), 1)
        vids.splice(vids.findIndex(item => item === vid), 1)

        pidNames.splice(pidNames.findIndex(item => item === pidName), 1)
        vidNames.splice(vidNames.findIndex(item => item === vidName), 1)
        
        this.setData({
            selectSku:{
                pids: pids,
                vids: vids,
                pidNames: pidNames,
                vidNames: vidNames,
                checkAll: false,
                name: "",
                id: 0,
                image: "",
                price: 0,
                stock: 0,
            }
        });
 
        if(this.data.selectSku.pids.length<=0){
            this.setData({ 
                attrInfo:[]
            });   
            return
        }
        
        let newVids=[]
        for (var sku of  this.data.products.skuInfo) {  
            let existPid=false;
            let existVid=false;
          
            for(var key of Object.keys(sku.propPath)){
                if(key==pid&&sku.propPath[key]==vid){
                    existPid=true;
                    existVid=true;
                    break;
                }
            }

            if(existPid&&existVid){
                for(var key of Object.keys(sku.propPath)){
                    if(this.data.selectSku.pids.indexOf(parseInt(key))===-1){
                        newVids.push(parseInt(sku.propPath[key]));
                    }
                }
            }
        }   
        
        this.setData({ 
            attrInfo:newVids
        }); 
        
    },
    onSkuNumberChange(e){
        this.setData({ 
            'selectSku.number': e.detail,
        });
    },
    onSkuNumberOverlimit(e){
        console.log(e.detail)
    },
    onReachBottom() {
        //this.getData('more', this.data.page);
    },
    onClickBuyNow(e){
        console.log(this.data.selectSku.id)
        
        if(this.data.selectSku.id<=0){
            console.log("onClickBuyNow");
            this.setData({
                'show': true,
                'buyNow':true
            })
            return
        }
        
        this.navigateToOrderSettlement()
    },
    onLoad(options) { 
      this.data.guid = options.guid;
      this.getProductInfo(options.guid)
    //    console.log(options.guid)
    },
    navigateToOrderSettlement:function(){
        //到结算页面
        let data={
            merId:this.data.products.merId,
            skuList:[
                {
                    productNo:this.data.products.guid,
                    productName:this.data.products.name,
                    id:this.data.selectSku.id,
                    name:this.data.selectSku.name,
                    price:this.data.selectSku.price,
                    image:this.data.selectSku.image,
                    number: this.data.selectSku.number,
                    vidNames: this.data.selectSku.vidNames,
                    pidNames: this.data.selectSku.pidNames
                }
            ]
        }

        let json=JSON.stringify(data)
        console.log(json)
        wx.navigateTo({
            url: "/pages/orderSettlement/index?jsonData="+json
        })  
    }
})

