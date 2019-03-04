const app = getApp()
const {appUtils} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: {
        isIphoneX: app.globalData.isIphoneX,
        page: pageStart,
        listData: [],
        requesting: false,
        end: false
    },
    getData(type, page) {
        this.setData({
            requesting: true
        });

        app.httpGet('/getUserTaskList', {
            page: page,
            limit: 15
        }).then((res) => {
            wx.stopPullDownRefresh();
            if(type === 'refresh') {
                if(res && res.data && res.data.length > 0) {
                    this.setData({
                        listData: res.data,
                        page: page + 1
                    });
                } else {
                    this.setData({
                        page: 0,
                        listData: []
                    });
                }
            } else {
                if(res && res.data && res.data.length > 0) {
                    this.setData({
                        listData: this.data.listData.concat(res.data),
                        page: page + 1
                    });
                } else {
                    this.setData({
                        page: page + 1
                    });
                }
            }
            if(this.data.listData.length === res.page.total) {
                this.setData({
                    end: true
                });
            }
            this.setData({
                requesting: false
            });
        }).catch(() => {
            this.setData({
                requesting: false
            });
            wx.stopPullDownRefresh();
        });
    },
    onPullDownRefresh() {
        this.getData('refresh', pageStart);
    },
    onReachBottom() {
        this.getData('more', this.data.page);
    },
    showDetail(e) {
        let index = e.currentTarget.dataset.index;
        let url = '/pages/rankingList/index?taskId=' + this.data.listData[index].id;
        wx.navigateTo({
            url: url
        });
    },
    onLoad(options) {
        this.getData('more', this.data.page);
    }
})
