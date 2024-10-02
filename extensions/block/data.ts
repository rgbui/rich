
import { BlockGroup } from './delcare';
import {
    AudioSvg,
    BookSvg,
    BrowserSvg,
    ButtonSvg,
    CalloutSvg,
    CollectionBoardSvg,
    CollectionCalendarSvg,
    CollectionGallerySvg,
    CollectionListSvg,
    DividerSvg,
    DuplicateSvg,
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
    NumberListSvg,
    PageSvg,
    PicSvg,
    ProgressSvg,
    QuoteSvg,
    TimeSvg,
    TodoSvg,
    ToggleListSvg,
    TrashSvg,
    VideoSvg
} from '../../component/svgs';
import B from "../../src/assert/img/bilibili.ico";
import M from "../../src/assert/img/163.music.ico";
import FG from "../../src/assert/img/figma.png";
import MG from "../../src/assert/img/mastergo.png";
import VQQ from "../../src/assert/img/vqq.ico";
import YK from "../../src/assert/img/youku.png";
import YB from "../../src/assert/img/youtube.png";

export function getBlockSelectData() {
    var BlockSelectorData: BlockGroup[] = [
        {
            text: ('基本'),
            childs: [

                { text: ('文本'), icon: { name: 'byte', code: 'add-text' }, url: '/textspan', label: ('/文本'), labels: ['/wb', '/wenben', '/text', '/plain'] },
                { text: ('一级标题'), icon: H1Svg, url: '/head', description: ('一级标题'), label: ('/一级'), labels: ['/bt', ('/标题'), '/biaoti', '/head', '/h1', '/h', '/#'] },
                { text: ('二级标题'), icon: H2Svg, url: '/head?{level:"h2"}', label: ('/二级'), labels: ['/bt', ('/标题'), '/biaoti', '/head', '/h2', '/##'] },
                { text: ('三级标题'), icon: H3Svg, url: '/head?{level:"h3"}', label: ('/三级'), labels: ['/bt', ('/标题'), '/biaoti', '/head', '/h3', '/###'] },
                { text: ('四级标题'), icon: H4Svg, url: '/head?{level:"h4"}', label: ('/四级'), labels: ['/bt', ('/标题'), '/biaoti', '/head', '/h4', '/####'] },
                { text: ("待办"), icon: TodoSvg, url: '/todo', label: ('/待办'), labels: ['/dblb', '/daiban', '/todo'] },
                { text: ("列表"), icon: ListSvg, url: '/list?{listType:0}', label: ('/列表'), labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
                { text: ("数字列表"), icon: NumberListSvg, url: '/list?{listType:1}', label: ('/数字'), labels: ['/szlb', '/num', '/shuzi', '/number'] },
                { text: ("折叠列表"), icon: ToggleListSvg, url: '/list?{listType:2}', label: ('/折叠'), labels: ['/zdlb', '/toggle'] },

                { text: ("引述文字"), icon: QuoteSvg, url: '/quote', label: ('/引述'), labels: ['/yswz', '/yinshuwenzi', '/quote'] },
                { text: ("分割线"), icon: DividerSvg, url: '/divider', label: ('/分割线'), labels: ['/fgx', '/div', '/fengexian'] },
                { text: ("着重文字"), icon: CalloutSvg, url: "/callout", label: ("/着重"), labels: ['/zzwz', '/zz', '/zhouzhong', '/zhuozhongwenzi', '/callout'] },
                { text: ("数学公式"), icon: EquationSvg, url: "/katex", label: ("/公式"), labels: ['/sxgs', '/gs', '/gongshi', ("/数学公式"), ('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: ('进度条'), icon: ProgressSvg, url: '/measure', label: ("/进度条"), labels: ['/jdt', '/jindutiao', '/progress', '/progressbar'] },

            ]
        },
        {
            text: ('链接与导航'),
            childs: [

                { text: ('链接'), url: '/link', icon: LinkSvg, label: ("/链接"), labels: ['/link', '/lianjie', '/lj', '/wz'] },
                { text: ('面包屑导航'), url: '/links', icon: { name: 'byte', code: "navigation", rotate: 90, }, label: ("/面包屑"), labels: ['/links', '/urls', '/mbx', '/mianbaoxie', '/bread', '/breadcrumb'] },
                { text: ('标签'), url: '/tag', icon: { name: "byte", code: 'hashtag-key' }, label: ('/标签'), labels: ['/tag', '/biaoqian', '/bq'] },
                { text: ("书签"), url: '/bookmark', icon: BookSvg, label: ('/书签'), labels: ['/wzsq', '/webbook', '/book', '/shuqian', '/sq', '/bookmark'] },
                { text: ('页面'), url: '/page', icon: PageSvg, label: ('/页面'), labels: ['/page', '/ye', '/yemian', '/wz'] },
                // { text: ('二维码'), url: '/qr', icon: MentionSvg, label: ("/二维码"), labels: ['/qr', '/wz', '/ewm'] },
                // { text: ('目录树'),icon:{name:'byte',code:'document-folder'}, url: '/tree/links', icon: MentionSvg, label: ('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: ('大纲'), url: '/tree/links', icon: MentionSvg, label: ('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: ('页面关系图'), url: '/tree/links', icon: MentionSvg, label: ('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] }, 
                { text: ('引用页面'), icon: { name: 'byte', code: 'adjacent-item' }, url: '/ref/links', label: ("/引用"), labels: ['/引用页面', '/ref', '/yeyinyong', '/yy', '/yinyong', '/reflinks'] },

            ]
        },
        {
            text: ('排版布局'),
            childs: [

                { text: ('标签页'), icon: BrowserSvg, url: "/tab", label: ('/标签页'), labels: ['/tab', '/bjy', '/bianqianye'] },
                { text: ('简单表格'), icon: { name: 'byte', code: 'insert-table' }, url: '/table', label: ('/表格'), labels: ['/jdbg', '/bg', '/biaoge', '/jiandanbiaoge', '/simpletable', '/table'] },
                { text: ('卡片'), icon: { name: 'byte', code: 'bank-card-two' }, url: "/card", label: ('/卡片'), labels: ['/card', '/kp', '/kaipian'] },
                { text: ('白板'), icon: { name: 'byte', code: 'enter-the-keyboard' }, url: "/board", label: ('/白板'), labels: ['/board', '/bb', '/baiban', '/hb', '/huabu', '/canvas'] },
                { text: ('2列'), icon: { name: 'byte', code: 'two-key' }, url: '/2', label: '/2', labels: ['/2', '/2lie', '/2column', '/2col'] },
                { text: ('3列'), icon: { name: 'byte', code: 'three-key' }, url: '/3', label: '/3', labels: ['/3', '/3lie', '/3column', '/3col'] },
                { text: ('4列'), icon: { name: 'byte', code: 'four-key' }, url: '/4', label: '/4', labels: ['/4', '/4lie', '/4column', '/3col'] },
                { text: ('5列'), icon: { name: 'byte', code: 'five-key' }, url: '/5', label: '/5', labels: ['/5', '/5lie', '/5column', '/3col'] }
                //页面表单提交
            ]
        },
        {
            text: ('媒体与附件'),
            childs: [

                { text: ("图标"), icon: { name: 'bytedance-icon', code: 'oval-love-two' }, url: '/icon', label: ('/图标'), labels: ['/tb', '/icon', '/tubiao', '/logo'] },
                { text: ("图片"), icon: PicSvg, url: '/image', label: ('/图片'), labels: ['/tp', '/图像', '/tupian', '/img', '/image', '/picture'] },
                { text: ('轮播'), icon: { name: 'byte', code: 'multi-picture-carousel' }, url: '/carousel/image', label: ('/轮播'), labels: ['/tplb', '/lb', '/lunbo ', '/tupianlunbo', '/carousel', '/images', '/pics'] },
                { text: ("音频"), icon: AudioSvg, url: '/audio', label: ('/音频'), labels: ['/yp', '/yinping', '/audio'] },
                { text: ("视频"), icon: VideoSvg, url: '/video', label: ('/视频'), labels: ['/sp', '/shiping', '/video'] },
                { text: ("文件"), icon: FileSvg, url: '/file', label: ('/文件'), labels: ['/wj', '/wenjian', '/file'] },
                { text: ("代码"), icon: EquationSvg, url: "/code", label: ("/代码"), labels: ['/dmpd', '/daima', '/dm', '/daimapianduan', '/code'] },
                { text: ('思维导图'), icon: { name: 'byte', code: 'mindmap-map' }, url: "/board", data: { isAutoCreateMind: true }, label: ('/思维导图'), labels: ['/mind', '/mindmap', '/shiwei', '/naotu', '/脑图', '/思维导图'] },
            ]
        },
        {
            text: ('数据表'),
            childs: [

                { text: ('数据表'), icon: { name: 'byte', code: 'table' }, url: "/data-grid/table", label: ('/数据'), labels: ['/data', '/数据表', ('/表格'), '/grid', '/gridview', '/table', '/bg', '/biaoge', '/shuju', '/sj', '/shujubiaoge', '/sjbg'] },
                { text: ('相册'), icon: CollectionGallerySvg, url: "/data-grid/gallery", label: ('/相册'), labels: ['/data', '/数据表', ('/表格'), '/grid', '/gridview', '/table', 'xiangche', '/xc', '/gallery', '/photo'] },
                { text: ('数据列表'), icon: CollectionListSvg, url: "/data-grid/list", label: ('/数据列表'), labels: ['/data', '/数据表', ('/表格'), '/grid', '/gridview', '/table', '/list', '/datalist', '/libiao', '/lb'] },
                { text: ('看板'), icon: CollectionBoardSvg, url: "/data-grid/board", label: ('/看板'), labels: ['/data', '/数据表', ('/表格'), '/grid', '/gridview', '/table', '/board', '/kanban', '/kb'] },
                { text: ('日历'), icon: CollectionCalendarSvg, url: "/data-grid/calendar", label: ('/日历'), labels: ['/data', '/数据表', ('/表格'), '/grid', '/gridview', '/table', '/calendar', '/rili', '/rl'] },

                //网盘 图片库 音乐库 视频库

                { text: ('图文'), icon: { name: 'byte', code: 'id-card' }, url: "/data-grid/table", data: { templateUrl: "/article" }, label: ('/图文'), labels: ['/data', '/数据表', '/article', '/tuwen'] },
                { text: ('文件'), icon: { name: 'byte', code: 'hard-disk' }, url: "/data-grid/table", data: { templateUrl: "/list/disk" }, label: ('/文件'), labels: ['/data', '/数据表', ('/表格'), '/file', '/文件', '/wenjian'] },
                { text: ('讨论'), icon: { name: 'byte', code: 'topic' }, url: "/data-grid/table", data: { templateUrl: "/list/tizhi" }, label: ('/讨论'), labels: ['/data', '/数据表', ('/表格'), '/diss', '/讨论', '/taolun'] },

                { text: ('商品'), icon: { name: 'byte', code: 'shopping' }, url: "/data-grid/table", data: { templateUrl: "/goods" }, label: ('/商品'), labels: ['/data', '/数据表', ('/表格'), '/商品', '/goods', '/shop', '/shanping'] },
                { text: ('招聘'), icon: { name: 'byte', code: 'come' }, url: "/data-grid/table", data: { templateUrl: "/job" }, label: ('/招聘'), labels: ['/data', '/数据表', ('/表格'), '/招聘', '/job', '/zhaopin'] },
                { text: ('问答'), icon: { name: 'byte', code: 'file-question' }, url: "/data-grid/table", data: { templateUrl: "/questions" }, label: ('/问答'), labels: ['/data', '/数据表', ('/表格'), '/ask', '/问答', '/wenda'] },
                { text: ('事件'), icon: { name: 'byte', code: 'schedule' }, url: "/data-grid/table", data: { templateUrl: "/events" }, label: ('/事件'), labels: ['/data', '/数据表', ('/表格'), '/event', '/事件', '/shijian'] },
                { text: ('投票'), icon: { name: 'byte', code: 'ticket-one' }, url: "/data-grid/table", data: { templateUrl: "/voted" }, label: ('/投票'), labels: ['/data', '/数据表', ('/表格'), '/投票', '/vote', '、toupiao'] },
                { text: ('用户卡'), icon: { name: 'byte', code: 'id-card-h' }, url: "/data-grid/table", data: { templateUrl: "/user/story" }, label: ('/用户卡'), labels: ['/data', '/数据表', ('/表格'), '/用户卡', '/user', '/card', '/yonghu'] },
                { text: ('图片库'), icon: { name: 'byte', code: 'material-three' }, url: "/data-grid/table", data: { templateUrl: "/card/pinterest" }, label: ('/图片库'), labels: ['/data', '/数据表', ('/表格'), '/图片库', '/pin', '/tupianku'] },
            ]
        },
        {
            text: ('图表'),
            childs: [

                { text: ('图表'), icon: { name: 'bytedance-icon', code: 'chart-pie-one' }, url: "/data-grid/charts", label: ('/统计图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb'] },
                { text: ('折线图'), icon: { name: 'byte', code: 'chart-line' }, url: '/data-grid/charts?{"chart_type":"line"}', label: ('/折线图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zhexiantu', '/zxt'] },
                { text: ('柱状图'), icon: { name: 'byte', code: 'chart-histogram' }, url: '/data-grid/charts?{"chart_type":"bar"}', label: ('/柱状图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zhuzhuangtu', '/zzt'] },
                { text: ('饼图'), icon: { name: 'byte', code: 'chart-pie' }, url: '/data-grid/charts?{"chart_type":"pie"}', label: ('/饼图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/bingtu', '/bt'] },
                { text: ('雷达图'), icon: { name: 'byte', code: 'radar-chart' }, url: '/data-grid/charts?{"chart_type":"radar"}', label: ('/雷达图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/leidatu', '/ldt'] },
                { text: ('散点图'), icon: { name: 'byte', code: 'chart-scatter' }, url: '/data-grid/charts?{"chart_type":"scatter"}', label: ('/散点图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/sandiantu', '/sdt'] },
                { text: ('漏斗图'), icon: { name: 'byte', code: 'filter' }, url: '/data-grid/charts?{"chart_type":"funnel"}', label: ('/漏斗图'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/loudoutu', '/ldt'] },
                { text: ('仪表盘'), icon: { name: 'byte', code: 'speed-one' }, url: '/data-grid/charts?{"chart_type":"gauge"}', label: ('/仪表盘'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/yibiaopan', '/ybp'] },
                { text: ('统计与指标'), icon: { name: 'byte', code: 'mark' }, url: '/data-grid/charts?{"chart_type":"summary"}', label: ('/统计与指标'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/tongji', '/tj'] },
                { text: ('字符云'), icon: { name: 'byte', code: 'cloudy' }, url: '/data-grid/charts?{"chart_type":"wordCloud"}', label: ('/字符云'), labels: ['/data', ('图表'), ('统计图'), ('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zifuyun', '/zfy'] },

                //网盘 图片库 音乐库 视频库
            ]
        },
        {
            text: ('交互与操作'),
            childs: [
                { text: ('按钮'), url: '/button', icon: ButtonSvg, label: '/按钮', labels: ['/button', '/template', '/anniu', '/an'] },
                {
                    text: ('搜索'),
                    url: '/search',
                    icon: { name: 'byte', code: 'search' },
                    label: ('/搜索'),
                    labels: [
                        '/search',
                        ('/空间搜索'),
                        '/so',
                        '/sosearch',
                        '/shousuo', '/ss']
                },
                { text: ('编辑人'), url: '/page/author', icon: { name: 'bytedance-icon', code: 'edit-name' }, label: ('/作者'), labels: ['/author', '/writer', '/zuoze', '/zz'] },
                { text: ('点赞分享'), url: '/page/UpvotedOrShared', icon: { name: 'bytedance-icon', code: "send" }, label: ('/分享'), labels: ['/share', '/dz', '/dianzan', '/like'] },
                { text: ('评论'), url: '/comments', icon: { name: 'byte', code: 'message' }, label: ('/评论'), labels: ['/comment', '/pinglun', '/pl', '/message'] },
            ]
        },
        {
            text: ('行内块'),
            childs: [

                { text: ("日期"), icon: TimeSvg, isLine: true, url: '/mention/date', label: ('/日期'), labels: ['/date', '/时间', '/time', '/rq', '/reminder', '/riqi'] },
                { text: ("提及"), icon: MentionSvg, isLine: true, url: '/user/mention', label: ('/@'), labels: ['/mention', '/@', '/at'] },
                { text: ("行内公式"), icon: { name: 'byte', code: 'block' }, data: { content: 'a+b' }, url: "/katex/line", label: ("/公式"), labels: ['/sxgs', ("/行内公式"), ("/行内数学公式"), ('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: ("行内表情"), icon: EmojiSvg, isLine: true, url: "/emoji", label: ("/表情"), labels: ['/bq', '/biaoqing', '/emoji'] },
                { text: ("行内图标"), data: { src: { name: 'byte', code: 'hamburger-button' } }, icon: { name: 'bytedance-icon', code: 'oval-love-two' }, isLine: true, url: "/emoji", label: ("/图标"), labels: ['/tubiao', '/tb', '/biaoqing', '/emoji'] },
            ]
        },
        {
            text: ('嵌入'),
            childs: [
                { text: ('嵌入网址'), icon: EmbedSvg, url: "/embed", label: ('/嵌入'), labels: ['/qianru', '/qr', '/embed'] },
                { text: ('嵌入网易云音乐'), icon: { name: 'image', url: M }, data: { embedType: 'music.163' }, url: "/embed", label: ('/网易云音乐'), labels: ['/163', '/app', '/we', '/music', '/embed'] },
                { text: ('嵌入B站'), icon: { name: 'image', url: B }, url: "/embed", data: { embedType: 'bilibili' }, label: ('/B站'), labels: ['/b', '/sp', '/app', '/bilibili', '/bb', '/embed'] },
                { text: ('嵌入腾讯视频'), icon: { name: 'image', url: VQQ }, url: '/embed', data: { embedType: 'vqq' }, label: ('/腾讯视频'), labels: ['/vqq', '/app', '/sp', '/video', '/embed'] },
                { text: ('嵌入优酷视频'), icon: { name: 'image', url: YK }, url: '/embed', data: { embedType: 'youku' }, label: ('/优酷视频'), labels: ['/youku', '/app', '/sp', '/video', '/embed'] },
                { text: ('嵌入YouTube视频'), icon: { name: 'image', url: YB }, url: '/embed', data: { embedType: 'ytob' }, label: ('/YouTube视频'), labels: ['/app', '/youtube', '/sp', '/video', '/embed'] },
                { text: ('嵌入Figma'), icon: { name: 'image', url: FG }, url: '/embed', data: { embedType: 'figma' }, label: ('/Figma'), labels: ['/app', '/figma', '/design', '/embed'] },
                { text: ('嵌入MasterGO'), icon: { name: 'image', url: MG }, url: '/embed', data: { embedType: 'mastergo' }, label: ('/MasterGO'), labels: ['/app', '/mastergo', '/design', '/embed'] },
            ]
        },
        {
            text: ('块操作'),
            childs: [
                { text: ('块评论'), url: '/blockcomment', icon: { name: 'byte', code: 'message' }, label: '/bcomment', labels: ['/blockcomment', '/comment', '/block', '/bk', '/pl', '/pinglun'] },
                { text: ('块副本'), url: '/duplicate', icon: DuplicateSvg, label: '/duplicate', labels: ['/duplicate', '/copy', '/cp'] },
                { text: ('块删除'), url: '/delete', icon: TrashSvg, label: '/del', labels: ['/delete', '/del', '/trash'] },

            ]
        }
    ]
    return BlockSelectorData;
}

