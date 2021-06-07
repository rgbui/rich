




import React from 'react';
import ReactDOM from 'react-dom';
import './index.less';
import { data } from "./data";
import { SY } from '..';


ReactDOM.render(
    <div className='editor-page'>
        <div className='editor' ></div>
        <div className='editor-console'></div>
    </div>,
    document.body.appendChild(document.createElement('div')),
    async () => {
        var ele = document.querySelector('.editor') as HTMLElement;
        var page = new SY.Page(ele, {
            user: {
                id: 'kankan',
                name: 'kankan',
                avatar: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fpublic.notion-static.com%2Fd84aa9f4-1aaf-4547-8273-ba1129f7b675%2F109951163041428408.jpg?table=space&id=37659cc5-3ed0-4375-9a9d-ce77379a49ff&width=40&userId=3c8f21e7-4d95-4ff1-a44b-3a82c3a8098e&cache=v2'
            }
        });
        page.on('blur', function (ev) {
            // console.log('blur', ev)
        });
        page.on('focus', function (ev) {
            //console.log('focus', ev);
        });
        page.on('focusAnchor', function (anchor) {
            // console.log('focusAnchor', anchor);
        });
        page.on('history', (action) => {
            var conEle: HTMLElement = document.querySelector('.editor-console');
            conEle.innerHTML = conEle.innerHTML + '</br>' + action.toString();
        });
        await page.load(data);
        await page.render();
    }
);