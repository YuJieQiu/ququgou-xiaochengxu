Component({
    properties: {
        listData: {
            type: Array,
            value: []
        },
        requesting: Boolean,
        end: Boolean,
        emptyUrl: {
            type: String,
            value: "/assets/images/empty/empty.svg"
        },
        emptyText: {
            type: String,
            value: "暂时啥都没有哦~"
        }
    },
    created() {

    }
})