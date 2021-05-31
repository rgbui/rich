
import React from 'react';
import text from "../../assert/img/text.png";
import header from "../../assert/img/header.png";
import subheader from "../../assert/img/subheader.png";
import subsubheader from "../../assert/img/subsubheader.png";
import todo from "../../assert/img/to-do.png";
import numberList from "../../assert/img/numbered-list.png";
import bulletedList from "../../assert/img/bulleted-list.png";
import quote from "../../assert/img/quote.png";
import toggle from "../../assert/img/toggle.png";
import callout from "../../assert/img/callout.png";
import code from "../../assert/img/code.png";
import emoji from "../../assert/img/inline-emoji.png";
import equation from "../../assert/img/inline-equation.png";

export var BlockSelectorData = [
    {
        text: '基本',
        childs: [
            {
                text: '文本',
                pic: <img src={text} />,
                url: '/textspan',
                description: '文本',
                label: '/文本',
                labels: []
            },
            { text: '大标题', pic: <img src={header} />, url: '/head', description: '文本', label: '/文本', labels: [] },
            { text: '二级标题', pic: <img src={subheader} />, url: '/head?{level:"h2"}', description: '文本', label: '/文本', labels: [] },
            { text: '三级标题', pic: <img src={subsubheader} />, url: '/head?{level:"h3"}', description: '文本', label: '/文本', labels: [] },
            { text: "待办列表", pic: <img src={todo} />, url: '/todo', description: "/todo", label: '/待办列表', labels: [] },
            { text: "数字列表", pic: <img src={numberList} />, url: '/list?{listType:1}', description: "", label: '/数字列表', labels: [] },
            { text: "列表", pic: <img src={bulletedList} />, url: '/list?{listType:0}', description: "", label: '/列表', labels: [] },
            { text: "引述文字", pic: <img src={quote} />, url: '/quote', description: "", label: '/引述文字', labels: [] },
            { text: "折叠列表", pic: <img src={toggle} />, url: '/list?{listType:2}', description: "折叠列表", label: '/折叠列表', labels: [] },
            { text: "首重文字", pic: <img src={callout} />, url: "/callout", description: "", label: "/首重文字", labels: [] },
            { text: "代码片段", pic: <img src={code} />, url: "/code", description: "", label: "/代码片段", labels: [] },
            { text: "数学公式", pic: <img src={equation} />, url: "/katex", description: "", label: "/数学公式", labels: [] },
            { text: "表情", pic: <img src={emoji} />, url: "/emoji", description: "", label: "/表情", labels: [] },
        ]
    }
]