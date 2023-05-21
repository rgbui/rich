
import { BlockGroup } from './delcare';
import { AudioSvg, BookSvg, BrowserSvg, ButtonSvg, ButtonTemplateSvg, CalloutSvg, CardSvg, CollectionBoardSvg, CollectionCalendarSvg, CollectionGallerySvg, CollectionListSvg, CollectTableSvg, DividerSvg, EmbedSvg, EmojiSvg, EquationSvg, FileSvg, H1Svg, H2Svg, H3Svg, H4Svg, LinkSvg, ListSvg, MentionSvg, MenuSvg, NumberListSvg, PageSvg, PicSvg, ProgressSvg, QuoteSvg, TableSvg, TemplatesSvg, TextSvg, TimeSvg, TodoSvg, ToggleListSvg, TypesEmailSvg, TypesPersonSvg, VideoSvg } from '../../component/svgs';

export var BlockSelectorData: BlockGroup[]=[
    {
        text: '基本',
        childs: [
            { text: '文本', icon: TextSvg, url: '/textspan', description: '文本', label: '/文本', labels: ['/wb', '/wenben', '/text', '/plain'] },
            //{ text: '文章标题', pic: <img src={header} />, url: '/title', description: '标题', label: '/文本', labels: ['/title', '/yemianbiaoti'] },
            { text: '一级标题', icon: H1Svg, url: '/head', description: '大标题', label: '/大标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h1'] },
            { text: '二级标题', icon: H2Svg, url: '/head?{level:"h2"}', description: '', label: '/四级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h2'] },
            { text: '三级标题', icon: H3Svg, url: '/head?{level:"h3"}', description: '', label: '/三级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h3'] },
            { text: '四级标题', icon: H4Svg, url: '/head?{level:"h4"}', description: '', label: '/四级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h4'] },
            { text: "待办", icon: TodoSvg, url: '/todo', description: "/todo", label: '/待办列表', labels: ['/dblb', '/daiban', '/todo'] },
            { text: "数字列表", icon: NumberListSvg, url: '/list?{listType:1}', description: "", label: '/数字列表', labels: ['/szlb', '/shuzi', '/number'] },
            { text: "折叠列表", icon: ToggleListSvg, url: '/list?{listType:2}', description: "折叠列表", label: '/折叠列表', labels: ['/zdlb', '/toggle'] },
            { text: "列表", icon: ListSvg, url: '/list?{listType:0}', description: "", label: '/列表', labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
            { text: "引述文字", icon: QuoteSvg, url: '/quote', description: "", label: '/引述文字', labels: ['/yswz', '/yinshuwenzi', '/quote'] },
            { text: "分割线", icon: DividerSvg, url: '/divider', description: '', label: '/分割线', labels: ['/fgx', '/fengexian'] },
            { text: "首重文字", icon: CalloutSvg, url: "/callout", description: "", label: "/首重文字", labels: ['/zzwz', '/zhuozhongwenzi', '/callout'] },
            { text: "数学公式", icon: EquationSvg, url: "/katex", description: "", label: "/数学公式", labels: ['/sxgs', '/公式', '/shuxuegongshi', '/latex', '/math'] },
            { text: '链接页面', icon: LinkSvg, url: '/link', description: "", label: "/链接", labels: ['/link', '/wz'] },
            { text: '进度条', icon: ProgressSvg, url: '/measure', description: "", label: "/进度条", labels: ['/jdt', '/jindutiao', '/progressbar'] },
            { text: '按钮', icon: ButtonSvg, isLine: true, url: '/button', description: '', label: '/按钮', labels: ['/button', '/al'] }
        ]
    },
    {
        text: '行内块',
        childs: [
            { text: "表情", icon: EmojiSvg, isLine: true, url: "/emoji", description: "", label: "/表情", labels: ['/bq', '/biaoqing', '/emoji'] },
            { text: "按钮", icon: ButtonSvg, isLine: true, url: "/button", description: "", label: "/按钮", labels: ['/al', '/anliu', '/button'] },
            { text: "日期", icon: TimeSvg, isLine: true, url: '/mention/date', description: '', label: '/引用日期', labels: ['/date', '/rq', '/riqi'] },
            { text: "页面", icon: PageSvg, isLine: true, url: '/link', description: '', label: '/引用页面', labels: ['/page', '/ym', '/yemian'] },
            { text: "提及", icon: MentionSvg, isLine: true, url: '/mention/person', description: '', label: '/ta人', labels: ['/mention', '/at'] },
        ]
    },
    {
        text: '展示',
        childs: [
            { text: '卡片', icon: CardSvg, url: "/card", label: '/卡片', labels: ['/card', '/kp', '/kaipian'] },
            // { text: '画板', pic: <img src={embed} />, url: '/board', label: '/画板', labels: ['/canvas', '/huaban', '/hb'] },
            { text: '标签页', icon: BrowserSvg, url: "/tab", label: '/标签页', labels: ['/tab', '/bjy', '/bianqianye'] },
            //  { text: '轮播', pic: <img src={embed} />, url: "/carousel", label: '/轮播', labels: ['/carousel', '/lb', '/lunbo'] },
            { text: '模板按钮', icon: ButtonTemplateSvg, url: '/button/template', label: '/模板按钮', labels: ['/mban', '/mubananniu', '/template'] },
            //{ text: '目录大纲', pic: <img src={embed} />, url: '/outline', label: '/目录', labels: ['/outline', '/note', '/mulu', '/dagang'] }
        ]
    },
    {
        text: '媒体与附件',
        childs: [
            { text: "图片", icon: PicSvg, url: '/image', description: '', label: '/图片', labels: ['/tp', '/tupian', '/img', '/image', '/picture'] },
            { text: "音频", icon: AudioSvg, url: '/audio', description: "", label: '/音频', labels: ['/yp', '/audio'] },
            { text: "视频", icon: VideoSvg, url: '/video', description: "", label: '/视频', labels: ['/sp', '/video'] },
            { text: "文件", icon: FileSvg, url: '/file', description: "", label: '/文件', labels: ['/wj', '/wenjian', '/file'] },
            { text: "代码片段", icon: EquationSvg, url: "/code", description: "", label: "/代码片段", labels: ['/dmpd', '/daimapianduan', '/code'] },
            { text: "书签", icon: BookSvg, url: '/bookmark', description: '', label: '/书签', labels: ['/wzsq', '/bookmark'] },
            { text: '简单表格', icon: TableSvg, url: '/table', description: '', label: '/表格', labels: ['/jdbg', '/jiandanbiaoge', '/simpletable', '/table'] }
        ]
    },
    {
        text: '数据',
        childs: [
            { text: '数据表格', icon: CollectTableSvg, url: "/data-grid/table", label: '/数据表格', labels: [] },
            { text: '看板', icon: CollectionBoardSvg, url: "/data-grid/board", label: '/看板', labels: [] },
            { text: '画廊', icon: CollectionGallerySvg, url: "/data-grid/gallery", label: '/画廊', labels: [] },
            { text: '日历', icon: CollectionCalendarSvg, url: "/data-grid/calendar", label: '/日历', labels: [] },
            { text: '列表', icon: CollectionListSvg, url: "/data-grid/list", label: '/列表', labels: [] },
            // { text: '时间线', pic: <img src={tablestore} />, url: "/data-grid/timeline", label: '/时间线' },
            // { text: '地图标记', pic: <img src={tablestore} />, url: "/data-grid/map", label: '/地图标记' },
            // { text: '统计图表', pic: <img src={tablestore} />, url: '/data-grid/charts', label: '/统计图表' },
            // { text: '统计值', pic: <img src={tablestore} />, url: '/data-grid/statistic/value', label: '/统计值' }
        ]
    },
    {
        text: '嵌入',
        childs: [
            { text: '嵌入', icon: EmbedSvg, url: "/embed", label: '/嵌入', labels: ['/qrnr', '/embed'] },
        ]
    }
]