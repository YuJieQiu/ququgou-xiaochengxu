const app = getApp()

Page({
  data: { active: 0 },
  // event.detail 的值为当前选中项的索引
  onChange(event) {
    console.log(event.detail)
  },
  onLoad(options) {}
})
