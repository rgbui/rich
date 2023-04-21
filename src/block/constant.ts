
export enum BlockUrlConstant {
    TextSpan = '/textspan',
    Text = '/text',
    TextChannel = '/channel/text',
    Row = '/row',
    Col = '/col',
    View = '/view',
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
    RefLinks = '/ref/links',
    Link = '/link',
    Todo = '/todo',
    DataGridPage = '/data-grid/paging',
    Button = '/button',
    Comment = '/comments',
    FieldTitle = '/field/title',
    Image = '/image',
    BoardImage = '/board/image',
    FormView = '/data-grid/form'
}
export enum BlockChildKey {
    childs = 'childs',
    subChilds = 'subChilds',
    /**
     * mind中的子块（因为是平面的，自由布局的，有两个方南的blocks，和subChilds平级
     */
    otherChilds = 'otherChilds'
}