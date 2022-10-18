import { Component } from "react";
import React from 'react';
import { Page } from "../index";
import { ChildsArea } from "../../block/view/appear";
import ReactDOM from "react-dom";
import { KitView } from "../../kit/view";
import { PageLayoutType } from "../declare";
import { getBoardTool } from "../../../extensions/board.tool";
import { Point, Rect } from "../../common/vector/point";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { PageLayoutView } from "./layout";
import { channel } from "../../../net/channel";
import { LinkPageItem } from "../../../extensions/at/declare";
import { PageCover } from "./cover";
import { Icon } from "../../../component/view/icon";
import { CollectTableSvg, CommentSvg, PageSvg } from "../../../component/svgs";
import { dom } from "../../common/dom";
import { PageOutLine } from "../../../blocks/page/outline";
import { BlockFactory } from "../../block/factory/block.factory";
import { ActionDirective } from "../../history/declare";

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
        channel.sync('/page/update/info', this.updatePageInfo);
        this.observeScroll();
        this.observeOutsideDrop();
        this.el.addEventListener('keydown', (this._keydown = e => this.page.onKeydown(e)), true);
        this.el.addEventListener('wheel', this._wheel = e => this.page.onWheel(e), {
            passive: false
        });
        document.addEventListener('mousedown', this._mousedown = this.page.onGlobalMousedown.bind(this));
        document.addEventListener('mousemove', (this._mousemove = this.page.onMousemove.bind(this.page)));
        document.addEventListener('mouseup', (this._mouseup = this.page.onMouseup.bind(this.page)));
        document.addEventListener('keyup', (this._keyup = this.page.onKeyup.bind(this.page)), true);
        this.observeToolBoard();
        this.AutomaticHandle();
    }
    updatePageInfo = (r: { id: string, pageInfo: LinkPageItem }) => {
        if (this.page.pageInfo?.id == r.id) {
            if (this.page.onceStopRenderByPageInfo == true) {
                this.page.onceStopRenderByPageInfo = false;
                return;
            }
            this.forceUpdate();
        }
    }
    async observeToolBoard() {
        if ([PageLayoutType.board, PageLayoutType.doc].includes(this.page.pageLayout.type)) {
            this.openPageToolBoard();
        }
        else {
            var toolBoard = await getBoardTool();
            toolBoard.close();
        }
    }
    async openPageToolBoard() {
        var toolBoard = await getBoardTool();
        if (this.page.isBoard) toolBoard.open({
            roundPoint: Point.from(this.el.getBoundingClientRect()).move(10, 10),
            relativeEleAutoScroll: this.page.root
        });
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
            else if (data.url == '/flow/mind') {
                cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAwCAYAAABe6Vn9AAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAtqSURBVHgBxVlpbBTJFa7uHnt8cBiDuDFjDhsBwTbHPyIMOIDClSBAIRFsspHCjygsCX9RGCPlJwSkiH/Z4Cj8AUFMElaGJNiAEhJWsCbhFsfgBXPKeAHbc/X0fl9N1dAMHrvHjNknlbq7uo7v1Xv16r1XhuiFamtrA4Zh/AGlGp8lKI2JROKXLS0tIfENUDZ4jPSKFStWBKLR6Beqo5s6fT7f3FOnTt0TH5D6wpOfn1/T1NQUclearnfDcRwjFovtY+fly5eL48ePi0OHDgm+s8627U/ZRnw4MsDMbzPhwb+DIk0o7g8TojVBMX6w49ixY+WP169fi7Vr17r7hSD+EJ4HweSZXKki5i+xLOsjvmLhqF4B/S8Dns6RI0eOOnLkiIP3BCt8rvGMBw8eWJMmTfoKYIcPGTIk9YMDpFEAEwY4MRZALFmyJHj69Ol68R6MYJxP8Lod45b01iYDnhIwY+EZF0nhOFLllBqZt2/fJoNXWHfgwAHx+PFj2bmhoUH2hjQ+A/DiSCSyAJ8fozSqgYNg6h43r8iemQCY4R4JEiCwtHDsnp6e6ZhrCDb/v/rCg4ePmoV+sk6qXDAYNFHy8OqfPXt2xejRo/+J92Fpc798+PDh0mfPnt0qLS2NgHmqZkJZoGaUAL5DALDYqwoqZppFUuIhlJ+gbwu+zWnTpuVhDn9lZWXFhAkT3sGDeV62t7fXPX/+/GZHR0dkw4YNcUjLNtPmsK5cudJ+9+7dNTAOp1XHV/F4/PO2trY1N2/ebEdnAxOlOhA8gNSgtBIYAVKFhAdyMdPKMRQzJL23Tc7JuTUetJN4QqHQ2lu3brUr7TLAjOyX6ohCCRWiFKMUoeSzDiQwWNzv9/dA1XpQ1x0IBMIYMMrxVZH7AFL6QkmqHuoS7IsZqOguPIJKMmSm082rC08R5i5EmwJYtTz1n3smjEI8XcSzYMGC2OHDhxNuleP+KVDM8FkAO+9TgG0MpgdgiaBIlXODrE2aSa56JyRbngbS3Y6SlOeZahdKa6IZ8hcXFxdirxSGw2G/SBoxYrYLCgrCJKh/F1VO40mp3Lx585xx48aRc658lB3ARIQFk4d1vVod29G70EVUGbWpabV+LDIQ/tXyibbHM+w3aYYnTpwYw2EeBW4CjkBSxMH3MDSBWCJgxgb21MJKsw3pJBTnmiGBQRJFRUXR7u5ugbMh4WLI5mQY0OkNLOppgniO1OK5r7c2+PcR2vH5Z5GZEsOGDbNxlMT0N3BYGiesoMQK4xG/ePFiggvMMQ3XJGLjxo0W7Tok5Xv06BE7myUlJUZnZ6etGLEV0wm1iqKurq4WKvE9DMaTLiAGRjQorVC/ei2xJD6DGkQcvlGjRlmwaBbwCOBJjBkzxsahGrt27RqxkKHEWwwpMtUKGOpdqyTNc4IapZlZuXLlCEhvFwb5ROSQAGz/8OHDg42NjZ1kCotsYpElFmx+A8ZI4hFKLcUbwyQXuDe/TBsKA0V/a/VyNDMQOTd/FTatWL9+vaiqqpJlIHTnzh1x9OhRcfLkSV3VWlhYuOTEiRMvXJgknqtXrxrK1dGMvR9x1RYvXrwfZtfZtGmTA9V0ckUci2Ny7KVLl+4XvS94n5RVBzKDPVOO5x1+ux3GXBHdm61bt0oXB3tzyZkzZ5qz6W96bUijUV9fb2Dj8kCULnyumSFxzHXr1iXBmeb3s8EosmlMiwMdtvCUG0VPOhhUXV2t51wj3hgqT+SJIVdQRxMqGYL9F4NFLuMyGZbNB8fTM1OeGDKSLp+lygclWFNLme3cMUQTPnPmTAN+kwVpfcm6y5cvi8Ei7c1jrqtPnjyx4Np47uuFIbkyOERN+E0WXPcmfre2torBomPHjsknrNxVPEy4NpY6E/slLww5lBAYMXCCk7G/60lpYnNNHFMfsAgo9VmUO6OgDIIDJ1FmhbBa/0Fc1MBzYseOHTllimNxTBLmOIiIlOqd8lyEB8a8cK79OhlwgeDtFI+ZNWvWn+D8zmADnkk04wO1fFRf7klKXR2oNxGN/hBO6FMYhS6EEWEsKMOGfl0dr6KkUciDa1L44sULBoBFMBCjZ8yY8XPETT8SOSRI5tD169d/h/36DJ9dKN2YOwwnNa7CnL6BCm/Edoyd/EgnFWIVZWiMkj958uRJWMGtkFYlgrEKMQCC9/EIjDS/fPmyGc7nf0Uy7pLhPsKEHlg6Soehi+MFaL/kcuOpdgVQuYKurq5ChOgM1X2Iai3kHph1NSC11UOHDg1CbS5eunTpZ3oMlZuQ+7GmpmYPmK999epV8MaNG39V/xIYj6BjjJIxRze+wzBEEeYLmNHxgtXnpZGKTiluDhoFMyaiWZPRLMJiJlN8ACRjFgBZxIMYK36c7RVYWdQCOnj/HPW1aLsK3434tgHeASMyCsXYYcwRHTFiRBRBnO0KF/qlrE5+ngVYVQcqwqjRASDp9sOkS4aRPxsLEAz6xNOnT3+Dti8SbKzyEKrEIb07APoDqGk5wP8bKtzGHAHqZZ4ADMocBlQwjn0rQ36vGLONN7Tp9KlCFcwDYz4ALAVDJwFsIhPsyO/tR15CwGgYeDp4Mk+RGmj+/PnbIZXteH2APOBymOwOqGoci0BR6tyFDvdThNsIevwCczhv0nhvA3yH+rqPUbG+NOV0HBESm3PmzClFrP8Z/n0L9W3nzp2bq8cGSDkmgOrhKU2jrKxsGAwKM65l+L6CQ/S7kFQHjgXmCmycd7bOE2TA8yvU30v3ILK6H3Ldx6QSlIhemeH5Pd4no9wH8BUA04ZEi4C6CP1MJ9aPHz++DAw36b4A+Z2zZ8/eFa48wbJly8qh0peIRznJQmXQiGcu8Lx1X5W+h0ys3Kd4VvOw3Lt3r1i9erXABmXcXwAdr4F6NJw/fz6A1V0LCe3FJL9G4WQhGIK6CxcuEFACqx1nYgWqp/ePNiryG/9tMNoxZcqUv+B7DYI5Jh9/ge+q8vJyPw9pzPUE86Tw7NmzR6xatSqFBwtQhTH+CIZ7lZBUI8Tz8m8/90Mpwmp1gpn9GHyfypQaqZuAZO5Nhx+99dUWVF7J4LFLZKBM90MLFy4cuXv3bkfn5XxuZrAqPtR7uR8KobSiXQsYaWhubnanfB03A5mYSf/HXDgkehCvtahnIpJqGFDYMt4PgRnyoDXAeevCC3GIhVP//xhsIe9jtmzZIgfS9zEAfwJS2CiSeWRK0vP54IVUkvEgLGIDLCLD/fxFixY1QRW/TTybN29Ox/M3kbS2XER58KbfPvgrKioqsVn/gUHeuY+Bvi7F9catbHyrgZC+r0K2NB8WrxIGhHiGp+H5CnjqiAfMRHCmxehtaKNgQN0sOIT58G7D+HEKK1HGg4/3QzAG/7t///7H2Ij30TaGSy8bqzkozJAwtjzrgCUP6d8I3KRTOIAnEQ/vh4DnMvD8VOGJwzjZ27Zts6GyTmpF8OB1BU31BJRpMImz8axWZRbrMOh4tgHzftUn60SgFwIDJla9oISJbFh4zo1CPFUKD887OsIT2IZt2Yd2wVQMabuvTSvvg+JgShZVF4fvJv9hr8mV6O1KJRe0c+dOMXXqVIdJeXgh2nVyu08xVWyoYoJt2Sd1I6JWm3uIt3elKJTEFDieXIXpKOWsw/VGqWrDtoMiHUXavWKIUgrNGAdDEVBYpuOdeKhJI114TN1RP+XVBTaiH3qbj5XJw/6xoMfyPgYnegxeAOMSfek1aHuIxLsg7BVaujzM7YejSq/egmvE1JaWUjQNj6NzClrdEmCGDcKQDuORbqGiRrr04o3TOOiE01/igTrFwQxv7LoQG3WDGWLqQeCnb/FSZ1D6GNqTpuWTJlyou1b1nqf+ZZVrfk8ykDWVeGiIXHhY8tS/fo2ToTI9ptpblteOg0TuCzidvTW/QTwflr4GPZjOW15KEW0AAAAASUVORK5CYII=) 2x) 11 10, auto`;
            }
            else {
                cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAOdJREFUSA3tVsENwyAMLBULZI7O1G+7QlZJv5mpc2QE6kMgAUosG1nNI1hCkbHx2Qc6xd2UFkJ40JEnrSkd3ei7Oue+yRd97qKsOqkERQQNYE9lPcBxUprwhZXQ8vRi8B5gcXEucQBz7JjGBtWmdHLFrke139FejqHDGNVZDoN1IGo7qG61t06z96K2u9xpobv2UEVFwvvAPe1xeQIH51PuBN1ILDOkPZdqb5h4pQXwf1l8XJ46x5/DLEXNb6LNpzrvdo/zT7vjAcxdi2lsUG1KJ1fselRDq7W2p+1qye2hutX2qL3a7n9u0DPnQ0lkSwAAAABJRU5ErkJggg==) 2x) 8 8, auto`;
            }
            toolBoard.openCursor(this.page.root, cursor);
        })
    }
    observeOutsideDrop() {
        var isMove: boolean = false;
        var self = this;
        var handle = self.page.kit.handle;
        this.el.shy_drop_move = function (type, data, ev) {
            if (!isMove) {
                switch (type) {
                    case 'pageItem':
                        handle.isDown = true;
                        handle.isDrag = true;
                        break;
                }
                isMove = true;
            }
            else {
                handle.onDropOverBlock(handle.kit.page.getBlockByMouseOrPoint(ev), ev);
            }
        }
        this.el.shy_drop_over = async function (type, data, ev) {
            if (isMove) {
                switch (type) {
                    case 'pageItem':
                        if (handle.dropBlock) {
                            var ds = Array.isArray(data) ? data : [data];
                            await self.page.onBatchDragCreateBlocks(ds.map(d => {
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
    observeScroll() {
        var predict = x => { return dom(x as HTMLElement).style('overflowY') == 'auto' }
        this.scrollDiv = dom(this.el).closest(predict) as any;
        if (this.scrollDiv) this.scrollDiv.addEventListener('scroll', this.scroll);
    }
    scroll = (e) => {
        var outLineBlock = this.page.find(g => g.url == BlockUrlConstant.Outline);
        if (outLineBlock) {
            (outLineBlock as PageOutLine).updateOutlinesHover()
        }
    };
    scrollDiv: HTMLElement;
    componentWillUnmount() {
        channel.off('/page/update/info', this.updatePageInfo);
        this.el.removeEventListener('keydown', this._keydown, true);
        document.removeEventListener('mousedown', this._mousedown);
        document.removeEventListener('mouseup', this._mouseup);
        document.removeEventListener('mousemove', this._mousemove);
        document.removeEventListener('keyup', this._keyup, true);
        document.removeEventListener('wheel', this._wheel)
        delete this.el.shy_drop_move;
        delete this.el.shy_drop_over;
        delete this.el.shy_end;
        if (this.scrollDiv) this.scrollDiv.removeEventListener('scroll', this.scroll);
    }
    renderPageTemplate() {
        return <div className="shy-page-view-template-picker" style={this.page.getScreenStyle()}>
            <div className="shy-page-view-template-picker-tip">回车开始编辑，或者从下方选择</div>
            <div className="shy-page-view-template-picker-items">
                <a onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.doc)}><Icon size={16} icon={PageSvg} ></Icon><span>页面</span></a>
                <a onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.db)}><Icon size={16} icon={CollectTableSvg} ></Icon><span>表格</span></a>
                {/*<a onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.board)}><Icon size={16} icon={BoardToolFrameSvg}></Icon><span>白板</span></a> */}
                <a onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.textChannel)}><Icon size={16} icon={CommentSvg}></Icon><span>会话</span></a>
                {/*<a onMouseDown={e => this.page.onPageTurnLayout(PageLayoutType.textBroadcast)}><span>广播</span></a> */}
            </div>
        </div>
    }
    renderNavs() {
        var isFirstDocTitle = this.page.views[0].childs[0].url == BlockUrlConstant.Title;
        return <div className={"shy-page-view-content-nav" + (this.page.isFullWidth ? "" : " shy-page-view-content-nav-center")}>
            <div className="shy-page-view-content-nav-left">
                <ChildsArea childs={[this.page.views[0]]}></ChildsArea>
            </div>
            <div className="shy-page-view-content-nav-right" style={{ top: 0, marginTop: isFirstDocTitle ? 70 : 0 }}>
                <ChildsArea childs={[this.page.views[1]]}></ChildsArea>
            </div>
        </div>
    }
    render() {
        var pageStyle: Record<string, any> = {
            lineHeight: this.page.lineHeight + 'px',
            fontSize: this.page.fontSize + 'px'
        }
        return <div className={'shy-page-view' + (this.page.readonly ? " shy-page-view-readonly" : "")}
            style={pageStyle}
            tabIndex={this.page.isCanEdit ? 1 : undefined}
            onFocusCapture={e => this.page.onFocusCapture(e.nativeEvent)}
            onBlurCapture={e => this.page.onBlurCapture(e.nativeEvent)}
            onMouseEnter={e => this.page.onMouseenter(e)}
            onMouseLeave={e => this.page.onMouseleave(e)}
        // onCopy={e =>this.page.onCopy(e)}
        // onCut={e =>this.page.onCut(e)}
        ><div className='shy-page-view-box' onContextMenu={e => this.page.onContextmenu(e)} onMouseDown={e => this.page.onMousedown(e)}>
                <PageLayoutView page={this.page}>
                    <div className='shy-page-view-content' ref={e => this.page.contentEl = e}>
                        <PageCover page={this.page}></PageCover>
                        {this.page.nav && this.renderNavs()}
                        {!this.page.nav && <ChildsArea childs={this.page.views}></ChildsArea>}
                        {this.page.requireSelectLayout && this.page.isCanEdit && this.renderPageTemplate()}
                    </div>
                </PageLayoutView>
            </div>
            <KitView kit={this.page.kit}></KitView>
        </div>
    }
    async AutomaticHandle() {
        await this.page.onAction(ActionDirective.AutomaticHandle, async () => {
            var isForceUpdate: boolean = false;
            if (this.page.pageLayout.type == PageLayoutType.doc && this.page.requireSelectLayout == false) {
                if (this.page.autoRefPages == true) {
                    if (!this.page.exists(g => g.url == BlockUrlConstant.RefLinks)) {
                        var view = this.page.views[0];
                        await this.page.createBlock(BlockUrlConstant.RefLinks, {}, view, view.blocks.childs.length, BlockChildKey.childs)
                        isForceUpdate = true;
                    }
                }
                if (this.page.autoRefSubPages == true) {
                    var oldSubPages = this.page.addedSubPages.map(c => c)
                    var items = await this.page.pageInfo.getSubItems();
                    this.page.addedSubPages = items.map(it => it.id);
                    var view = this.page.views[0];
                    oldSubPages.removeAll(c => items.exists(t => t.id == c));
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.page.createBlock(BlockUrlConstant.Link, { pageId: item.id }, view, view.blocks.childs.length, BlockChildKey.childs);
                        isForceUpdate = true;
                    });
                    if (oldSubPages.length > 0) {
                        var willRemoveItems = view.findAll(c => c.url == BlockUrlConstant.Link && oldSubPages.includes((c as any).pageId));
                        if (willRemoveItems.length > 0) {
                            //这些链接需要自动清理掉
                            await willRemoveItems.eachAsync(async r => {
                                await r.delete()
                            })
                        }
                    }
                }
            }
            if (this.page.requireSelectLayout == true) {
                var items = await this.page.pageInfo.getSubItems();
                if (items.length > 0) {
                    this.page.updateProps({
                        requireSelectLayout: false,
                        type: PageLayoutType.doc
                    })
                    var view = this.page.views[0];
                    items.removeAll(r => view.exists(c => c.url == BlockUrlConstant.Link && (c as any).pageId == r.id))
                    await items.eachAsync(async item => {
                        await this.page.createBlock(BlockUrlConstant.Link, { pageId: item.id }, view, view.blocks.childs.length, BlockChildKey.childs);
                    })
                    isForceUpdate = true;
                }
            }
            if (isForceUpdate = true) {
                this.forceUpdate()
            }
        })

    }
}