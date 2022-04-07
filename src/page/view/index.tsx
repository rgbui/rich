import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { PageLayoutView } from "../../layout/view";
import { ChildsArea } from "../../block/view/appear";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
import { PageLayoutType } from "../../layout/declare";
import { getBoardTool } from "../../../extensions/board.tool";
import { Point } from "../../common/vector/point";
import { BlockPickerView } from "../../kit/picker/view";
import { BlockUrlConstant } from "../../block/constant";
/**
 * mousedown --> mouseup --> click --> mousedown --> mouseup --> click --> dblclick
 * 对于同时支持这4个事件的浏览器，事件执行顺序为focusin > focus > focusout > blur
 * mousedown -> blur -> mouseup -> click
 **/
export class PageView extends Component<{ page: Page }>{
    constructor(props) {
        super(props);
        this.page.view = this;
    }
    get page() {
        return this.props.page;
    }
    private _mousedown;
    private _mousemove;
    private _mouseup;
    private _keyup;
    private _keydown;
    private _wheel;
    el: HTMLElement;
    componentDidMount() {
        this.el = ReactDOM.findDOMNode(this) as HTMLElement;
        this.observeOutsideDrop();
        this.el.addEventListener('keydown', (this._keydown = e => this.page.onKeydown(e)), true);
        this.el.addEventListener('wheel', this._wheel = e => this.page.onWheel(e), {
            passive: false
        });
        this.el.addEventListener('touchstart', e => console.log(e));
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
        this.observeToolBoard();
    }
    async observeToolBoard() {
        if (this.page.pageLayout.type == PageLayoutType.board) {
            var toolBoard = await getBoardTool();
            toolBoard.open(Point.from(this.el.getBoundingClientRect()).move(10, 10));
            toolBoard.only('selector', (data) => {
                var cursor: string = '';
                if (data.url == BlockUrlConstant.TextSpan) {
                    cursor = `-webkit-image-set(url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAsCAYAAABVLInsAAAAAXNSR0IArs4c6QAAAMhJREFUSA3tVsENwyAMxBULZI7OlG+zQkboCu03M3UORqB3KK4sS7VoH5EigYQw4MP28fBJrfWaUpoxJ8yeUeC0CYB3GL0gfbhkBYnITU+jFYGexFwip+jueCBrJEvTnvsnO63Zn+8OhalumAT3jvYdGS+/gFgVhQgPte0Kv8XujydnRLT8O3uQ4wix20GOZcPZgxxHiN0Ociwbzs7oFV0awPSU1nTI6i/CgXGpF2aKh9adtB/yJhrwpwZIJ/rHrxogqhN3/2uANx+qOgPN1ThFAAAAAElFTkSuQmCC") 2x) 4 11, auto`;
                }
                else if (data.url == '/note') {
                    cursor = `-webkit-image-set(url(data:image/png;base64,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) 2x) 11 10, auto`;
                }
                else if (data.url == '/pen') {
                    cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IArs4c6QAAA3JJREFUWAnNl99LU2EYx7edxcBQM0yIMLoY6OgihH5stZZ0LXgrm5sXMhTUxKQwuvGii/6ANBd4McSmFf1SvLOCgiIRQulitYuCZDVvHAZrtHn6fk/njbWpO9s5y1747tne877P8znP+7xn7zGZ/pNmriSHLMtH4N8J7Yc+Qm/MZrMMW9AqBgKIc4jmhaw5UaP4PgaYdE6f8tWS32HEb0C44ccPWScnJy29vb0HE4lEBr+boEu4boOtbGMmoAko1N3d/QDRuBRyQ0PD53g8PsZ+6ApUORg4d0EKRDAYvC8ghM2DuVoRGDhthG5BoZ6engKIXJi1tTWRmcsYr9SpITUCZy4EugbtS6fTW4uLi6yFbRtq5WhLS0tbTs1wV5l0g6gQAfiSYrHYT5vNZlleXn5lt9tXtyVBJ2FGR0cPqdfttLpAAMG7IYSlv7+/rrm5OTg/P79VU1MjFYNxOp0bBED7/tuU+UkI6DYU6uvrm4UbZXdIkpSem5tT+pPJ5DgysyKuCcsa4jyINXW4TARElOUzkBJsYGBgRgQQdjcY7ibMJQR3F2urvIbJu0LA646Z4XMlB4JP3vKaVgh4L4BJpVJKBuGDmeCTt7yWCzE4OFiwHPCqBM+3XKZoNKo8X+CD9mx5BPQsy6ch5Y5KgeDUrq6uh5jLmuD8Y3sNweU4bwjE0NBQhHeoVYFAQGSCEB49EKfUdIZ0QlwwBGJ4ePiu1ixwnN/vf4QbEM8JXRAnRSZ0QBBkbyA6OztFJnRD1OMulP1eaiZUCBalPggWE5y00VE4HL5TSk3kQbTSl64GiOsEwd/zSzjStE29Xu9jzBGZaNUFwMlwdoAQ+D8Yt1qtP9hVTEZDiIPRCQItLCxYMplM0dN1R0fH0+np6a+YwvPmDN5TXsDqan+BTE1NNRbzRohIJBLHOAHxvNgcTdexJDZoLJvNTlRXV69j0o7LAognGCtq4qKmABoH8XXwOGRdWlrKbG5u1ufPQ9q3HA7HOzwxV0dGRlg/zMQs+p/lj9XzmyBKfWDbilO1qaqqKul2u9/6fL5P7e3tmdraWkkNwmzdMxqCvs1I9U3YOo/H04RT+Dr+NRMulwvnGUl58eEgtATEQ/BrQHxhh9GNIDfg9E821ABZ2BjEd5MVBP+m9lfMEMQB7z6Iy/QB4p2/R/AU7D9rvwBzxlcCZz7mSQAAAABJRU5ErkJggg==) 2x) 1 16, auto`;
                }
                else {
                    cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAOdJREFUSA3tVsENwyAMLBULZI7O1G+7QlZJv5mpc2QE6kMgAUosG1nNI1hCkbHx2Qc6xd2UFkJ40JEnrSkd3ei7Oue+yRd97qKsOqkERQQNYE9lPcBxUprwhZXQ8vRi8B5gcXEucQBz7JjGBtWmdHLFrke139FejqHDGNVZDoN1IGo7qG61t06z96K2u9xpobv2UEVFwvvAPe1xeQIH51PuBN1ILDOkPZdqb5h4pQXwf1l8XJ46x5/DLEXNb6LNpzrvdo/zT7vjAcxdi2lsUG1KJ1fselRDq7W2p+1qye2hutX2qL3a7n9u0DPnQ0lkSwAAAABJRU5ErkJggg==) 2x) 8 8, auto`;
                }
                toolBoard.openCursor(this.page.root, cursor);
            })
        }
        else {
            var toolBoard = await getBoardTool();
            toolBoard.close();
        }
    }
    observeOutsideDrop() {
        var isMove: boolean = false;
        var self = this;
        var handle = self.page.kit.handle;
        this.el.shy_drop_move = function (type, data) {
            if (!isMove) {
                switch (type) {
                    case 'pageItem':
                        handle.isDown = true;
                        handle.isDrag = true;
                        break;
                }
                isMove = true;
            }
        }
        this.el.shy_drop_over = async function (type, data) {
            if (isMove) {
                switch (type) {
                    case 'pageItem':
                        if (handle.dropBlock) {
                            var ds = Array.isArray(data) ? data : [data];
                            await self.page.onBatchDargCreateBlocks(ds.map(d => {
                                return {
                                    url: '/link',
                                    icon: d.icon,
                                    pageId: d.id,
                                    sn: d.sn,
                                    text: d.text
                                }
                            }), handle.dropBlock, handle.dropDirection)
                            handle.onDropEnd();
                        }
                        break;
                }
            }
        }
        this.el.shy_end = function () {
            isMove = false;
            handle.onDropEnd();
        }
    }
    componentWillUnmount() {
        this.el.removeEventListener('keydown', this._keydown, true);
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup, true);
        document.removeEventListener('wheel', this._wheel)
        delete this.el.shy_drop_move;
        delete this.el.shy_drop_over;
        delete this.el.shy_end;
    }
    selectPageLayout() {
        return <div className="shy-page-view-first">
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.doc)}><span>页面</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.db)}><span>表格</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.board)}><span>白板</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.textChannel)}><span>会话</span></div>
            <div onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.textBroadcast)}><span>广播</span></div>
        </div>
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.configViewer.fontCss.lineHeight + 'px',
            letterSpacing: this.page.configViewer.fontCss.letterSpacing + 'px',
            fontSize: this.page.configViewer.fontCss.fontSize + 'px'
        }
        return <div className={'shy-page-view' + (this.page.readonly ? " shy-page-view-readonly" : "")} style={pageStyle} tabIndex={1}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
            onMouseEnter={e => this.page.onMouseenter(e)}
            onMouseLeave={e => this.page.onMouseleave(e)}
        ><div className='shy-page-view-box' onContextMenu={e => e.preventDefault()} onMouseDown={e => this.page.onMousedown(e.nativeEvent)}>
                <PageLayoutView
                    pageLayout={this.page.pageLayout}
                    boardSelector={<BlockPickerView picker={this.page.kit.picker}></BlockPickerView>}>
                    <div className='shy-page-view-content' ref={e => this.page.contentEl = e}>
                        <ChildsArea childs={this.page.views}></ChildsArea>
                        {this.page.requireSelectLayout && this.selectPageLayout()}
                    </div>
                </PageLayoutView>
            </div>
            <KitView kit={this.page.kit}></KitView>
        </div>
    }
}