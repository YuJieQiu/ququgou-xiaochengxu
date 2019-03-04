const app = getApp();
const {appValidate, appUtils} = require('../../utils/util.js');

Page({
    data: {
        isIphoneX: app.globalData.isIphoneX,
        indicatorDots: true,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        taskInfo: {}, // 当前任务信息
        dotData: {}, // 当前需要打卡的点信息
        dotIndex: 0, // 当前需要打卡的点信息索引
        question: {}, // 当前需要展示的问题
        questionShow: false, // 问题窗口展示控制
        descriptionShow: false, // 描述确认窗口
        distance: -1
    },
    chooseDot(e) {
        let {taskInfo, dotData, dotIndex} = this.data;

        if(dotIndex > 0) {
            if(taskInfo.sequence && taskInfo.events[dotIndex - 1].user_event_status === 0) {
                wx.showToast({
                    title: '请先完成上一个打卡任务',
                    icon: 'none'
                });
                return;
            }
        }

        if(dotData.type === 1) { // type为1, 需要去调用后台查询问题接口
            app.httpGet('/getQuestion', {
                id: dotData.question_id
            }).then((res) => {
                if(res.data) {
                    let answer_all = [];
                    if(res.data.answer_right) {
                        res.data.answer_right.forEach((item, index) => {
                            answer_all.push({
                                key: item.key,
                                value: item.value,
                                checked: false
                            });
                        });
                    }

                    if(res.data.answer_wrong) {
                        res.data.answer_wrong.forEach((item, index) => {
                            answer_all.push({
                                key: item.key,
                                value: item.value,
                                checked: false
                            });
                        });
                    }

                    appUtils.shuffle(answer_all);

                    this.setData({
                        question: {
                            ...res.data,
                            answer_all: answer_all
                        }
                    });
                    this.toggleQuestionShow();
                }
            }).catch((res) => {
                console.log(res);
            });
        } else {
            this.sign();
        }
    },
    toggleQuestionShow() {
        this.setData({
            questionShow: !this.data.questionShow
        })
    },
    selectAnswer(e) {
        let index = e.currentTarget.dataset.index;
        let question = this.data.question;
        let answer_all = question.answer_all;
        answer_all[index].checked = !answer_all[index].checked;
        question.answer_all = answer_all;
        this.setData({
            question: question
        });
    },
    sign() { // 打卡接口
        let {taskInfo, dotData, dotIndex, question} = this.data;

        let answer_keys = [];

        if(dotData.type === 1) { // 问答题
            if(question && question.answer_all) {
                question.answer_all.forEach((item, index) => {
                    if(item.checked) {
                        answer_keys.push(item.key);
                    }
                });
            }

            if(answer_keys.length <=0) {
                wx.showToast({
                    title: '请至少选择一个答案',
                    icon: 'none'
                });
                return;
            }

        } else if(dotData.type === 2) { // GPS打卡

        } else {
            return;
        }

        app.httpPost('/createUserTaskEvent', {
            event_id: dotData.id,
            type: dotData.type,
            question_id: dotData.question_id,
            answer_keys: answer_keys,
            task_id: taskInfo.id,
            status: 0
        }, true).then((res) => {
            wx.showToast({
                title: '打卡成功',
                icon: 'none'
            });

            dotData.user_event_status = 2;
            taskInfo.user_task_status = 1;
            taskInfo.events[dotIndex] = dotData;
            this.setData({
                dotData: dotData,
                taskInfo: taskInfo,
                questionShow: false
            })

            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            let prevPage2 = pages[pages.length - 3];

            prevPage.setData({
                taskInfo: taskInfo
            });
            prevPage.changeTask(taskInfo);

            let {listData, taskIndex} = prevPage2.data;

            listData[taskIndex] = taskInfo;

            prevPage2.setData({
                listData: listData,
                taskInfo: taskInfo
            })

        }).catch((res) => {
            if(res.code === 400) {
                wx.showToast({
                    title: '任务已结束',
                    icon: 'none'
                });
                let pages = getCurrentPages();
                let prevPage = pages[pages.length - 3];
                prevPage.getData('refresh', 1);
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 2
                    })
                }, 300);
            }
        });
    },
    getDistance(data) {
        wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success: (res) => {
                if(res && this.data.dotData) {
                    console.log('获取位置success');
                    let distance = appUtils.getDistance(res, this.data.dotData);
                    this.setData({
                        distance: distance
                    })
                }
            },
            fail: (res) => {
                console.log(res)
            }
        });
    },
    onLoad() {
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        let {taskInfo, dotIndex} = prevPage.data;
        let dotData = taskInfo.events[dotIndex];
        this.setData({
            taskInfo: taskInfo,
            dotData: dotData,
            dotIndex: dotIndex
        });
        this.getDistance();
        setInterval(() => {
            this.getDistance();
        }, 10000);
    }
})
