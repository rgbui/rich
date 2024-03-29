
import { BlockGroup } from './delcare';
import {
    AudioSvg,
    BookSvg,
    BrowserSvg,
    ButtonSvg,
    CalloutSvg,
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
    NumberListSvg,
    PicSvg,
    ProgressSvg,
    QuoteSvg,
    TableSvg,
    TimeSvg,
    TodoSvg,
    ToggleListSvg,
    VideoSvg
} from '../../component/svgs';
import { lst } from '../../i18n/store';
import B from "../../src/assert/img/bilibili.ico";
import M from "../../src/assert/img/163.music.ico";

export function getBlockSelectData() {
    var BlockSelectorData: BlockGroup[] = [
        {
            text: lst('基本'),
            childs: [

                { text: lst('文本'), icon: { name: 'byte', code: 'add-text' }, url: '/textspan', label: lst('/文本'), labels: ['/wb', '/wenben', '/text', '/plain'] },
                { text: lst('一级标题'), icon: H1Svg, url: '/head', description: lst('一级标题'), label: lst('/一级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h1'] },
                { text: lst('二级标题'), icon: H2Svg, url: '/head?{level:"h2"}', label: lst('/二级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h2'] },
                { text: lst('三级标题'), icon: H3Svg, url: '/head?{level:"h3"}', label: lst('/三级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h3'] },
                { text: lst('四级标题'), icon: H4Svg, url: '/head?{level:"h4"}', label: lst('/四级'), labels: ['/bt', lst('/标题'), '/biaoti', '/head', '/h4'] },
                { text: lst("待办"), icon: TodoSvg, url: '/todo', label: lst('/待办'), labels: ['/dblb', '/daiban', '/todo'] },
                { text: lst("列表"), icon: ListSvg, url: '/list?{listType:0}', label: lst('/列表'), labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
                { text: lst("数字列表"), icon: NumberListSvg, url: '/list?{listType:1}', label: lst('/数字'), labels: ['/szlb', '/shuzi', '/number'] },
                { text: lst("折叠列表"), icon: ToggleListSvg, url: '/list?{listType:2}', label: lst('/折叠'), labels: ['/zdlb', '/toggle'] },

                { text: lst("引述文字"), icon: QuoteSvg, url: '/quote', label: lst('/引述'), labels: ['/yswz', '/yinshuwenzi', '/quote'] },
                { text: lst("分割线"), icon: DividerSvg, url: '/divider', label: lst('/分割线'), labels: ['/fgx', '/fengexian'] },
                { text: lst("着重文字"), icon: CalloutSvg, url: "/callout", label: lst("/着重"), labels: ['/zzwz', '/zz', '/zhouzhong', '/zhuozhongwenzi', '/callout'] },
                { text: lst("数学公式"), icon: EquationSvg, url: "/katex", label: lst("/公式"), labels: ['/sxgs', '/gs', '/gongshi', lst("/数学公式"), lst('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: lst('进度条'), icon: ProgressSvg, url: '/measure', label: lst("/进度条"), labels: ['/jdt', '/jindutiao', '/progressbar'] },

            ]
        },
        {
            text: lst('链接与导航'),
            childs: [

                { text: lst('页面链接'), url: '/link', icon: LinkSvg, label: lst("/链接"), labels: ['/link', '/lianjie', '/lj', '/wz'] },
                { text: lst('面包屑导航'), url: '/links', icon: { name: 'byte', code: "navigation",rotate:90, }, label: lst("/面包屑"), labels: ['/links', '/urls', '/mbx', '/mianbaoxie', '/breadcrumb'] },
                { text: lst('标签'), url: '/tag', icon: { name: "byte", code: 'hashtag-key' }, label: lst('/标签'), labels: ['/tag', '/biaoqian', '/bq'] },
                { text: lst("书签"), url: '/bookmark', icon: BookSvg, label: lst('/书签'), labels: ['/wzsq', '/shuqian', '/sq', '/bookmark'] },
                // { text: lst('二维码'), url: '/qr', icon: MentionSvg, label: lst("/二维码"), labels: ['/qr', '/wz', '/ewm'] },
                // { text: lst('目录树'),icon:{name:'byte',code:'document-folder'}, url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: lst('大纲'), url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] },
                // { text: lst('页面关系图'), url: '/tree/links', icon: MentionSvg, label: lst('/目录树'), labels: ['/tree', '/note', '/mls', '/mulushu', '/tree/links'] }, 
                { text: lst('页面引用'), icon: { name: 'byte', code: 'deeplink' }, url: '/ref/links', label: lst("/引用"), labels: ['/ref', '/yeyinyong', '/yy', '/yinyong', '/reflinks'] },

            ]
        },
        {
            text: lst('排版布局'),
            childs: [

                { text: lst('标签页'), icon: BrowserSvg, url: "/tab", label: lst('/标签页'), labels: ['/tab', '/bjy', '/bianqianye'] },
                { text: lst('简单表格'), icon: TableSvg, url: '/table', label: lst('/表格'), labels: ['/jdbg', '/bg', '/biaoge', '/jiandanbiaoge', '/simpletable', '/table'] },
                { text: lst('卡片'), icon: { name: 'byte', code: 'bank-card-two' }, url: "/card", label: lst('/卡片'), labels: ['/card', '/kp', '/kaipian'] },
                { text: lst('白板'), icon: { name: 'byte', code: 'chopping-board' }, url: "/board", label: lst('/白板'), labels: ['/board', '/bb', '/baiban', '/hb', '/huabu', '/canvas'] },
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

                { text: lst("图标"), icon: { name: 'bytedance-icon', code: 'oval-love-two' }, url: '/icon', label: lst('/图标'), labels: ['/tb', '/tubiao', '/logo'] },
                { text: lst("图片"), icon: PicSvg, url: '/image', label: lst('/图片'), labels: ['/tp', '/tupian', '/img', '/image', '/picture'] },
                { text: lst('轮播'), icon: { name: 'byte', code: 'multi-picture-carousel' }, url: '/carousel/image', label: lst('/轮播'), labels: ['/tplb', '/lb', '/lunbo ', '/tupianlunbo', '/carousel', '/images', '/pics'] },
                { text: lst("音频"), icon: AudioSvg, url: '/audio', label: lst('/音频'), labels: ['/yp', '/yinping', '/audio'] },
                { text: lst("视频"), icon: VideoSvg, url: '/video', label: lst('/视频'), labels: ['/sp', '/shiping', '/video'] },
                { text: lst("文件"), icon: FileSvg, url: '/file', label: lst('/文件'), labels: ['/wj', '/wenjian', '/file'] },
                { text: lst("代码"), icon: EquationSvg, url: "/code", label: lst("/代码"), labels: ['/dmpd', '/daima', '/dm', '/daimapianduan', '/code'] },
            ]
        },
        {
            text: lst('数据'),
            childs: [
                { text: lst('数据表格'), icon: CollectTableSvg, url: "/data-grid/table", label: lst('/数据'), labels: ['/data', lst('/表格'), '/grid', '/gridview', '/table', '/bg', '/biaoge', '/shuju', '/sj', '/shujubiaoge', '/sjbg'] },

                //网盘 图片库 音乐库 视频库
            ]
        },
        {
            text: lst('交互与操作'),
            childs: [
                { text: lst('按钮'), url: '/button', icon: ButtonSvg, label: '/按钮', labels: ['/button', '/anniu', '/an'] },
                {
                    text: lst('搜索'), url: '/search',
                    icon: { name: 'byte', code: 'search' }, label: lst('/搜索'), labels: ['/search',
                        lst('/空间搜索'),
                        '/so',
                        '/sosearch',
                        '/shousuo', '/ss']
                },
                { text: lst('作者'), url: '/page/author', icon: { name: 'bytedance-icon', code: 'edit-name' }, label: lst('/作者'), labels: ['/author', '/writer', '/zuoze', '/zz'] },
                { text: lst('点赞分享'), url: '/page/UpvotedOrShared', icon: { name: 'bytedance-icon', code: "send" }, label: lst('/分享'), labels: ['/share', '/dz', '/dianzan', '/like'] },
                { text: lst('评论'), url: '/comments', icon: { name: 'byte', code: 'comment' }, label: lst('/评论'), labels: ['/comment', '/pinglun', '/pl', '/message'] },
            ]
        },
        {
            text: lst('图表'),
            childs: [

            ]
        },
        {
            text: lst('行内块'),
            childs: [

                { text: lst("日期"), icon: TimeSvg, isLine: true, url: '/mention/date', label: lst('/日期'), labels: ['/date', '/rq', '/riqi'] },
                { text: lst("提及"), icon: MentionSvg, isLine: true, url: '/user/mention', label: lst('/@'), labels: ['/mention', '/2', '/at'] },
                { text: lst("行内公式"), icon: { name: 'byte', code: 'block' }, data: { content: 'a+b' }, url: "/katex/line", label: lst("/公式"), labels: ['/sxgs', lst("/行内公式"), lst("/行内数学公式"), lst('/公式'), '/shuxuegongshi', '/latex', '/math'] },
                { text: lst("行内表情"), icon: EmojiSvg, isLine: true, url: "/emoji", label: lst("/表情"), labels: ['/bq', '/biaoqing', '/emoji'] },
                { text: lst("行内图标"), data: { src: { name: 'byte', code: 'hamburger-button' } }, icon: { name: 'bytedance-icon', code: 'oval-love-two' }, isLine: true, url: "/emoji", label: lst("/图标"), labels: ['/tubiao', '/tb', '/biaoqing', '/emoji'] },
            ]
        },
        {
            text: lst('嵌入'),
            childs: [
                { text: lst('嵌入网址'), icon: EmbedSvg, url: "/embed", label: lst('/嵌入'), labels: ['/qianru', '/qr', '/embed'] },
                { text: lst('嵌入网易云音乐'), icon: { name: 'image', url: M }, data: { embedType: 'music.163' }, url: "/embed", label: lst('/网易云音乐'), labels: ['/163', '/we', '/music', '/embed'] },
                { text: lst('嵌入B站'), icon: { name: 'image', url: B }, url: "/embed", data: { embedType: 'bilibili' }, label: lst('/B站'), labels: ['/b', '/bilibili', '/bb', '/embed'] },
                // {
                //     text: lst('嵌入高德地图'),
                //     icon: {
                //         name: 'image',
                //         url: `data:image/png;base64,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`
                //     },
                //     url: "/embed",
                //     data: { embedType: 'amap' },
                //     label: lst('/高德'),
                //     labels: ['/gaodei', '/gd', '/amap', '/map', '/embed']
                // },
            ]
        }
    ]
    return BlockSelectorData;
}

