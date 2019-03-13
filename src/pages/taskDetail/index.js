const app = getApp();

Page({
    data: {
        isIphoneX: app.globalData.isIphoneX, // iphoneX适配
        mapKey: app.mapKey, // 地图key
        markers: [],  // 点位信息
        latitude: '', // 纬度信息
        longitude: '', // 精度信息
        taskInfo: {}, // 当前任务信息
        scale: 10,
        dotIndex: 0 // 当前选择的打卡点索引
    },
    markerTap(e) {
        let dotIndex = this.data.taskInfo.events.findIndex((item) => {
            return item.id === e.markerId
        });

        let dotData = this.data.taskInfo.events[dotIndex];

        this.setData({
            dotIndex: dotIndex,
            longitude: dotData.longitude,
            latitude: dotData.latitude,
            scale: 16
        });
        wx.navigateTo({
            url: '/pages/dotDetail/index'
        });
    },
    changeTask(data) {
        let markers = data.events;

        let markers_new = [];

        markers.forEach(function (item, key) {
            let iconPath = '/assets/images/task1.png';

            if(item.user_event_status === 2) {
                iconPath = '/assets/images/task2.png';
            }

            let name = item.name;

            if(data.sequence) {
                name = `${key + 1}: ${name || '--'}`
            }

            markers_new.push({
                id: item.id,
                latitude: item.latitude,
                longitude: item.longitude,
                iconPath: iconPath,
                width: '45',
                height: '45',
                callout: {
                    content: name,
                    color: "#fff",
                    fontSize: "12",
                    borderRadius: "10",
                    bgColor: "#000000",
                    padding: "5",
                    display: "ALWAYS"
                }
            });
        });
        this.setData({
            latitude: markers_new[0].latitude,
            longitude: markers_new[0].longitude,
            markers: markers_new
        });
    },
    showMyLocation() {
        wx.getLocation({
            type: 'gcj02',
            success: (res) => {
                this.setData({
                    longitude: res.longitude,
                    latitude: res.latitude
                });
            }
        });
    },
    onLoad(options) {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        let taskInfo = prevPage.data.taskInfo;
        this.setData({
            taskInfo: taskInfo
        });

        this.showMyLocation();
        
        this.changeTask(this.data.taskInfo);
    }
})