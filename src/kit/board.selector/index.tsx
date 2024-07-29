import React, { CSSProperties } from "react";
import { ReactNode } from "react";
import { Kit } from "..";
import { getImageSize, OpenFileDialoug, OpenMultipleFileDialoug } from "../../../component/file";
import { ShyAlert } from "../../../component/lib/alert";
import {
    BoardToolTextSvg,
    BoardToolStickerSvg,
    BoardToolSharpSvg,
    ConnetLineSvg,
    BoardToolFrameSvg,
    MindSvg,
    BoardCardSvg,
    BoardArrowCurveSvg,
    BoardArrowNoneSvg,
    BoardArrowPolylineSvg,
    BoardArrowSvg,
    BoardFrame34Svg,
    BoardFrame43Svg,
    BoardFrame11Svg,
    BoardFrame169Svg,
    BoardFrameA4Svg,
    BoardFramePadSvg,
    BoardFrameWebSvg,
    BoardFramePhoneSvg,
    UploadSvg,
    DotsSvg
} from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { closeNoteSelector, getNoteSelector } from "../../../extensions/board/note";
import { closeShapeSelector, getShapeSelector } from "../../../extensions/board/shapes";
import { BlockUrlConstant } from "../../block/constant";
import { FixedViewScroll } from "../../common/scroll";
import { Point, Rect } from "../../common/vector/point";
import { BoardToolOperator } from "./declare";
import { Tip } from "../../../component/view/tooltip/tip";
import { S } from "../../../i18n/view";
import { Page } from "../../page";
import { Block } from "../../block";
import { ToolTip } from "../../../component/view/tooltip";
import { openMaterialView } from "../../../extensions/board/material";

