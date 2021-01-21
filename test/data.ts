
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
            }]
        }
    ]
}