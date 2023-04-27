import { CSSProperties, ReactNode } from "react";
import { EventsComponent } from "../../component/lib/events.component";
import React from "react";
import { PublishSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { Singleton } from "../../component/lib/Singleton";
import { PopoverPosition } from "../popover/position";
import { Block } from "../../src/block";
import { riseLayer } from "../../component/lib/zindex";
import { channel } from "../../net/channel";
import { Spin } from "../../component/view/spin";
import { FixedViewScroll } from "../../src/common/scroll";
import { Point } from "../../src/common/vector/point";

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
            zIndex: riseLayer.zoom(this)
        }
        if (this.visible == false) style.display = 'none';
        if (this.options.pos) {
            style.width = this.options.pos.roundArea.width;
            style.left = this.options.pos.roundArea.left;
            style.top = this.options.pos.roundArea.top + this.options.pos.roundArea.height;
        }
        return <div ref={e => this.el = e} className="pos" style={style}>
            <div className="flex flex-top padding-w-10 min-h-30 bg-white shadow border round-8">
                <span className="flex-fixed size-30 flex-center gap-r-10">
                    {this.asking && <Spin size={16}></Spin>}
                </span>
                <div className="flex-auto">
                    <textarea className='padding-h-5 min-h-20 clear-input resize-none w100' placeholder="告诉AI写什么" ref={e => this.textarea = e} defaultValue={this.ask} onInput={e => this.ask = (e.target as HTMLTextAreaElement).value} onKeyDown={this.keydown}  ></textarea>
                </div>
                <span className="size-30 flex-center flex-fixed gap-l-10">
                    <span onClick={e => this.onEnter()} className=" round size-24 flex-center cursor item-hover">
                        <Icon size={18} icon={PublishSvg}></Icon>
                    </span>
                </span>
            </div>
            <div>

            </div>
        </div>
    }
    textarea: HTMLTextAreaElement;
    keydown = (event: React.KeyboardEvent) => {
        var isShift = event.shiftKey;
        var key = event.key.toLowerCase();
        if (!isShift && key == 'enter') { this.onEnter(); event.preventDefault() }
    }
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
        if (this.textarea) this.textarea.value = '';
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
        // if (this.blocked == true) return;
        if (this.visible == true && this.el) {
            var target = event.target as HTMLElement;
            if (this.el.contains(target)) return;
            this.close();
        }
    }
    componentDidMount() {
        document.addEventListener('mousedown', this.onGlobalMousedown);
    }
    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onGlobalMousedown);
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

