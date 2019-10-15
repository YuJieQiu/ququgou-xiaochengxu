//工具方法
const utils = {
    combineArray: function (a, b) {//合并数组
        if (a && b && a.constructor === Array && b.constructor === Array) {
            if (a.length > b.length) {
                a.push.apply(a, b);
            } else {
                b.push.apply(a, b);
            }
        } else {
            console.log('要合并的数组不存在')
        }
    },
    delMoney: function (money) {
        if (_AppCurrency === "JPY") {
            return {
                currency: _AppCurrency + _AppCurrencySymbol,
                money: parseInt(money),
                decimal: "",
                value: _AppCurrency + _AppCurrencySymbol + " " + parseInt(money)
            };

        } else {
            var sMoney = parseFloat(money).toFixed(2);

            var aMoney = sMoney.split(".");

            var integer = aMoney[0], decimal = aMoney[1];

            var value = _AppCurrency + _AppCurrencySymbol + " " + integer + "." + decimal;

            if (parseFloat(decimal) <= 0) {
                decimal = "";
                var value = _AppCurrency + _AppCurrencySymbol + " " + integer;
            }

            return {
                currency: _AppCurrency + _AppCurrencySymbol,
                money: integer,
                decimal: decimal,
                value: value
            };

        }
    },
    fixZero: function (value) {
        if (value < 10) {
            return "0" + value;
        } else {
            return value;
        }
    },
    formatDate: function (date, fullDate) {
        if (!date) {
            return "";
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        if (fullDate) {
            return [year, month, day].map(this.fixZero).join('-') + ' ' + [hour, minute, second].map(this.fixZero).join(':');
        } else {
            return [year, month, day].map(this.fixZero).join('-');
        }
    },
    formatMoney: function (money) {
        return (money || "0").toString().split("").reverse().join("").replace(/(\d{3}\B)/g, "$1,").split("").reverse().join("")
    },
    getDistance: function (dot1, dot2) { // 球面计算公式, 计算两点间距离
        let lat1 = dot1.latitude || 0, lng1 = dot1.longitude || 0, lat2 = dot2.latitude || 0, lng2 = dot2.longitude || 0;
        let rad1 = lat1 * Math.PI / 180.0;
        let rad2 = lat2 * Math.PI / 180.0;
        let a = rad1 - rad2;
        let b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
        let r = 6378137;
        return Math.round((r * 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(rad1) * Math.cos(rad2) * Math.pow(Math.sin(b / 2), 2)))))
    },
    shuffle(arr) { // 数组随机排序
        let i = arr.length;
        while (i) {
            let j = Math.floor(Math.random() * i--);
            [arr[j], arr[i]] = [arr[i], arr[j]];
        }
    },
    isNullOrEmpty: function (value) {
        //是否为空
        return (value === null || value === '' || value === undefined) ? true : false;
    },
    trim: function (value) {
        //去空格
        return value.replace(/(^\s*)|(\s*$)/g, "");
    },
    isMobile: function (value) {
        //是否为手机号
        return /^(?:13\d|14\d|15\d|16\d|17\d|18\d|19\d)\d{5}(\d{3}|\*{3})$/.test(value);
    },
    isFloat: function (value) {
        //金额，只允许保留两位小数
        return /^([0-9]*[.]?[0-9])[0-9]{0,1}$/.test(value);
    },
    isNum: function (value) {
        //是否全为数字
        return /^[0-9]+$/.test(value);
    },
    formatNum: function (num) {
        //格式化手机号码
        if (utils.isMobile(num)) {
            num = num.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
        }
        return num;
    },
    interfaceUrl: function () {
        //接口地址
        return "http://172.19.11.185:12000/";
    },
    toast: function (text, duration, success) {
        wx.showToast({
            title: text,
            icon: success ? 'success' : 'none',
            duration: duration || 2000
        })
    },
    preventMultiple: function (fn, gapTime) {
        if (gapTime == null || gapTime == undefined) {
            gapTime = 200;
        }
        let lastTime = null;
        return function () {
            let now = +new Date();
            if (!lastTime || now - lastTime > gapTime) {
                fn.apply(this, arguments);
                lastTime = now;
            }
        }
    },
    request: function (url, postData, method, type, hideLoading) {
        //接口请求
        if (!hideLoading) {
            wx.showLoading({
                title: '请稍候...',
                mask: true
            })
        }
        const params = {
            data: method === "POST" ? postData : JSON.stringify(postData)
        }
        return new Promise((resolve, reject) => {
            wx.request({
                url: this.interfaceUrl() + url,
                data: method === "POST" ? JSON.stringify(params) : params,
                header: {
                    'content-type': type ? 'application/x-www-form-urlencoded' : 'application/json',
                    'authorization': wx.getStorageSync("token"),
                    'security': 1
                },
                method: method, //'GET','POST'
                dataType: 'json',
                success: (res) => {
                    !hideLoading && wx.hideLoading()
                    if (res.data && res.data.code === 403) {
                        wx.showModal({
                            title: '登录',
                            content: '您尚未登录，请先登录',
                            showCancel: false,
                            confirmColor: "#5677FC",
                            confirmText: '确定',
                            success(res) {
                                wx.redirectTo({
                                    url: '../login/login'
                                })
                            }
                        })
                    } else {
                        resolve(res.data)
                    }
                },
                fail: (res) => {
                    !hideLoading && this.toast("网络不给力，请稍后再试~")
                    //wx.hideLoading()
                    reject(res)
                }
            })
        })
    },
    uploadFile: function (src) {
        const that = this
        wx.showLoading({
            title: '请稍候...',
            mask: true
        })
        return new Promise((resolve, reject) => {
            const uploadTask = wx.uploadFile({
                url: 'http://39.108.124.252:8081/fileServce/file/ ', //测试地址,暂不使用
                filePath: src,
                name: 'file',
                header: {
                    'content-type': 'multipart/form-data'
                },
                formData: {},
                success: function (res) {
                    wx.hideLoading()
                    let d = JSON.parse(res.data)
                    if (d.code === 1) {
                        let fileObj = JSON.parse(d.data)[0];
                        //文件上传成功后把图片路径数据提交到服务器，数据提交成功后，再进行下张图片的上传
                        resolve(fileObj)
                    } else {
                        that.toast(res.message);
                    }
                },
                fail: function (res) {
                    reject(res)
                    wx.hideLoading();
                    that.toast(res.message);
                }
            })
        })
    }
}

