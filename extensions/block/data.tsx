
import React from 'react';
import text from "../../src/assert/img/text.png";
import header from "../../src/assert/img/header.png";
import subheader from "../../src/assert/img/subheader.png";
import subsubheader from "../../src/assert/img/subsubheader.png";
import todo from "../../src/assert/img/to-do.png";
import numberList from "../../src/assert/img/numbered-list.png";
import bulletedList from "../../src/assert/img/bulleted-list.png";
import quote from "../../src/assert/img/quote.png";
import toggle from "../../src/assert/img/toggle.png";
import callout from "../../src/assert/img/callout.png";
import code from "../../src/assert/img/code.png";
import emoji from "../../src/assert/img/inline-emoji.png";
import equation from "../../src/assert/img/inline-equation.png";
import tablestore from "../../src/assert/img/table-store.png";
import divider from "../../src/assert/img/divider.png";
import image from "../../src/assert/img/image.png";
import bookmark from "../../src/assert/img/web-bookmark.png";
import file from "../../src/assert/img/file.png";
import embed from "../../src/assert/img/embed.png";
import audio from "../../src/assert/img/audio.png";
import video from "../../src/assert/img/video.png";
import mentionDate from "../../src/assert/img/mention-date.png";
import mentionPage from "../../src/assert/img/mention-page.png";
import mentionPerson from "../../src/assert/img/mention-person.png";
import link from "../../src/assert/img/link.png";
import { BlockGroup } from './delcare';

