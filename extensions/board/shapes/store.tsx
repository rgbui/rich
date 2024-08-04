import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { ShapeType } from "./shapes";
import { ShySvg } from "../../../src/block/svg";
import { S } from "../../../i18n/view";
import { useShapeShop } from "./shop";
import { channel } from "../../../net/channel";
import { util } from "../../../util/util";
const SHAPE_STORE_LIST = '_shape_store_list_';
import lodash from "lodash";

class ShapeStoreView extends EventsComponent {
    renderChilds(childs) {
        return childs.map((s, index) => {

            if (s.text && Array.isArray(s.childs) && s.childs.length > 0) {
                return <div key={index}>
                    <div className="h-20 remark f-12 ">{s.text}</div>
                    <div className="flex flex-wrap">{this.renderChilds(s.childs)}</div>
                </div>
            }
            if (s.src) return <div onMouseDown={e => this.onMousedown({src:s.src}, e)} className="size-30 gap-r-10 gap-b-10" key={index}>
                <img src={s.src} draggable={false} className="obj-center w100 h100" />
            </div>
            var sb = new ShySvg();
            sb.load(s);
            return <div onMouseDown={e => this.onMousedown({svg:s}, e)} className="size-30 gap-b-10 gap-r-10 item-hover-light flex-center round" key={index}>
                {sb.render({
                    strokeWidth: 1,
                    attrs: {
                        stroke: 'black',
                        strokeWidth: 1,
                        fill: 'none'
                    }
                })}
            </div>
        })
    }
    render() {
        return <div
            className="relative w-250 max-h-500 overflow-y min-h-160 bg-white shadow border  round-4  padding-5 ">
            <div >
                {this.shapeList.map((si, i) => {
                    return <div key={i}>
                        <div className="flex">
                            <span className="flex-fixed"></span>
                            <span className="flex-auto">{si.text}</span>
                        </div>
                        {si.spread !== false && <div className="flex flex-wrap">{this.renderChilds(si.childs)}</div>}
                    </div>
                })}
            </div>
            <div className="flex-center cursor gap-h-5 item-hover item-hover-light-focus round h-30" onMouseDown={e => this.onOpenMore(e)}>
                <S>更多图形</S>
            </div>
        </div>
    }
    onMousedown(s: ShapeType, event: React.MouseEvent) {
        this.emit('selector', s);
    }
    async onOpenMore(event: React.MouseEvent) {
        var ds = this.shapeList.map(s => {
            return {
                text: s.text,
                name: s.name
            }
        }) as any
        var r = await useShapeShop(ds);
        if (r && Array.isArray(r)) {
            ds = r;
            ds.forEach(d => {
                var c = this.shapeList.find(c => c.name == d.name);
                if (c) {
                    d.childs = c.childs as any;
                }
            });
            this.shapeList = ds;
        }
        await channel.act('/cache/set', {
            key: SHAPE_STORE_LIST,
            value: lodash.cloneDeep(this.shapeList.map(s => {
                return {
                    text: s.text,
                    name: s.name
                }
            }))
        })
        await this.loadShapes();
    }
    async open() {
        await this.loadShapes();
    }
    shapeList: { text: string, spread?: boolean, name: string, childs: any[] }[] = [];
    async loadShapes() {
        var rs = await channel.query('/cache/get', { key: SHAPE_STORE_LIST });
        if (!Array.isArray(rs)) {
            rs = [
                { text: '通用', name: '/basic/common.json' },
                { text: '基本', name: '/basic/basic.json' },
                { text: '箭头', name: '/basic/arrow.json' },
                { text: '流程', name: '/basic/flow.json' },
                { text: '高级', name: '/basic/advanced.json' },
            ]
        }
        for (let i = 0; i < rs.length; i++) {
            if (!Array.isArray(rs[i].childs)) {
                var url = STATIC_URL + 'static/board/shapes/data' + rs[i].name;
                var rd = await util.getJson(url);
                if (Array.isArray(rd?.data))
                    rs[i].childs = rd.data;
            }
        }
        this.shapeList = rs;
        lodash.remove(this.shapeList, c => Array.isArray(c.childs) && c.childs.length > 0 ? false : true)
        this.forceUpdate();
    }
}



export async function useShapeStore(pos: PopoverPosition) {
    var popover = await PopoverSingleton(ShapeStoreView, { mask: true });
    var shapeStore = await popover.open(pos);
    await shapeStore.open();
    return new Promise((resolve: (data: ShapeType) => void, reject) => {
        shapeStore.only('selector', (data) => {
            resolve(data);
            popover.close();
        });
        popover.only('close', () => {
            resolve(null);
        })
    })
}