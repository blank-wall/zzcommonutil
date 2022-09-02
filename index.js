
Page({
    behaviors: [],

    data: {},

    onLoad(options) {},

    onShow() {},

    onPageScroll() {},

    onReachBottom() {},

    onShareAppMessage() {
        const promise = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    title: '自定义转发标题'
                });
            }, 2000);
        });
        return {
            title: '',
            path: '',
            imageUrl: '',
            promise
        };
    }
});
    