export class BoardSelector extends React.Component<{
    kit: Kit
}> {
    constructor(props) {
        super(props);
        // this.fvs.on('change', (offset: Point) => {
        //     if (this.visible == true && this.el)
        //         this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        // })
    }
    private fvs: FixedViewScroll = new FixedViewScroll();
    el: HTMLElement;
    render(): ReactNode {
        if (this.visible == false) return <div className="shy-kit-board-selector"></div>;
        var style: CSSProperties = {};
        if (this.point) {
            style.top = this.point.y;
            style.right = this.point.x;
        }
        return <div className="shy-kit-board-selector"><div className="z-1000 pos w-40 padding-h-5  round-4 border shadow-s bg-white r-size-30 r-gap-l-5 r-gap-t-5 r-gap-b-5 r-item-hover r-round-4 r-cursor r-flex-center  "
            ref={e => this.el = e}
            style={style}>
            <Tip text='文本' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.text ? "item-hover-focus" : ""}
                onMouseDown={e => {
                    e.stopPropagation();
                    this.selector(BoardToolOperator.text, e);
                }}>
                <Icon size={18} icon={BoardToolTextSvg} />
            </div></Tip>

            <Tip text='便签' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.note ? "item-hover-focus" : ""}
                onMouseDown={e => {
                    e.stopPropagation();
                    this.selector(BoardToolOperator.note, e);
                }}>
                <Icon size={18} icon={BoardToolStickerSvg} />
            </div></Tip>

            <Tip text='文档' placement={'left'}>
                <div
                    className={this.openSelector == BoardToolOperator.card ? "item-hover-focus" : ""}
                    onMouseDown={e => {
                        e.stopPropagation();
                        this.selector(BoardToolOperator.card, e)
                    }}>
                    <Icon size={18} icon={BoardCardSvg} />
                </div>
            </Tip>

            <Tip text='形状' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.shape ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.shape, e) }}>
                <Icon size={18} icon={BoardToolSharpSvg}></Icon>
            </div></Tip>

            <Tip text='连线' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.connect ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.connect, e) }}>
                <Icon size={18} icon={ConnetLineSvg}></Icon>
            </div></Tip>

            <Tip text='画笔' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.pen ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.pen, e) }}>
                <Icon size={18} icon={{ name: 'bytedance-icon', code: 'writing-fluently' }}></Icon>
            </div></Tip>

            <Tip text='容器' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.frame ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.frame, e) }}>
                <Icon size={18} icon={{ name: 'byte', code: 'rectangle-one' }}></Icon>
            </div></Tip>

            {/* <Tip overlay={<S>上传图片、视频、文件</S>} placement={'left'}><div
                className={this.openSelector == BoardToolOperator.upload ? "item-hover-focus" : ""}
                onMouseDown={e => {
                    e.stopPropagation();
                    this.selector(BoardToolOperator.upload, e)
                }}>
                <Icon size={18} icon={UploadSvg}></Icon>
            </div></Tip> */}

            <Tip text='表格' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.table ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.table, e) }}>
                <Icon size={18} icon={{ name: 'byte', code: 'insert-table' }}></Icon>
            </div></Tip>

            <Tip text='思维导图' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.mind ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.mind, e) }}>
                <Icon size={18} icon={MindSvg}></Icon>
            </div></Tip>

            <Tip text='更多创作工具' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.more ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.more, e) }}>
                <Icon size={22} icon={DotsSvg}></Icon>
            </div></Tip>
            <div className="border-top" style={{ margin: 5, height: 1, }}></div>
            <Tip text='素材库' placement={'left'}><div
                className={this.openSelector == BoardToolOperator.material ? "item-hover-focus" : ""}
                onMouseDown={e => { e.stopPropagation(); this.selector(BoardToolOperator.material, e) }}>
                <Icon size={18} icon={{ name: 'byte', code: 'material' }}></Icon>
            </div></Tip>
        </div>
            {this.renderSelectProps()}
        </div>
    }
    renderSelectProps() {
        var style: CSSProperties = {};
        if (this.openSelector == BoardToolOperator.connect) {
            if (this.point) {
                style.top = this.point.y + 100;
                style.right = this.point.x + 60;
            }
            return <div style={style} className="z-1000 pos w-40 padding-h-5  round-4 border-light shadow bg-white r-size-30 r-gap-l-5 r-gap-t-5 r-gap-b-5 r-item-hover r-round-4 r-cursor r-flex-center  ">
                <div onMouseDown={e => {
                    this.currentSelector.data.lineType = 'straight';
                    this.currentSelector.data.lineStart = 'none';
                    this.currentSelector.data.lineEnd = '2';
                    e.stopPropagation();
                }}><Icon size={32} icon={BoardArrowSvg}></Icon></div>
                <div onMouseDown={e => {
                    this.currentSelector.data.lineType = 'straight';
                    this.currentSelector.data.lineStart = 'none';
                    this.currentSelector.data.lineEnd = 'none';
                    e.stopPropagation();
                }}><Icon size={32} icon={BoardArrowNoneSvg}></Icon></div>
                <div onMouseDown={e => {
                    this.currentSelector.data.lineType = 'curve';
                    this.currentSelector.data.lineStart = 'none';
                    this.currentSelector.data.lineEnd = '2';
                    e.stopPropagation();
                }}><Icon size={32} icon={BoardArrowCurveSvg}></Icon></div>
                <div onMouseDown={e => {
                    this.currentSelector.data.lineType = 'line';
                    this.currentSelector.data.lineStart = 'none';
                    this.currentSelector.data.lineEnd = '2';
                    e.stopPropagation();
                }}><Icon size={32} icon={BoardArrowPolylineSvg}></Icon></div>
                {/* <div><Icon size={18} icon={BoardArrowFilletSvg}></Icon></div> */}
            </div>
        }
        else if (this.openSelector == BoardToolOperator.frame) {
            if (this.point) {
                style.top = this.point.y + 100;
                style.right = this.point.x + 60;
                style.width = 3 * 55 + 5;
            }
            return <div style={style} className="z-1000 pos  padding-h-5  round-4 border-light shadow bg-white   ">
                <div>
                    <div className="gap-w-5 remark f-12"><S>画板</S></div>
                    <div className="flex flex-wrap f-12 r-w-50 r-gap-l-5  r-item-hover r-round-4 r-cursor r-flex-center r-flex-col">

                        <div style={{ height: 58 }} onMouseDown={e => {
                            this.currentSelector.data.frameFormat = 'none';
                        }}>
                            <Icon size={20} icon={BoardToolFrameSvg}></Icon>
                            <span><S>画板</S></span>
                        </div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = '3:4';
                            this.currentSelector.data.fixedWidth = 300;
                            this.currentSelector.data.fixedHeight = 400;
                        }}><Icon size={32} icon={BoardFrame34Svg}></Icon>
                            <span>3:4</span>
                        </div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = '4:3';
                            this.currentSelector.data.fixedWidth = 400;
                            this.currentSelector.data.fixedHeight = 300;
                        }}><Icon size={32} icon={BoardFrame43Svg}></Icon>
                            <span>4:3</span>
                        </div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = '1:1';
                            this.currentSelector.data.fixedWidth = 300;
                            this.currentSelector.data.fixedHeight = 300;
                        }}><Icon size={32} icon={BoardFrame11Svg}></Icon>
                            <span>1:1</span></div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = '16:9';
                            this.currentSelector.data.fixedWidth = 400;
                            this.currentSelector.data.fixedHeight = 225;
                        }}><Icon size={32} icon={BoardFrame169Svg}></Icon>
                            <span>16:9</span></div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = 'A4';
                            this.currentSelector.data.fixedWidth = 210;
                            this.currentSelector.data.fixedHeight = 297;
                        }}><Icon size={32} icon={BoardFrameA4Svg}></Icon>
                            <span>A4</span></div>
                    </div>
                </div>
                <div>
                    <div className="gap-w-5 remark f-12"><S>原型</S></div>
                    <div className="flex  flex-wrap f-12  r-w-50 r-gap-l-5  r-item-hover r-round-4 r-cursor r-flex-center r-flex-col">

                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = 'phone';
                            this.currentSelector.data.fixedWidth = 375;
                            this.currentSelector.data.fixedHeight = 812;
                        }}>
                            <Icon size={32} icon={BoardFramePhoneSvg}></Icon>
                            <span>Phone</span>
                        </div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = 'pad';
                            this.currentSelector.data.fixedWidth = 768;
                            this.currentSelector.data.fixedHeight = 1024;
                        }}>
                            <Icon size={32} icon={BoardFramePadSvg}></Icon>
                            <span>Pad</span>
                        </div>
                        <div onMouseDown={e => {
                            this.currentSelector.data.frameFormat = 'web';
                            this.currentSelector.data.fixedWidth = 1440;
                            this.currentSelector.data.fixedHeight = 1024;
                        }}>
                            <Icon size={32} icon={BoardFrameWebSvg}></Icon>
                            <span>Web</span>
                        </div>
                    </div>
                </div>
            </div>
        }
        else if (this.openSelector == BoardToolOperator.more) {
            if (this.point) {
                style.top = this.point.y + 100;
                style.right = this.point.x + 60;
                // style.width = 3 * 55 + 5;
            }
            return <div style={style} className="z-1000 pos w-100 padding-h-5  round-4 border-light shadow bg-white   r-gap-5 r-padding-5  r-item-hover r-round-4 r-cursor r-flex-center r-flex-col ">

                <ToolTip overlay={<S>上传文件</S>}><div onMouseDown={async e => {
                    e.stopPropagation();
                    var file = await OpenFileDialoug();
                    if (file) this.openFile(file)
                    else this.clearSelector()
                }}><Icon size={24} icon={UploadSvg}></Icon>
                    <div className="flex-center remark f-14"><S>上传文件</S></div>
                </div>
                </ToolTip>

                <ToolTip overlay={<S>插入图片</S>}><div
                    onMouseDown={async e => {
                        e.stopPropagation();
                        var file = await OpenFileDialoug({ exts: ['image/*'] });
                        if (file) this.openFile(file)
                        else this.clearSelector()
                    }}>
                    <Icon size={24} icon={{ name: 'byte', code: 'add-picture' }}></Icon>
                    <div className="flex-center remark f-14"><S>插入图片</S></div>
                </div></ToolTip>

                <ToolTip overlay={<S>内嵌网页</S>}><div onMouseDown={e => {
                    e.stopPropagation();
                    this.currentSelector.url = BlockUrlConstant.Embed
                }}><Icon size={24} icon={{ name: 'byte', code: 'browser' }}></Icon>
                    <div className="flex-center remark f-14"><S>内嵌网页</S></div>
                </div></ToolTip>

                {/* <ToolTip overlay={<S>代码块</S>}><div onMouseDown={e => {
                    this.currentSelector.url = BlockUrlConstant.Code;
                    e.stopPropagation();
                }}><Icon size={24} icon={{ name: 'byte', code: 'code' }}></Icon>
                    <div className="flex-center remark f-14"><S>代码块</S></div>
                </div></ToolTip> */}

                <ToolTip overlay={<S>LaTex公式</S>}><div onMouseDown={e => {
                    this.currentSelector.url = BlockUrlConstant.Katex;
                    e.stopPropagation();
                }}><Icon size={24} icon={{ name: 'byte', code: 'formula' }}></Icon>
                    <div className="flex-center remark f-14"><S>LaTex公式</S></div>
                </div></ToolTip>
            </div>
        }
        else return <></>
    }
    currentSelector: { url: string, data?: Record<string, any>, event: React.MouseEvent }
    openSelector: BoardToolOperator = null;
    get isSelector() {
        if (this.currentSelector) return true;
        else return false;
    }
    async selector(operator: BoardToolOperator, event: React.MouseEvent) {
        if (operator == BoardToolOperator.arrow) {
            this.currentSelector = null;
            this.openSelector = null;
        }
        else {
            if (this.openSelector == operator) {
                this.clearSelector();
                return;
            }
            else this.clearSelector();
            this.openSelector = operator;
            this.forceUpdate();
            var sel: Record<string, any> = { event };
            switch (operator) {
                case BoardToolOperator.text:
                    sel.url = BlockUrlConstant.TextSpan;
                    break;
                case BoardToolOperator.shape:
                    sel.url = BlockUrlConstant.Shape;
                    var shapeSelector = await getShapeSelector();
                    shapeSelector.only('selector', async (data) => {
                        if (this.currentSelector && this.currentSelector.url == BlockUrlConstant.Shape) {
                            this.currentSelector.data = { svg: data.svg, svgName: data.name };
                        }
                        shapeSelector.close();
                    });
                    var rect = Rect.fromEle(this.el);
                    shapeSelector.open(rect.leftTop.move(-180, 0));
                    break;
                case BoardToolOperator.note:
                    sel.url = BlockUrlConstant.Note;
                    var noteSelector = await getNoteSelector();
                    noteSelector.only('selector', (data) => {
                        if (this.currentSelector && this.currentSelector.url == BlockUrlConstant.Note) {
                            this.currentSelector.data = { color: data.color };
                        }
                        noteSelector.close();
                    });
                    var rect = Rect.fromEle(this.el);
                    noteSelector.open(rect.leftTop.move(-104, 0));
                    break;
                case BoardToolOperator.connect:
                    sel.url = BlockUrlConstant.Line;
                    sel.data = {}
                    break;
                case BoardToolOperator.frame:
                    sel.url = BlockUrlConstant.Frame;
                    sel.data = {}
                    break;
                case BoardToolOperator.table:
                    sel.url = BlockUrlConstant.Table;
                    break;
                case BoardToolOperator.pen:
                    sel.url = BlockUrlConstant.Pen;
                    break;
                case BoardToolOperator.material:
                    var mv = await openMaterialView();
                    mv.only('save', async (data) => {
                        console.log('ddd', data);
                        if (data.mime == 'image') {
                            this.currentSelector.url = BlockUrlConstant.BoardImage;
                            if (!this.currentSelector.data)
                                this.currentSelector.data = {};
                            this.currentSelector.data.initialData = { imageUrl: data.url };
                        }
                        else if (data.mime == 'icon' || data.mime == 'emoji') {
                            this.currentSelector.url = BlockUrlConstant.Icon;
                            this.currentSelector.data.src = data.data as any;
                        }
                        mv.close();
                    });
                    mv.only('close', () => {

                    })
                    var rect = Rect.fromEle(this.el);
                    mv.open(rect.leftTop.move(-330, 0));
                    break;
                case BoardToolOperator.mind:
                    sel.url = BlockUrlConstant.Mind;
                    break;
                case BoardToolOperator.card:
                    sel.url = BlockUrlConstant.BoardPageCard;
            }
            this.currentSelector = sel as any;
            console.log(this.currentSelector, 'cs...');
        }
        var cursor: string = '';
        if (this.currentSelector.url == BlockUrlConstant.TextSpan) {
            cursor = `-webkit-image-set(url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAsCAYAAABVLInsAAAAAXNSR0IArs4c6QAAAMhJREFUSA3tVsENwyAMxBULZI7OlG+zQkboCu03M3UORqB3KK4sS7VoH5EigYQw4MP28fBJrfWaUpoxJ8yeUeC0CYB3GL0gfbhkBYnITU+jFYGexFwip+jueCBrJEvTnvsnO63Zn+8OhalumAT3jvYdGS+/gFgVhQgPte0Kv8XujydnRLT8O3uQ4wix20GOZcPZgxxHiN0Ociwbzs7oFV0awPSU1nTI6i/CgXGpF2aKh9adtB/yJhrwpwZIJ/rHrxogqhN3/2uANx+qOgPN1ThFAAAAAElFTkSuQmCC") 2x) 4 11, auto`;
        }
        else if (this.currentSelector.url == BlockUrlConstant.Note) {
            cursor = `-webkit-image-set(url(data:image/png;base64,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) 2x) 11 10, auto`;
        }
        else if (this.currentSelector.url == BlockUrlConstant.Pen) {
            cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IArs4c6QAAA3JJREFUWAnNl99LU2EYx7edxcBQM0yIMLoY6OgihH5stZZ0LXgrm5sXMhTUxKQwuvGii/6ANBd4McSmFf1SvLOCgiIRQulitYuCZDVvHAZrtHn6fk/njbWpO9s5y1747tne877P8znP+7xn7zGZ/pNmriSHLMtH4N8J7Yc+Qm/MZrMMW9AqBgKIc4jmhaw5UaP4PgaYdE6f8tWS32HEb0C44ccPWScnJy29vb0HE4lEBr+boEu4boOtbGMmoAko1N3d/QDRuBRyQ0PD53g8PsZ+6ApUORg4d0EKRDAYvC8ghM2DuVoRGDhthG5BoZ6engKIXJi1tTWRmcsYr9SpITUCZy4EugbtS6fTW4uLi6yFbRtq5WhLS0tbTs1wV5l0g6gQAfiSYrHYT5vNZlleXn5lt9tXtyVBJ2FGR0cPqdfttLpAAMG7IYSlv7+/rrm5OTg/P79VU1MjFYNxOp0bBED7/tuU+UkI6DYU6uvrm4UbZXdIkpSem5tT+pPJ5DgysyKuCcsa4jyINXW4TARElOUzkBJsYGBgRgQQdjcY7ibMJQR3F2urvIbJu0LA646Z4XMlB4JP3vKaVgh4L4BJpVJKBuGDmeCTt7yWCzE4OFiwHPCqBM+3XKZoNKo8X+CD9mx5BPQsy6ch5Y5KgeDUrq6uh5jLmuD8Y3sNweU4bwjE0NBQhHeoVYFAQGSCEB49EKfUdIZ0QlwwBGJ4ePiu1ixwnN/vf4QbEM8JXRAnRSZ0QBBkbyA6OztFJnRD1OMulP1eaiZUCBalPggWE5y00VE4HL5TSk3kQbTSl64GiOsEwd/zSzjStE29Xu9jzBGZaNUFwMlwdoAQ+D8Yt1qtP9hVTEZDiIPRCQItLCxYMplM0dN1R0fH0+np6a+YwvPmDN5TXsDqan+BTE1NNRbzRohIJBLHOAHxvNgcTdexJDZoLJvNTlRXV69j0o7LAognGCtq4qKmABoH8XXwOGRdWlrKbG5u1ufPQ9q3HA7HOzwxV0dGRlg/zMQs+p/lj9XzmyBKfWDbilO1qaqqKul2u9/6fL5P7e3tmdraWkkNwmzdMxqCvs1I9U3YOo/H04RT+Dr+NRMulwvnGUl58eEgtATEQ/BrQHxhh9GNIDfg9E821ABZ2BjEd5MVBP+m9lfMEMQB7z6Iy/QB4p2/R/AU7D9rvwBzxlcCZz7mSQAAAABJRU5ErkJggg==) 2x) 1 16, auto`;
        }
        else if (this.currentSelector.url == BlockUrlConstant.Mind) {
            cursor = `-webkit-image-set(url(data:image/png;base64,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) 2x) 11 10, auto`;
        }
        else {
            cursor = `-webkit-image-set(url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IArs4c6QAAAOdJREFUSA3tVsENwyAMLBULZI7O1G+7QlZJv5mpc2QE6kMgAUosG1nNI1hCkbHx2Qc6xd2UFkJ40JEnrSkd3ei7Oue+yRd97qKsOqkERQQNYE9lPcBxUprwhZXQ8vRi8B5gcXEucQBz7JjGBtWmdHLFrke139FejqHDGNVZDoN1IGo7qG61t06z96K2u9xpobv2UEVFwvvAPe1xeQIH51PuBN1ILDOkPZdqb5h4pQXwf1l8XJ46x5/DLEXNb6LNpzrvdo/zT7vjAcxdi2lsUG1KJ1fselRDq7W2p+1qye2hutX2qL3a7n9u0DPnQ0lkSwAAAABJRU5ErkJggg==) 2x) 8 8, auto`;
        }
        this.openCursor(cursor);
    }
    openFile(file: File) {
        if (file.type.startsWith('image/')) {
            this.currentSelector.url = BlockUrlConstant.BoardImage;
        }
        else if (file.type.startsWith('video/')) {
            this.currentSelector.url = BlockUrlConstant.Video;
        }
        else if (file.type.startsWith('audio/')) {
            this.currentSelector.url = BlockUrlConstant.Audio;
        }
        else
            this.currentSelector.url = BlockUrlConstant.File;
        if (!this.currentSelector.data) this.currentSelector.data = {};
        this.currentSelector.data.initialData = { file };
    }
    clearSelector() {
        delete this.currentSelector;
        this.openSelector = null;
        this.closeCursor();
        closeNoteSelector();
        closeShapeSelector();
        this.forceUpdate();
    }
    private point: Point;
    visible: boolean = false;
    page?: Page;
    boardBlock?: Block;
    onShow(viewEl: HTMLElement, options?: {
        page: Page,
        block?: Block

    }) {
        if (this.cursorEl !== viewEl) {
            this.cursorEl = viewEl;

            this.page = options?.page;
            this.boardBlock = options?.block;
            if (!this.boardBlock && this.page) {
                var po = new Point(20, 20);
                this.point = po;
            }
            else {
                var sd = this.page.getScrollDiv();
                var re = Rect.fromEle(sd)
                var vb = this.boardBlock.getVisibleContentBound();
                var y = vb.top - re.top + sd.scrollTop;
                this.point = new Point(re.right - vb.right - 60, y)
            }
            this.visible = true;
            this.forceUpdate();
        }
        else {
            this.visible = true;
            this.forceUpdate();
        }
    }
    close() {
        this.visible = false;
        this.boardBlock = null;
        this.clearSelector();
        this.forceUpdate();
    }
    private cursorEl: HTMLElement;
    openCursor(cursor: string) {
        if (this.cursorEl?.style) this.cursorEl.style.cursor = cursor;
    }
    closeCursor() {
        if (this.cursorEl?.style) {
            this.cursorEl.style.cursor = 'default';
        }
    }
}
export interface BoardSelector {
    emit(name: 'selector', data: BoardSelector['currentSelector']);
    only(name: 'selector', fn: (data: BoardSelector['currentSelector']) => void)
}