export var BlockSelectorData: BlockGroup[] = [
    {
        text: '基本',
        childs: [
            { text: '文本', pic: <img src={text} />, url: '/textspan', description: '文本', label: '/文本', labels: ['/wb', '/wenben', '/text', '/plain'] },
            //{ text: '文章标题', pic: <img src={header} />, url: '/title', description: '标题', label: '/文本', labels: ['/title', '/yemianbiaoti'] },
            { text: '大标题', pic: <img src={header} />, url: '/head', description: '大标题', label: '/大标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h1'] },
            { text: '二级标题', pic: <img src={subheader} />, url: '/head?{level:"h2"}', description: '', label: '/四级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h2'] },
            { text: '三级标题', pic: <img src={subsubheader} />, url: '/head?{level:"h3"}', description: '', label: '/三级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h3'] },
            { text: '四级标题', pic: <img src={subsubheader} />, url: '/head?{level:"h4"}', description: '', label: '/四级标题', labels: ['/bt', '/标题', '/biaoti', '/head', '/h4'] },
            { text: "待办列表", pic: <img src={todo} />, url: '/todo', description: "/todo", label: '/待办列表', labels: ['/dblb', '/daiban', '/todo'] },
            { text: "数字列表", pic: <img src={numberList} />, url: '/list?{listType:1}', description: "", label: '/数字列表', labels: ['/szlb', '/shuzi', '/number'] },
            { text: "折叠列表", pic: <img src={toggle} />, url: '/list?{listType:2}', description: "折叠列表", label: '/折叠列表', labels: ['/zdlb', '/toggle'] },
            { text: "列表", pic: <img src={bulletedList} />, url: '/list?{listType:0}', description: "", label: '/列表', labels: ['/lb', '/liebiao', '/wuxu', '/wx', '/bullet'] },
            { text: "引述文字", pic: <img src={quote} />, url: '/quote', description: "", label: '/引述文字', labels: ['/yswz', '/yinshuwenzi', '/quote'] },
            { text: "分割线", pic: <img src={divider} />, url: '/divider', description: '', label: '/分割线', labels: ['/fgx', '/fengexian'] },
            { text: "首重文字", pic: <img src={callout} />, url: "/callout", description: "", label: "/首重文字", labels: ['/zzwz', '/zhuozhongwenzi', '/callout'] },
            { text: "数学公式", pic: <img src={equation} />, url: "/katex", description: "", label: "/数学公式", labels: ['/sxgs', '/公式', '/shuxuegongshi', '/latex', '/math'] },
            { text: '链接页面', pic: <img src={link} />, url: '/link', description: "", label: "/链接", labels: ['/link', '/wz'] },
            { text: '进度条', pic: <img src={link} />, url: '/measure', description: "", label: "/进度条", labels: ['/jdt', '/jindutiao', '/progressbar'] }
        ]
    },
    {
        text: '行内块',
        childs: [
            { text: "表情", isLine: true, pic: <img src={emoji} />, url: "/emoji", description: "", label: "/表情", labels: ['/bq', '/biaoqing', '/emoji'] },
            //{ text: "日期", isLine: true, pic: <img src={mentionDate} />, url: '/mention/date', description: '', label: '/引用日期', labels: ['/date', '/rq', '/riqi'] },
            // { text: "页面", isLine: true, pic: <img src={mentionPage} />, url: '/mention/page', description: '', label: '/引用页面', labels: ['/page', '/ym', '/yemian'] },
            { text: "@ta人", isLine: true, pic: <img src={mentionPerson} />, url: '/mention/person', description: '', label: '/ta人', labels: ['/mention', '/at'] },
        ]
    },
    {
        text: '展示',
        childs: [
            // { text: '卡片', pic: <img src={embed} />, url: "/card", label: '/卡片', labels: ['/card', '/kp', '/kaipian'] },
            // { text: '画板', pic: <img src={embed} />, url: '/board', label: '/画板', labels: ['/canvas', '/huaban', '/hb'] },
            { text: '标签页', pic: <img src={embed} />, url: "/tab", label: '/标签页', labels: ['/tab', '/bjy', '/bianqianye'] },
            //  { text: '轮播', pic: <img src={embed} />, url: "/carousel", label: '/轮播', labels: ['/carousel', '/lb', '/lunbo'] },
            { text: '模板按钮', pic: <img src={embed} />, url: '/button/template', label: '/模板按钮', labels: ['/mban', '/mubananniu', '/template'] },
            { text: '目录大纲', pic: <img src={embed} />, url: '/outline', label: '/目录', labels: ['/outline', '/note', '/mulu', '/dagang'] }
        ]
    },
    {
        text: '媒体与附件',
        childs: [
            { text: "图片", pic: <img src={image} />, url: '/image', description: '', label: '/图片', labels: ['/tp', '/tupian', '/img', '/image', '/picture'] },
            { text: "音频", pic: <img src={audio} />, url: '/audio', description: "", label: '/音频', labels: ['/yp', '/audio'] },
            { text: "视频", pic: <img src={video} />, url: '/video', description: "", label: '/视频', labels: ['/sp', '/video'] },
            { text: "文件", pic: <img src={file} />, url: '/file', description: "", label: '/文件', labels: ['/wj', '/wenjian', '/file'] },
            { text: "代码片段", pic: <img src={code} />, url: "/code", description: "", label: "/代码片段", labels: ['/dmpd', '/daimapianduan', '/code'] },
            { text: "书签", pic: <img src={bookmark} />, url: '/bookmark', description: '', label: '/书签', labels: ['/wzsq', '/bookmark'] },
            { text: '简单表格', pic: <img src={tablestore} />, url: '/table', description: '', label: '/表格', labels: ['/jdbg', '/jiandanbiaoge', '/simpletable', '/table'] }
        ]
    },
    {
        text: '数据',
        childs: [
            { text: '数据表格', pic: <img src={tablestore} />, url: "/data-grid/table", label: '/数据表格', labels: [] },
            { text: '看板', pic: <img src={tablestore} />, url: "/data-grid/board", label: '/看板', labels: [] },
            { text: '画廊', pic: <img src={tablestore} />, url: "/data-grid/gallery", label: '/画廊', labels: [] },
            { text: '日历', pic: <img src={tablestore} />, url: "/data-grid/calendar", label: '/日历', labels: [] },
            { text: '列表', pic: <img src={tablestore} />, url: "/data-grid/list", label: '/列表', labels: [] },
            // { text: '时间线', pic: <img src={tablestore} />, url: "/data-grid/timeline", label: '/时间线' },
            // { text: '地图标记', pic: <img src={tablestore} />, url: "/data-grid/map", label: '/地图标记' },
            // { text: '统计图表', pic: <img src={tablestore} />, url: '/data-grid/charts', label: '/统计图表' },
            // { text: '统计值', pic: <img src={tablestore} />, url: '/data-grid/statistic/value', label: '/统计值' }
        ]
    },
    {
        text: '嵌入',
        childs: [
            { text: '嵌入', pic: <img src={embed} />, url: "/embed", label: '/嵌入', labels: ['/qrnr', '/embed'] },
        ]
    }
]