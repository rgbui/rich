
import { BlockGroup } from './delcare';
import {
    AudioSvg,
    BookSvg,
    BrowserSvg,
    ButtonSvg,
    ButtonTemplateSvg,
    CalloutSvg,
    CardSvg,
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    CollectTableSvg,
    DividerSvg,
    EmbedSvg,
    EmojiSvg,
    EquationSvg,
    FileSvg,
    H1Svg,
    H2Svg,
    H3Svg,
    H4Svg,
    LinkSvg,
    ListSvg,
    MentionSvg,
    MenuSvg,
    NumberListSvg,
    PageSvg,
    PicSvg,
    ProgressSvg,
    QuoteSvg,
    TableSvg,
    TemplatesSvg,
    TextSvg,
    TimeSvg,
    TodoSvg,
    ToggleListSvg,
    TypesEmailSvg,
    TypesPersonSvg,
    VideoSvg
} from '../../component/svgs';
import { lst } from '../../i18n/store';

export var BlockSelectorData: BlockGroup[] = [
    {
        text: lst('基本'),
        childs: [
            { text: lst('文本'), icon: TextSvg, url: '/textspan', description: lst('文本'), label: lst('/文本'), labels: ['/wb', '/wenben', '/text', '/plain'] },
            //{ text: '文章标题', pic: <img src={header} />, url: '/title', description: '标题', label: '/文本', labels: ['/title', '/yemianbiaoti'] },
            { text: lst('一级标题'), icon: H1Svg, url: '/head', description: lst('大标题'), label: lst('/大标题'), labels: ['/bt', '/标题', '/biaoti', '/head', '/h1'] },
            { text: lst('二级标题'), icon: H2Svg, url: '/head?{level:"h2"}', description: '', label: lst('/四级标题'), labels: ['/bt', '/标题', '/biaoti', '/head', '/h2'] },
            { text: lst('三级标题'), icon: H3Svg, url: '/head?{level:"h3"}', description: '', label: lst('/三级标题'), labels: ['/bt', '/标题', '/biaoti', '/head', '/h3'] },
            { text: lst('四级标题'), icon: H4Svg, url: '/head?{level:"h4"}', description: '', label: lst('/四级标题'), labels: ['/bt', '/标题', '/biaoti', '/head', '/h4'] },
            { text: lst("待办"), icon: TodoSvg, url: '/todo', description: "/todo", label: lst('/待办列表'), labels: ['/dblb', '/daiban', '/todo'] },
            { text: lst("数字列表"), icon: NumberListSvg, url: '/list?{listType:1}', description: "", label: lst('/数字列表'), labels: ['/szlb', '/shuzi', '/number'] },
            { text: lst("折叠列表"), icon: ToggleListSvg, url: '/list?{listType:2}', description: lst("折叠列表"), label: '/折叠列表', labels: ['/zdlb', '/toggle'] },
            { text: lst("列表"), icon: ListSvg, url: '/list?{listType:0}', description: "", label: lst('/列表'), labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
            { text: lst("引述文字"), icon: QuoteSvg, url: '/quote', description: "", label: lst('/引述文字'), labels: ['/yswz', '/yinshuwenzi', '/quote'] },
            { text: lst("分割线"), icon: DividerSvg, url: '/divider', description: '', label: lst('/分割线'), labels: ['/fgx', '/fengexian'] },
            { text: lst("着重文字"), icon: CalloutSvg, url: "/callout", description: "", label: lst("/首重文字"), labels: ['/zzwz', '/zhuozhongwenzi', '/callout'] },
            { text: lst("数学公式"), icon: EquationSvg, url: "/katex", description: "", label: lst("/数学公式"), labels: ['/sxgs', '/公式', '/shuxuegongshi', '/latex', '/math'] },
            { text: lst('链接页面'), icon: LinkSvg, url: '/link', description: "", label: lst("/链接"), labels: ['/link', '/wz'] },
            { text: lst('进度条'), icon: ProgressSvg, url: '/measure', description: "", label: lst("/进度条"), labels: ['/jdt', '/jindutiao', '/progressbar'] },
            //{ text: '按钮', icon: ButtonSvg, isLine: true, url: '/button', description: '', label: '/按钮', labels: ['/button', '/al'] }
        ]
    },
    {
        text: lst('行内块'),
        childs: [
            { text: lst("表情"), icon: EmojiSvg, isLine: true, url: "/emoji", description: "", label: lst("/表情"), labels: ['/bq', '/biaoqing', '/emoji'] },
            //{ text: "按钮", icon: ButtonSvg, isLine: true, url: "/button", description: "", label: "/按钮", labels: ['/al', '/anliu', '/button'] },
            { text: lst("日期"), icon: TimeSvg, isLine: true, url: '/mention/date', description: '', label: lst('/引用日期'), labels: ['/date', '/rq', '/riqi'] },
            { text: lst("页面"), icon: PageSvg, isLine: true, url: '/link', description: '', label: lst('/引用页面'), labels: ['/page', '/ym', '/yemian'] },
            { text: lst("提及"), icon: MentionSvg, isLine: true, url: '/mention/person', description: '', label: lst('/ta人'), labels: ['/mention', '/at'] },
        ]
    },
    {
        text: lst('展示'),
        childs: [
            { text: lst('卡片'), icon: CardSvg, url: "/card", label: lst('/卡片'), labels: ['/card', '/kp', '/kaipian'] },
            // { text: '画板', pic: <img src={embed} />, url: '/board', label: '/画板', labels: ['/canvas', '/huaban', '/hb'] },
            { text: lst('标签页'), icon: BrowserSvg, url: "/tab", label: lst('/标签页'), labels: ['/tab', '/bjy', '/bianqianye'] },
            //  { text: '轮播', pic: <img src={embed} />, url: "/carousel", label: '/轮播', labels: ['/carousel', '/lb', '/lunbo'] },
            { text: lst('模板按钮'), icon: ButtonTemplateSvg, url: '/button/template', label: lst('/模板按钮'), labels: ['/mban', '/mubananniu', '/template'] },
            //{ text: '目录大纲', pic: <img src={embed} />, url: '/outline', label: '/目录', labels: ['/outline', '/note', '/mulu', '/dagang'] }
        ]
    },
    {
        text: lst('媒体与附件'),
        childs: [
            { text: lst("图片"), icon: PicSvg, url: '/image', description: '', label: lst('/图片'), labels: ['/tp', '/tupian', '/img', '/image', '/picture'] },
            { text: lst('图片轮播'), icon: PicSvg, url: '/carousel/image', description: '', label: lst('/图片轮播'), labels: ['/tplb', '/tupianlunbo', '/carousel/image'] },
            { text: lst("音频"), icon: AudioSvg, url: '/audio', description: "", label: lst('/音频'), labels: ['/yp', '/audio'] },
            { text: lst("视频"), icon: VideoSvg, url: '/video', description: "", label: lst('/视频'), labels: ['/sp', '/video'] },
            { text: lst("文件"), icon: FileSvg, url: '/file', description: "", label: lst('/文件'), labels: ['/wj', '/wenjian', '/file'] },
            { text: lst("代码片段"), icon: EquationSvg, url: "/code", description: "", label: lst("/代码片段"), labels: ['/dmpd', '/daimapianduan', '/code'] },
            { text: lst("书签"), icon: BookSvg, url: '/bookmark', description: '', label: lst('/书签'), labels: ['/wzsq', '/bookmark'] },
            { text: lst('简单表格'), icon: TableSvg, url: '/table', description: '', label: lst('/表格'), labels: ['/jdbg', '/jiandanbiaoge', '/simpletable', '/table'] }
        ]
    },
    {
        text: lst('数据'),
        childs: [
            { text: lst('数据表格'), icon: CollectTableSvg, url: "/data-grid/table", label: lst('/数据表格'), labels: [] },
            { text: lst('看板'), icon: CollectionBoardSvg, url: "/data-grid/board", label: lst('/看板'), labels: [] },
            { text: lst('画廊'), icon: CollectionGallerySvg, url: "/data-grid/gallery", label: lst('/画廊'), labels: [] },
            { text: lst('日历'), icon: CollectionCalendarSvg, url: "/data-grid/calendar", label: lst('/日历'), labels: [] },
            { text: lst('列表'), icon: CollectionListSvg, url: "/data-grid/list", label: lst('/列表'), labels: [] },
            { text: lst('数据模板'), url: '/data-grid/template', operator: "openDataGridTemplate", icon: CollectTableSvg, label: lst('/数据模板'), labels: [] },
            // { text: '时间线', pic: <img src={tablestore} />, url: "/data-grid/timeline", label: '/时间线' },
            // { text: '地图标记', pic: <img src={tablestore} />, url: "/data-grid/map", label: '/地图标记' },
            // { text: '统计图表', pic: <img src={tablestore} />, url: '/data-grid/charts', label: '/统计图表' },
            // { text: '统计值', pic: <img src={tablestore} />, url: '/data-grid/statistic/value', label: '/统计值' }
        ]
    },
    {
        text: lst('嵌入'),
        childs: [
            { text: lst('嵌入'), icon: EmbedSvg, url: "/embed", label: lst('/嵌入'), labels: ['/qrnr', '/embed'] },
        ]
    }
]