//验证方法
const appValidate = {
    isNullOrEmpty: function (value) {
        if (value === null || value === undefined) {
            return true;
        } else {
            return value.constructor === String && value === "";
        }
    },
    checkIdentityCode: function (code) {
        var city = { 11: "北京", 12: "天津", 13: "河北", 14: "山西", 15: "内蒙古", 21: "辽宁", 22: "吉林", 23: "黑龙江 ", 31: "上海", 32: "江苏", 33: "浙江", 34: "安徽", 35: "福建", 36: "江西", 37: "山东", 41: "河南", 42: "湖北 ", 43: "湖南", 44: "广东", 45: "广西", 46: "海南", 50: "重庆", 51: "四川", 52: "贵州", 53: "云南", 54: "西藏 ", 61: "陕西", 62: "甘肃", 63: "青海", 64: "宁夏", 65: "新疆", 71: "台湾", 81: "香港", 82: "澳门", 91: "国外 " };
        var tip = "";
        var pass = true;

        if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[12])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
            tip = "身份证号格式错误";
            pass = false;
        }

        else if (!city[code.substr(0, 2)]) {
            tip = "地址编码错误";
            pass = false;
        }
        else {
            //18位身份证需要验证最后一位校验位
            if (code.length == 18) {
                code = code.split('');
                //∑(ai×Wi)(mod 11)
                //加权因子
                var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                //校验位
                var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
                var sum = 0;
                var ai = 0;
                var wi = 0;
                for (var i = 0; i < 17; i++) {
                    ai = code[i];
                    wi = factor[i];
                    sum += ai * wi;
                }
                var last = parity[sum % 11];
                if (parity[sum % 11] != code[17]) {
                    tip = "校验位错误";
                    pass = false;
                }
            }
        }
        //if (!pass) alert(tip);
        return pass;
    },
    checkNotNumber: function (value, tag) {//检验是否不是数字
        if (tag == 'required') {
            if (this.checkEmpty(value)) {
                return true;
            } else {
                return isNaN(value) || value < 1;
            }
        } else {
            if (this.checkEmpty(value)) {
                return false;
            } else {
                return isNaN(value) || value < 1;
            }
        }
    },
    checkDateIsOld: function (value) {//检验格式为'2017-01-02'的日期是否大于等于今天
        if (this.checkEmpty(value)) {
            return true;
        } else {
            var nowTime = new Date();
            var time1 = new Date(parseInt(value.substr(0, 4)), parseInt(value.substr(5, 2)) - 1, parseInt(value.substr(8, 2)), 0, 0, 0);
            var time2 = new Date(nowTime.getFullYear(), nowTime.getMonth(), nowTime.getDate(), 0, 0, 0);
            if (time2.getTime() > time1.getTime()) {
                return true;
            } else {
                return false;
            }
        }
    },
    checkNotEmail: function (value) {
        if (!value || !(value.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = {
    appUtils: utils,
    appValidate: appValidate,
    isNullOrEmpty: utils.isNullOrEmpty,
    trim: utils.trim,
    isMobile: utils.isMobile,
    isFloat: utils.isFloat,
    isNum: utils.isNum,
    interfaceUrl: utils.interfaceUrl,
    toast: utils.toast,
    request: utils.request,
    uploadFile: utils.uploadFile,
    formatNum: utils.formatNum
}
