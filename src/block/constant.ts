
export enum BlockUrlConstant {
    TextSpan = '/textspan',
    Text = '/text',
    Row = '/row',
    Col = '/col',
    View = '/view',
    Divider = '/divider',
    List = '/list',
    Head = '/head',
    Frame = '/frame',
    Mind = '/flow/mind',
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
    RefLinks = '/ref/links',
    Link = '/link',
    Todo='/todo'
}

export enum BlockChildKey {
    childs = 'childs',
    subChilds = 'subChilds',
    /**
     * mind中的子块（因为是平面的，自由布局的，有两个方南的blocks，和subChilds平级
     */
    otherChilds='otherChilds'
}