const app = getApp()
const { appUtils, appValidate } = require('../../utils/util.js');
const { area } = require('area.js');
// const area = new Area();
const QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
const mapInstance = new QQMapWX({ key: app.mapKey });
const pageStart = 1;

Page({
  data: {
    id: 0,
    radio: "1",
    areaList: {},
    region: [],
    customItem: '全部',
    username: "",
    sex: "1",
    phone: "",
    detailInfo: "",
    defult: false,
    show: false,
    errMessage: "",
    butSaveDisabled: false
  },
  onChangeSexRadio(e) {
    this.setData({
      radio: e.detail
    });
  },
  onChangeSwitchDefult(e) {
    this.setData({
      defult: e.detail
    });
  },
  onInputUsername(e) {
    this.setData({ 'username': e.detail });
  },
  onInputPhone(e) {
    this.setData({ 'phone': e.detail });
  },
  onInputDetailInfo(e) {
    this.setData({ 'detailInfo': e.detail });
  },
  onChangeRegion(e) {
    if (e.detail.code.length != 3) {
      return
    }
    this.setData({ 'region': e.detail.value });
  },
  popupMessageShow: function (message) {
    this.setData({
      'show': true,
      'errMessage': message
    });
    setTimeout(() => {
      this.setData({
        'show': false,
        'errMessage': ""
      });
    }, 2000);
  },
  onButtonSave(e) {

    if (this.data.username == "") {
      this.popupMessageShow("请输入收货人姓名")
      return
    }
    if (this.data.phone == "") {
      this.popupMessageShow("请输入收货人电话")
      return
    }
    if (this.data.region.length <= 0) {
      this.popupMessageShow("请选择收货地址")
      return
    }
    if (this.data.detailInfo == "") {
      this.popupMessageShow("请输入详细地址")
      return
    }

    let reqData = {
      id: this.data.id,
      city: this.data.region[0],
      region: this.data.region[1],
      town: this.data.region[2],
      address: this.data.detailInfo,
      phone: this.data.phone,
      name: this.data.username,
      remark: this.data.sex,
      is_default: this.data.defult,
    }

    this.setData({ 'butSaveDisabled': true });

    let arrPages = getCurrentPages()

    app.httpPost("address/save", reqData, true).then((res) => {
      let address = res.data;
      wx.navigateBack()
      // let addressList = arrPages[arrPages.length - 2].data.list;
      // addressList.push({
      //   id: address.id,
      //   city: address.city,
      //   region: address.region,
      //   town: address.town,
      //   address: address.address,
      //   username: address.name,
      //   phone: address.phone
      // })

      // wx.navigateBack({
      //   delta: arrPages.length - (arrPages.length - 1),
      //   success: res => {
      //     arrPages[arrPages.length - 2].setData({
      //       'list': addressList
      //     })
      //   },
      //   fail: function (res) {

      //   },
      //   complete: function (res) {

      //   }
      // })
    });

    this.setData({ 'butSaveDisabled': false });

  },
  getData: function (id) {
    const that = this
    app.httpGet('address/user/get', { id: id }).then(res => {
      let data = res.data

      that.setData({
        'id': data.id,
        'region[0]': data.city,
        'region[1]': data.region,
        'region[2]': data.town,
        'detailInfo': data.address,
        'phone': data.phone,
        'username': data.name,
        'sex': data.remark,
        'defult': data.is_default,
      })
    })
  },
  onClosePopup() {
    this.setData({
      'show': false,
      'errMessage': ""
    });
  },
  onChickADD() {
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
  },
  onLoad(options) {
    let id = options.id
    if (id != null && id > 0) {
      this.getData(id)
    }

    let areaList = area.areaList();

    this.setData({
      areaList: areaList
    })

  }
})

