
const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js');
const pageStart = 1;
import Toast from '../../dist/toast/toast';
Page({
    data: {
        order: {},
        adderss: {},
        products: []
    },
    
    onShow: function () {

    },
    getDataInfo: function(no){
        app.httpGet('order/get/detail', {orderNo:no}).then((res) => {
            console.log(res)
            this.setData({
                adderss:res.data.address,
                products:res.data.products,
                order:res.data
            })
        })
    },
    onLoad(options) {
        let no="3190402111668993625"
        this.getDataInfo(no)
    }
})

