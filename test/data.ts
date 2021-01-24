
export var data = {
    name: 'page',
    views: [
        {
            name: 'view',
            childs: [{
                name: 'row',
                childs: [
                    { name: 'textSpan', content: '你还好吗' }
                ]
            }, {
                name: 'row',
                childs: [
                    {
                        name: 'textSpan', childs: [{ name: 'text', content: '你就这样' },
                        { name: 'text', content: '我就这样喽' }]
                    }
                ]
            }, {
                name: "row",
                childs: [
                    { name: 'todo', content: '我可以选择吗', checked: true }
                ]
            },
            { name: 'row', childs: [{ name: 'image', widthPercent: 50, src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fblog%2F201508%2F10%2F20150810150356_hnves.jpeg&refer=http%3A%2F%2Fb-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1614066907&t=93f1dfde3d75b35f1153af1eda01e314' }] }
            ]
        }
    ]
}