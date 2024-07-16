
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
import { lst } from '../../i18n/store';
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
            text: lst('基本'),
            childs: [

                { text: lst('文本'), icon: { name: 'byte', code: 'add-text' }, url: '/textspan', label: lst('/文本'), labels: ['/wb', '/wenben', '/text', '/plain'] },
                { text: lst('一级标题'), icon: H1Svg, url: '/head', description: lst('一级标题'), label: lst('/一级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h1', '/h', '/#'] },
                { text: lst('二级标题'), icon: H2Svg, url: '/head?{level:"h2"}', label: lst('/二级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h2', '/##'] },
                { text: lst('三级标题'), icon: H3Svg, url: '/head?{level:"h3"}', label: lst('/三级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h3', '/###'] },
                { text: lst('四级标题'), icon: H4Svg, url: '/head?{level:"h4"}', label: lst('/四级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h4', '/####'] },
                { text: lst("待办"), icon: TodoSvg, url: '/todo', label: lst('/待办'), labels: ['/dblb', '/daiban', '/todo'] },
                { text: lst("列表"), icon: ListSvg, url: '/list?{listType:0}', label: lst('/列表'), labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
                { text: lst("数字列表"), icon: NumberListSvg, url: '/list?{listType:1}', label: lst('/数字'), labels: ['/szlb', '/num', '/shuzi', '/number'] },
                { text: lst("折叠列表"), icon: ToggleListSvg, url: '/list?{listType:2}', label: lst('/折叠'), labels: ['/zdlb', '/toggle'] },

                { text: lst("引述文字"), icon: QuoteSvg, url: '/quote', label: lst('/引述'), labels: ['/yswz', '/yinshuwenzi', '/quote'] },
                { text: lst("分割线"), icon: DividerSvg, url: '/divider', label: lst('/分割线'), labels: ['/fgx', '/div', '/fengexian'] },
                { text: lst("着重文字"), icon: CalloutSvg, url: "/callout", label: lst("/着重"), labels: ['/zzwz', '/zz', '/zhouzhong', '/zhuozhongwenzi', '/callout'] },
                { text: lst("数学公式"), icon: EquationSvg, url: "/katex", label: lst("/公式"), labels: ['/sxgs', '/gs', '/gongshi', lst("/数学公式"), lst('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: lst('进度条'), icon: ProgressSvg, url: '/measure', label: lst("/进度条"), labels: ['/jdt', '/jindutiao', '/progress', '/progressbar'] },

            ]
        },
        {
            text: lst('链接与导航'),
            childs: [

                { text: lst('链接'), url: '/link', icon: LinkSvg, label: lst("/链接"), labels: ['/link', '/lianjie', '/lj', '/wz'] },
                { text: lst('面包屑导航'), url: '/links', icon: { name: 'byte', code: "navigation", rotate: 90, }, label: lst("/面包屑"), labels: ['/links', '/urls', '/mbx', '/mianbaoxie', '/bread', '/breadcrumb'] },
                { text: lst('标签'), url: '/tag', icon: { name: "byte", code: 'hashtag-key' }, label: lst('/标签'), labels: ['/tag', '/biaoqian', '/bq'] },
                { text: lst("书签"), url: '/bookmark', icon: BookSvg, label: lst('/书签'), labels: ['/wzsq', '/webbook', '/book', '/shuqian', '/sq', '/bookmark'] },
                { text: lst('页面'), url: '/page', icon: PageSvg, label: lst('/页面'), labels: ['/page', '/ye', '/yemian', '/wz'] },
                // { text: lst('二维码'), url: '/qr', icon: MentionSvg, label: lst("/二维码"), labels: ['/qr', '/wz', '/ewm'] },
                // { text: lst('目录树'),icon:{name:'byte',code:'document-folder'}, url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: lst('大纲'), url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: lst('页面关系图'), url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] }, 
                { text: lst('引用页面'), icon: { name: 'byte', code: 'deeplink' }, url: '/ref/links', label: lst("/引用"), labels: ['/引用页面', '/ref', '/yeyinyong', '/yy', '/yinyong', '/reflinks'] },

            ]
        },
        {
            text: lst('排版布局'),
            childs: [

                { text: lst('标签页'), icon: BrowserSvg, url: "/tab", label: lst('/标签页'), labels: ['/tab', '/bjy', '/bianqianye'] },
                { text: lst('简单表格'), icon: { name: 'byte', code: 'insert-table' }, url: '/table', label: lst('/表格'), labels: ['/jdbg', '/bg', '/biaoge', '/jiandanbiaoge', '/simpletable', '/table'] },
                { text: lst('卡片'), icon: { name: 'byte', code: 'bank-card-two' }, url: "/card", label: lst('/卡片'), labels: ['/card', '/kp', '/kaipian'] },
                { text: lst('白板'), icon: { name: 'byte', code: 'enter-the-keyboard' }, url: "/board", label: lst('/白板'), labels: ['/board', '/bb', '/baiban', '/hb', '/huabu', '/canvas'] },
                { text: lst('2列'), icon: { name: 'byte', code: 'two-key' }, url: '/2', label: '/2', labels: ['/2', '/2lie', '/2column', '/2col'] },
                { text: lst('3列'), icon: { name: 'byte', code: 'three-key' }, url: '/3', label: '/3', labels: ['/3', '/3lie', '/3column', '/3col'] },
                { text: lst('4列'), icon: { name: 'byte', code: 'four-key' }, url: '/4', label: '/4', labels: ['/4', '/4lie', '/4column', '/3col'] },
                { text: lst('5列'), icon: { name: 'byte', code: 'five-key' }, url: '/5', label: '/5', labels: ['/5', '/5lie', '/5column', '/3col'] }
                //页面表单提交
            ]
        },
        {
            text: lst('媒体与附件'),
            childs: [

                { text: lst("图标"), icon: { name: 'bytedance-icon', code: 'oval-love-two' }, url: '/icon', label: lst('/图标'), labels: ['/tb', '/icon', '/tubiao', '/logo'] },
                { text: lst("图片"), icon: PicSvg, url: '/image', label: lst('/图片'), labels: ['/tp', '/图像', '/tupian', '/img', '/image', '/picture'] },
                { text: lst('轮播'), icon: { name: 'byte', code: 'multi-picture-carousel' }, url: '/carousel/image', label: lst('/轮播'), labels: ['/tplb', '/lb', '/lunbo ', '/tupianlunbo', '/carousel', '/images', '/pics'] },
                { text: lst("音频"), icon: AudioSvg, url: '/audio', label: lst('/音频'), labels: ['/yp', '/yinping', '/audio'] },
                { text: lst("视频"), icon: VideoSvg, url: '/video', label: lst('/视频'), labels: ['/sp', '/shiping', '/video'] },
                { text: lst("文件"), icon: FileSvg, url: '/file', label: lst('/文件'), labels: ['/wj', '/wenjian', '/file'] },
                { text: lst("代码"), icon: EquationSvg, url: "/code", label: lst("/代码"), labels: ['/dmpd', '/daima', '/dm', '/daimapianduan', '/code'] },
                { text: lst('思维导图'), icon: { name: 'byte', code: 'mindmap-map' }, url: "/board", data: { isAutoCreateMind: true }, label: lst('/思维导图'), labels: ['/mind', '/mindmap', '/shiwei', '/naotu', '/脑图', '/思维导图'] },
            ]
        },
        {
            text: lst('数据'),
            childs: [

                { text: lst('数据表'), icon: { name: 'byte', code: 'table' }, url: "/data-grid/table", label: lst('/数据'), labels: ['/data', '/数据表', lst('/表格'), '/grid', '/gridview', '/table', '/bg', '/biaoge', '/shuju', '/sj', '/shujubiaoge', '/sjbg'] },
                { text: lst('相册'), icon: CollectionGallerySvg, url: "/data-grid/gallery", label: lst('/相册'), labels: ['/data', '/数据表', lst('/表格'), '/grid', '/gridview', '/table', 'xiangche', '/xc','/gallery','/photo'] },
                { text: lst('数据列表'), icon: CollectionListSvg, url: "/data-grid/list", label: lst('/数据列表'), labels: ['/data', '/数据表', lst('/表格'), '/grid', '/gridview', '/table', '/list', '/datalist', '/libiao', '/lb'] },
                { text: lst('看板'), icon: CollectionBoardSvg, url: "/data-grid/board", label: lst('/看板'), labels: ['/data', '/数据表', lst('/表格'), '/grid', '/gridview', '/table', '/board', '/kanban', '/kb'] },
                { text: lst('日历'), icon: CollectionCalendarSvg, url: "/data-grid/calendar", label: lst('/日历'), labels: ['/data', '/数据表', lst('/表格'), '/grid', '/gridview', '/table', '/calendar', '/rili', '/rl'] },
                { text: lst('图表'), icon: { name: 'bytedance-icon', code: 'chart-pie-one' }, url: "/data-grid/charts", label: lst('/统计图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb'] },
                { text: lst('折线图'), icon: { name: 'byte', code: 'chart-line' }, url: '/data-grid/charts?{"chart_type":"line"}', label: lst('/折线图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zhexiantu', '/zxt'] },
                { text: lst('柱状图'), icon: { name: 'byte', code: 'chart-histogram' }, url: '/data-grid/charts?{"chart_type":"bar"}', label: lst('/柱状图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zhuzhuangtu', '/zzt'] },
                { text: lst('饼图'), icon: { name: 'byte', code: 'chart-pie' }, url: '/data-grid/charts?{"chart_type":"pie"}', label: lst('/饼图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/bingtu', '/bt'] },
                { text: lst('雷达图'), icon: { name: 'byte', code: 'radar-chart' }, url: '/data-grid/charts?{"chart_type":"radar"}', label: lst('/雷达图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/leidatu', '/ldt'] },
                { text: lst('散点图'), icon: { name: 'byte', code: 'chart-scatter' }, url: '/data-grid/charts?{"chart_type":"scatter"}', label: lst('/散点图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/sandiantu', '/sdt'] },
                { text: lst('漏斗图'), icon: { name: 'byte', code: 'filter' }, url: '/data-grid/charts?{"chart_type":"funnel"}', label: lst('/漏斗图'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/loudoutu', '/ldt'] },
                { text: lst('仪表盘'), icon: { name: 'byte', code: 'speed-one' }, url: '/data-grid/charts?{"chart_type":"gauge"}', label: lst('/仪表盘'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/yibiaopan', '/ybp'] },
                { text: lst('统计与指标'), icon: { name: 'byte', code: 'mark' }, url: '/data-grid/charts?{"chart_type":"summary"}', label: lst('/统计与指标'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/tongji', '/tj'] },
                { text: lst('字符云'), icon: { name: 'byte', code: 'cloudy' }, url: '/data-grid/charts?{"chart_type":"wordCloud"}', label: lst('/字符云'), labels: ['/data', lst('图表'), lst('统计图'), lst('/表格'), '/grid', '/gridview', '/table', '/echarts', '/charts', '/tongji', '/tj', '/tubiao', '/tb', '/zifuyun', '/zfy'] },

                //网盘 图片库 音乐库 视频库
            ]
        },
        {
            text: lst('交互与操作'),
            childs: [
                { text: lst('按钮'), url: '/button', icon: ButtonSvg, label: '/按钮', labels: ['/button', '/template', '/anniu', '/an'] },
                {
                    text: lst('搜索'),
                    url: '/search',
                    icon: { name: 'byte', code: 'search' },
                    label: lst('/搜索'),
                    labels: [
                        '/search',
                        lst('/空间搜索'),
                        '/so',
                        '/sosearch',
                        '/shousuo', '/ss']
                },
                { text: lst('编辑人'), url: '/page/author', icon: { name: 'bytedance-icon', code: 'edit-name' }, label: lst('/作者'), labels: ['/author', '/writer', '/zuoze', '/zz'] },
                { text: lst('点赞分享'), url: '/page/UpvotedOrShared', icon: { name: 'bytedance-icon', code: "send" }, label: lst('/分享'), labels: ['/share', '/dz', '/dianzan', '/like'] },
                { text: lst('评论'), url: '/comments', icon: { name: 'byte', code: 'message' }, label: lst('/评论'), labels: ['/comment', '/pinglun', '/pl', '/message'] },
            ]
        },
        {
            text: lst('行内块'),
            childs: [

                { text: lst("日期"), icon: TimeSvg, isLine: true, url: '/mention/date', label: lst('/日期'), labels: ['/date', '/时间', '/time', '/rq', '/reminder', '/riqi'] },
                { text: lst("提及"), icon: MentionSvg, isLine: true, url: '/user/mention', label: lst('/@'), labels: ['/mention', '/@', '/at'] },
                { text: lst("行内公式"), icon: { name: 'byte', code: 'block' }, data: { content: 'a+b' }, url: "/katex/line", label: lst("/公式"), labels: ['/sxgs', lst("/行内公式"), lst("/行内数学公式"), lst('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: lst("行内表情"), icon: EmojiSvg, isLine: true, url: "/emoji", label: lst("/表情"), labels: ['/bq', '/biaoqing', '/emoji'] },
                { text: lst("行内图标"), data: { src: { name: 'byte', code: 'hamburger-button' } }, icon: { name: 'bytedance-icon', code: 'oval-love-two' }, isLine: true, url: "/emoji", label: lst("/图标"), labels: ['/tubiao', '/tb', '/biaoqing', '/emoji'] },
            ]
        },
        {
            text: lst('嵌入'),
            childs: [
                { text: lst('嵌入网址'), icon: EmbedSvg, url: "/embed", label: lst('/嵌入'), labels: ['/qianru', '/qr', '/embed'] },
                { text: lst('嵌入网易云音乐'), icon: { name: 'image', url: M }, data: { embedType: 'music.163' }, url: "/embed", label: lst('/网易云音乐'), labels: ['/163', '/app', '/we', '/music', '/embed'] },
                { text: lst('嵌入B站'), icon: { name: 'image', url: B }, url: "/embed", data: { embedType: 'bilibili' }, label: lst('/B站'), labels: ['/b', '/sp', '/app', '/bilibili', '/bb', '/embed'] },
                { text: lst('嵌入腾讯视频'), icon: { name: 'image', url: VQQ }, url: '/embed', data: { embedType: 'vqq' }, label: lst('/腾讯视频'), labels: ['/vqq', '/app', '/sp', '/video', '/embed'] },
                { text: lst('嵌入优酷视频'), icon: { name: 'image', url: YK }, url: '/embed', data: { embedType: 'youku' }, label: lst('/优酷视频'), labels: ['/youku', '/app', '/sp', '/video', '/embed'] },
                { text: lst('嵌入YouTube视频'), icon: { name: 'image', url: YB }, url: '/embed', data: { embedType: 'ytob' }, label: lst('/YouTube视频'), labels: ['/app', '/youtube', '/sp', '/video', '/embed'] },
                { text: lst('嵌入Figma'), icon: { name: 'image', url: FG }, url: '/embed', data: { embedType: 'figma' }, label: lst('/Figma'), labels: ['/app', '/figma', '/design', '/embed'] },
                { text: lst('嵌入MasterGO'), icon: { name: 'image', url: MG }, url: '/embed', data: { embedType: 'mastergo' }, label: lst('/MasterGO'), labels: ['/app', '/mastergo', '/design', '/embed'] },
            ]
        },
        {
            text: lst('块操作'),
            childs: [
                { text: lst('块评论'), url: '/blockcomment', icon: { name: 'byte', code: 'message' }, label: '/bcomment', labels: ['/blockcomment', '/comment', '/block', '/bk', '/pl', '/pinglun'] },
                { text: lst('块副本'), url: '/duplicate', icon: DuplicateSvg, label: '/duplicate', labels: ['/duplicate', '/copy', '/cp'] },
                { text: lst('块删除'), url: '/delete', icon: TrashSvg, label: '/del', labels: ['/delete', '/del', '/trash'] },

            ]
        }
    ]
    return BlockSelectorData;
}

