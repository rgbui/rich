

import "../src/util/array";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { KanHai } from "../src";
import { data } from "./data";

ReactDOM.render(
    <div className='editor' style={{ width: '500px', height: '200px' }}></div>,
    document.body.appendChild(document.createElement('div')),
    async () => {
        var ele = document.querySelector('.editor') as HTMLElement;
        var page = new KanHai.Page(ele);
        await page.load(data);
        await page.render();
    }
);