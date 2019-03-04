module.exports = {
    
    orderStatus: function (value) {
        var data = [
            {
                value: 10,
                label: '全部'
            },
            {
                value: 0,
                label: '待支付'
            },
            {
                value: 1,
                label: '已付款'
            },
            {
                value: 2,
                label: '待收货'
            },
            {
                value: -2,
                label: '已退款'
            }
        ];

        if(value === 0 || value) {
            var label = '';
            data.forEach(function(item) {
                if(item.value === value) {
                    label = item.label;
                }
            })

            return label;
        } else {
            return data;
        }
    }
}