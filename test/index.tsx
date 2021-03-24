

import "../src/util/array";

import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { SY } from "../src";
import { data } from "./data";

ReactDOM.render(
    <div className='editor' style={{ width: '500px', height: '200px' }}></div>,
    document.body.appendChild(document.createElement('div')),
    async () => {
        var ele = document.querySelector('.editor') as HTMLElement;
        var page = new SY.Page(ele);
        page.on('blur', function (ev) {
            console.log('blur', ev)
        });
        page.on('focus', function (ev) {
            console.log('focus', ev);
        })
        await page.load(data);
        await page.render();
    }
);