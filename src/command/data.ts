

export type CommandParameter = {
    name: string,
    text: string,
    remark?: string,
    in?: boolean;
    out?: boolean
}

export type CommandType = {
    url: string,
    scope: '$page' | '$data-grid' | '$data-row',
    parameters?: CommandParameter[],
    template?: string
}

export var CommandStores = [
    {
        name: 'page',
        text: '页面',
        spread: true,
        childs: [
            { text: '页面加载', url: '/page/reload', scope: '$page', template: '页面加载' },
            { text: '跳转页面', url: '/page/redict', scope: '$page', template: '跳转至@url', parameters: [{ name: 'viewUrl', text: '视图' }] },
            { text: '弹出对话窗', url: '/page/dialoug', scope: '$page', template: '弹出对话窗', parameters: [{ name: 'viewUrl', text: '视图' }] },
            { text: '消息提示', url: '/alert', scope: '$page', template: '消息提示', parameters: [{ name: 'type', text: '类型' }, { name: 'message', text: '内容' }] },
        ]
    }
]
