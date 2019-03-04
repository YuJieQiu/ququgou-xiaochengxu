const app = getApp()
const {appUtils, appValidate} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: {
        imgUrls: [],
        indicatorDots: true,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        isIphoneX: app.globalData.isIphoneX,
        page: pageStart,
        listData: [],
        requesting: false,
        end: false,
        taskInfo: {},
        taskIndex: 0
    },
    showDetail(e) {
        let index = e.currentTarget.dataset.index;
        let data = this.data.listData[index];

        this.setData({
            taskInfo: data,
            taskIndex: index
        });
        wx.navigateTo({
            url: '/pages/taskDetail/index'
        });
    },
    getData(type, page) {
        this.setData({
            requesting: true
        });

        app.httpGet('/getHomeTaskList', {
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
    getBannerList() {
        app.httpGet('/getBannerList').then((res) => {
            if(res && res.data) {
                this.setData({
                    imgUrls: res.data
                });
            }
        });
    },
    registerTask(id,group_id) {
        app.httpPost('/createUserTask', {
            task_id: parseInt(id),
          group_id: parseInt(group_id),
        }, true).then((res) => {
            wx.showToast({
                title: '参加成功',
                icon: 'none'
            });
            wx.removeStorageSync('main_task_id');
            this.getData('more', this.data.page);
        }).catch((res) => {
            if(res.code === 401) {
                wx.setStorageSync('main_task_id', id);
            } else {
                wx.removeStorageSync('main_task_id');
                this.getData('more', this.data.page);
            }
        });
    },
    onPullDownRefresh() {
        this.getData('refresh', pageStart);
    },
    onReachBottom() {
        this.getData('more', this.data.page);
    },
    onLoad(options) {
      
       this.getBannerList(); 

       let task_id = wx.getStorageSync('main_task_id');
       
       let group_id =0

        if (options.scene){
          var arr = options.scene.split("_");
          task_id = arr[0];
          group_id =arr[1];
        }  
        if(!appValidate.isNullOrEmpty(task_id)) {
          this.registerTask(task_id, group_id);
        } else {
            this.getData('more', this.data.page);
        }
    }
})

