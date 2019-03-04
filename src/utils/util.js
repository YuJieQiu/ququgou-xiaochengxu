//工具方法
const appUtils = {
    combineArray: function (a, b) {//合并数组
        if(a&&b&&a.constructor === Array && b.constructor === Array) {
            if(a.length>b.length) {
                a.push.apply(a,b);
            }else {
                b.push.apply(a,b);
            }
        }else {
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
        if(!date) {
          return "";
        }
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hour = date.getHours();
        const minute = date.getMinutes();
        const second = date.getSeconds();
        if(fullDate) {
            return [year, month, day].map(this.fixZero).join('-') + ' ' + [hour, minute, second].map(this.fixZero).join(':');
        } else {
            return [year, month, day].map(this.fixZero).join('-');
        }
    },
    formatMoney: function (money) {
        return (money||"0").toString().split("").reverse().join("").replace(/(\d{3}\B)/g, "$1,").split("").reverse().join("")
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
    }
}

//验证方法
const appValidate = {
    isNullOrEmpty: function(value) {
        if(value === null || value === undefined) {
            return true;
        } else {
            return value.constructor === String && value === "";
        }
    },
    checkIdentityCode: function(code) {
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
        if(tag == 'required') {
            if(this.checkEmpty(value)) {
                return true;
            }else {
                return isNaN(value)||value<1;
            }
        }else {
            if(this.checkEmpty(value)) {
                return false;
            }else {
                return isNaN(value)||value<1;
            }
        }
    },
    checkDateIsOld: function(value) {//检验格式为'2017-01-02'的日期是否大于等于今天
        if(this.checkEmpty(value)) {
            return true;
        }else {
            var nowTime = new Date();
            var time1 = new Date(parseInt(value.substr(0,4)), parseInt(value.substr(5,2))-1, parseInt(value.substr(8,2)), 0, 0, 0);
            var time2 = new Date(nowTime.getFullYear(),nowTime.getMonth(),nowTime.getDate(),0,0,0);
            if(time2.getTime() > time1.getTime()) {
                return true;
            }else {
                return false;
            }
        }
    },
    checkNotEmail: function(value) {
        if (!value || !(value.search(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/) != -1)) {
            return true;
        } else {
            return false;
        }
    }
}

module.exports = {
    appUtils: appUtils,
    appValidate: appValidate
}
