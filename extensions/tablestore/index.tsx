import React from "react";
import { Dragger } from "../../src/common/dragger";
import { Point, Rect, RectUtility } from "../../src/common/point";
import { EventsComponent } from "../../component/events.component";
import { Singleton } from "../Singleton";
import './style.less';

/**
 * 创建一个表格
 * 选择相对应的表模块
 * 
 */
export class TableStoreSelector extends EventsComponent {
    constructor(props) {
        super(props);
    }
    get isVisible() {
        return this.visible;
    }
    async open(rect: Rect) {
        this.point = rect.leftBottom;
        this.visible = true;
        let adjustPostion = () => {
            var el = this.el.querySelector(".sy-emoji-picker");
            if (el) {
                var bound = el.getBoundingClientRect();
                var newPoint = RectUtility.getChildRectPositionInRect(this.point, Rect.from(bound))
                if (!this.point.equal(newPoint)) {
                    this.point = newPoint;
                    this.forceUpdate()
                }
            }
        }
        // if (this.isLoaded == false) {
        //     this.forceUpdate();
        //     await this.import();
        //     this.forceUpdate(() => { adjustPostion() })
        // }
        // else 
        this.forceUpdate(() => { adjustPostion() })
    }
    close() {
        this.visible = false;
        this.forceUpdate();
    }
    private visible: boolean = false;
    private point: Point = new Point(0, 0);
    private el: HTMLElement;
    private text: string = '';
    render() {
        var style: Record<string, any> = {};
        style.top = this.point.y;
        style.left = this.point.x;
        return <div className='sy-table-store-box' ref={e => this.el = e}>
            {this.visible && <div className='sy-table-store-selector' style={style}>
                <input type='text' defaultValue={this.text} onChange={e => this.text = e.target.value} />
                <button onClick={e => this.onCreate()}>创建</button>
            </div>}
        </div>
    }
    private dragger: Dragger;
    private _mousedown: (event: MouseEvent) => void;
    componentDidMount() {
        this.dragger = new Dragger(this.el);
        this.dragger.bind();
        document.addEventListener('mousedown', this._mousedown = this.globalMousedown.bind(this), true);
    }
    componentWillUnmount() {
        if (this.dragger) this.dragger.off();
        if (this._mousedown) document.removeEventListener('mousedown', this._mousedown, true);
    }
    private isLoaded: boolean = false;
    private loading: boolean = false;
    private onClose() {
        this.close();
        this.emit('close');
    }
    private globalMousedown(event: MouseEvent) {
        var target = event.target as HTMLElement;
        if (this.el.contains(target)) return;
        if (this.visible == true) {
            this.onClose()
        }
    }
    onCreate() {
        this.emit('create', { text: this.text });
        this.close();
    }
    async import() {

    }
}

export async function OpenTableStoreSelector(rect: Rect) {
    var selector = await Singleton<TableStoreSelector>(TableStoreSelector);
    await selector.open(rect);
    return new Promise((resolve: (data: any) => void, reject) => {
        selector.only('create', (data) => {
            resolve(data);
        });
        selector.only('close', () => {
            resolve(null);
        })
    })
}
