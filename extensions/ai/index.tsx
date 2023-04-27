import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { Edit1Svg, PublishSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../popover/position";
import { Block } from "../../src/block";
import { riseLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point } from "../../src/common/vector/point";
import { DivInput } from "../../component/view/input/div";
import { MenuView } from "../../component/view/menu/menu";
import { MenuItem, MenuItemType } from "../../component/view/menu/declare";

export type AIToolType = {
    block?: Block,
    pos?: PopoverPosition,
    callback?: (text: string, done?: boolean, aiTool?: AITool) => void
}
export class AITool extends EventsComponent {
    constructor(props) {
        super(props);
        this.fvs.on('change', (offset: Point) => {
            if (this.visible == true && this.el)
                this.el.style.transform = `translate(${offset.x}px,${offset.y}px)`
        })
    }
    el: HTMLDivElement;
    private fvs: FixedViewScroll = new FixedViewScroll();
    render(): ReactNode {
        var style: CSSProperties = {
            pointerEvents: 'visible'
        }
        if (this.visible == false) style.display = 'none';
        if (this.options.pos) {
            style.width = this.options.pos.roundArea.width;
            style.left = this.options.pos.roundArea.left;
            style.top = this.options.pos.roundArea.top + this.options.pos.roundArea.height;
        }
        return <div
            style={{
                position: 'absolute',
                zIndex: riseLayer.zoom(this),
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                overflow: 'hidden'
            }}><div
                ref={e => this.el = e}
                className="pos"
                style={style}>
                <div className="flex flex-top padding-w-10 min-h-30 bg-white shadow-1  round-8">
                    <span className="flex-fixed size-30 gap-t-5 flex-center gap-r-10">
                        {this.asking && <Spin size={16}></Spin>}
                    </span>
                    <div className="flex-auto">
                        <DivInput
                            value={this.ask}
                            rf={e => this.textarea = e}
                            onInput={this.onInput}
                            onEnter={this.onEnter}
                            className='padding-h-10 min-h-20'
                            placeholder="告诉AI写什么" ></DivInput>
                    </div>
                    <span className="size-30  gap-t-5 flex-center flex-fixed gap-l-10">
                        <span onClick={e => this.onEnter()} className=" round size-24 flex-center cursor item-hover">
                            <Icon size={18} icon={PublishSvg}></Icon>
                        </span>
                    </span>
                </div>
                <div className="gap-t-10 shadow-1 w-300 bg-white   round-8">
                    {this.renderItems()}
                </div>
            </div></div>
    }
    renderItems() {
        async function select(item) {
            if (item?.name == 'table') {
                // self.onChange(item.value);
                // self.emit('save', item.value);
            }
            else if (item?.name == 'view') {
                // self.emit('save', item.value);
            }
            else if (item?.name == 'deleteTable') {
                //
            }
        }
        function click(item) {

        }
        async function input(item) {

        }
        var items: MenuItem[] = [
            { text: '用AI写作', type: MenuItemType.text },
            { name: 'continue', text: '用AI续写...', icon: Edit1Svg },
            { type: MenuItemType.divide },
            { text: '基于页面生成', type: MenuItemType.text },
            {
                name: 'summary', text: '页面内容总结', icon: Edit1Svg
            },
            {
                text: "翻译", childs: [
                    { text: '中文', name: 'Chinese' },
                    { text: '英文', name: 'English' },
                    { text: '日文', name: 'Japlese' },
                    { text: '韩文', name: 'Korean' }
                ],
                icon: Edit1Svg
            }
        ];
        return <MenuView ref={e => this.mv = e}
            input={input}
            select={select}
            click={click} style={{
                width: 300,
                maxHeight: 300,
                paddingTop: 10,
                paddingBottom: 30,
                overflowY: 'auto'
            }} items={items}></MenuView>
    }
    mv: MenuView = null;
    onInput = (e) => {
        this.ask = e;
    }
    textarea: HTMLElement;
    ask: string = '';
    asking: boolean = false;
    anwser: string = '';
    onEnter() {
        this.aiText(this.ask)
    }
    options: AIToolType = {
        block: null,
        pos: null,
        callback: null
    }
    open(options: AIToolType) {
        if (options.pos.relativeEleAutoScroll) this.fvs.bind(options.pos.relativeEleAutoScroll);
        this.asking = false;
        this.visible = true;
        this.anwser = '';
        this.options = options;
        if (this.textarea) this.textarea.innerText = '';
        this.forceUpdate(() => {
            if (this.textarea)
                this.textarea.focus()
        })
    }
    async aiText(content: string, callback?: AIToolType['callback']) {
        var self = this;
        this.asking = true;
        self.anwser = '';
        this.forceUpdate()
        await channel.post('/text/ai/stream', {
            question: content,
            callback(str, done) {
                if (typeof str == 'string') self.anwser += str;
                if (typeof self.options.callback == 'function')
                    self.options.callback(str, done, self)
                if (typeof callback == 'function') callback(str, done, self)
                if (done) {
                    self.asking = false;
                    self.forceUpdate();
                }
            }
        });
    }
    updatePosition(options: AIToolType) {
        this.el.style.top = (options.pos.roundArea.top + options.pos.roundArea.height) + 'px';
    }
    visible: boolean = false;
    onGlobalMousedown = (event: MouseEvent) => {
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            console.log('closee');
            this.close();
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown, true);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown, true);
    }
    close() {
        if (this.visible == true) {
            this.fvs.unbind();
            this.visible = false;
            this.forceUpdate();
            this.emit('close');
        }
    }
}

export var aiTool: AITool;
export async function useAITool(options: AIToolType) {
    aiTool = await Singleton(AITool);
    aiTool.open(options);
    return new Promise((resolve: (d: { ask: string, aiTool: AITool }) => void, reject) => {
        aiTool.only('save', d => {
            resolve(d)
        })
        aiTool.only("close", () => {
            resolve(null);
        })
    })
}

