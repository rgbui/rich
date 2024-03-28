

export enum BlockUrlConstant {
    TextSpan = '/textspan',
    Text = '/text',
    Tag = '/tag',
    Tab = '/tab',
    TextChannel = '/channel/text',
    Row = '/row',
    Col = '/col',
    View = '/view',
    Template = '/template',
    CardBox = '/card/box',
    Divider = '/divider',
    List = '/list',
    Head = '/head',
    Frame = '/frame',
    Mind = '/flow/mind',
    Note = '/note',
    Pen = '/pen',
    Shape = '/shape',
    Line = '/line',
    Group = '/group',
    Board = '/board',
    Outline = '/outline',
    Title = '/title',
    Quote = '/quote',
    Callout = '/callout',
    Code = '/code',
    Katex = '/katex',
    KatexLine = '/katex/line',
    DataGridGallery = '/data-grid/gallery',
    DataGridTable = '/data-grid/table',
    DataGridList = '/data-grid/list',
    DataGridCalendar = '/data-grid/calendar',
    DataGridBoard = '/data-grid/board',
    DataGridTab = '/data-grid/tab',
    DataGridTabPage = '/data-grid/tab/page',
    RefLinks = '/ref/links',
    Link = '/link',
    Todo = '/todo',
    DataGridPage = '/data-grid/paging',
    DataGridOptionRule = '/data-grid/OptionRule',
    DataGridLatestOrHot = '/data-grid/LatestOrHot',
    DataGridFieldSort = '/field/filter/sort',
    Button = '/button',
    Comment = '/comments',
    Discuss = '/discuss',
    FieldTitle = '/field/title',
    Image = '/image',
    Video = '/video',
    Audio = '/audio',
    BoardImage = '/board/image',
    RecordPageView = '/data-grid/page/record',
    Table = '/table',
    TableRow='/table/row',
    TableCell = '/table/cell',
    BoardPageCard = '/board/page/card',
    PagePreOrNext = '/page/preOrNext',
    Card = '/card',
    PageAuthor = '/page/author',
    PageUpvotedOrShared = '/page/UpvotedOrShared'
}

export function BlockUrlResolve(url: BlockUrlConstant, data?: Record<string, any>) {
    if (data) {
        var parms = JSON.stringify(data);
        return url + '?' + parms;
    }
    else return url;
}

export function ParseBlockUrl(url: string) {
    if (url.indexOf('?') > -1) {
        var us = url.split('?');
        var parms = us[1];
        var data: Record<string, any> = {};
        if (typeof parms == 'string' && parms.startsWith('{')) {
            try {
                data = window.eval('(' + parms + ')');
            }
            catch (ex) {
                console.error(ex);
            }
        }
        return {
            url: us[0],
            data
        }
    }
    else return {
        url,
        data: {}
    }
}

export enum BlockChildKey {
    childs = 'childs',
    subChilds = 'subChilds',
    /**
     * mind中的子块（因为是平面的，自由布局的，有两个方南的blocks，和subChilds平级
     */
    otherChilds = 'otherChilds'
}