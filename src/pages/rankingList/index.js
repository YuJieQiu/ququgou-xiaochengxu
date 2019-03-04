const app = getApp()
const {appUtils} = require('../../utils/util.js');

const pageStart = 1;

Page({
    data: {
        tabCur: 0,
        tabList: ["用户排名", "团队排名"],
        userTask: {},
        userRankList: [],
        groupRankList: [],
        taskId: undefined
    },
    chooseTab: function (event) {
        let target = event.currentTarget;

        let tabCur = target.dataset.index;

        let animation = wx.createAnimation({
            duration: 300,
            timingFunction: 'ease'
        });

        let query = wx.createSelectorQuery();
        //选择id
        query.select(`#tab${tabCur}`).boundingClientRect();
        query.select(`#tabWrap`).boundingClientRect();

        query.exec(function (res) {
            animation.width(res[0].width).translateX(res[0].left - res[1].left).step();

            this.setData({
                animationData: animation.export()
            });

        }.bind(this));

        this.setData({
            tabCur: tabCur,
            requesting: false,
            end: false
        });
    },
    getUserTask() {
        app.httpGet('/getUserTaskDetail', {
            task_id: this.data.taskId
        }).then((res) => {
            this.setData({
                userTask: res.data
            });
        }).catch((res) => {

        });
    },
    getTaskRank() {
        app.httpGet('/getTaskRankList', {
            task_id: this.data.taskId
        }).then((res) => {
            this.setData({
                userRankList: res.data.users_rank,
                groupRankList: res.data.groups_rank,
            })
        }).catch((res) => {

        });
    },
    onLoad(options) {
        console.log(options)
        this.setData({
            taskId: options.taskId || '112'
        });
        this.getUserTask();
        this.getTaskRank();
    }
})
