Component({
    properties: {
        url: String,
        defaultUrl: {
            type: String,
            value: "/assets/images/defaultPic.svg"
        }
    },
    methods: {
        imageOnError() {
            this.setData({
                url: this.data.defaultUrl
            });
        }
    }
})