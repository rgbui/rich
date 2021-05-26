
import React from 'react';
import text from "../../assert/img/text.png";
import header from "../../assert/img/header.png";
import subheader from "../../assert/img/subheader.png";
import subsubheader from "../../assert/img/subsubheader.png";
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
        ]
    }
]