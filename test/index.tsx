

import "../src/util/array";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { KanHai } from "../src";
import { data } from "./data";

ReactDOM.render(
    <div className='editor' style={{ width: '300px', height: '200px' }}></div>,
    document.body.appendChild(document.createElement('div')),
    async () => {
        var ele = document.querySelector('.editor') as HTMLElement;
        var page = new KanHai.Page(ele);
        console.log(data);
        await page.load(data);
        console.log(page);
        await page.render();
    }
);