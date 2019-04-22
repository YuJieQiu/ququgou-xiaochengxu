const app = getApp()
const {appUtils, appValidate} = require('../../utils/util.js');
const pageStart = 1; 
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const mapInstance = new QQMapWX({key: app.mapKey});
let mapContext = null;

Page({
    data: {
       
    },
     
    onLoad(options) {
        wx.getLocation({
            type: 'wgs84',
            success(res) {
              const latitude = res.latitude
              const longitude = res.longitude
              const speed = res.speed
              const accuracy = res.accuracy

              mapInstance.reverseGeocoder({
                location: {
                    latitude: latitude,
                    longitude: longitude
                },
                success: function (res) {
                    console.log(JSON.stringify(res));
                    let province = res.result.ad_info.province
                    let city = res.result.ad_info.city
                    console.log(JSON.stringify(city));
                    console.log(JSON.stringify(province));
                  },
                  fail: function (res) {
                    console.log(res);
                  },
                  complete: function (res) {
                    // console.log(res);
                  }
            });  

              console.log(res)
        
              console.log(latitude)
              console.log(longitude)
              console.log(speed)
              console.log(accuracy)
            }
          })
    }
})

