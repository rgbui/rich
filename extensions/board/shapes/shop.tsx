import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { PopoverSingleton } from "../../../component/popover/popover";
import { ShySvg } from "../../../src/block/svg";
import { CheckBox } from "../../../component/view/checkbox";
import lodash from "lodash";
import { util } from "../../../util/util";
import { Spin } from "../../../component/view/spin";

class ShapeShopView extends EventsComponent {
    render() {
        return <div className="relative w-600 min-h-160  bg-white shadow border  round-4  padding-5 ">
            <div className="flex flex-full">
                <div className="flex-fixed w-150 h-500 overflow-y "
                    style={{ paddingBottom: 50 }}
                >{this.renderSlides()}</div>
                <div className="flex-auto  h-500 overflow-y">
                    <div className="flex flex-wrap padding-10">
                        {this.loading && <Spin block></Spin>}
                        {this.renderItems()}
                    </div>
                </div>
            </div>
        </div>
    }
    currentItem: { text: string, name: string, childs: any[] };
    loading: boolean = false;
    renderChilds(childs) {
        return childs.map((s, index) => {
            if (s.text && Array.isArray(s.childs) && s.childs.length > 0) {
                return <div key={index} className="gap-b-20">
                    <div className="h-20 remark f-12 ">{s.text}</div>
                    <div className="flex flex-wrap">{this.renderChilds(s.childs)}</div>
                </div>
            }
            if (s.src) return <div className="size-50 gap-r-10 gap-b-10" key={index}>
                <img src={s.src} draggable={false} className="obj-center w100 h100" />
            </div>
            var sb = new ShySvg();
            sb.load(s);
            return <div className="size-50 gap-b-10 gap-r-10 item-hover-light flex-center round" key={index}>
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
    renderItems() {
        if (Array.isArray(this.currentItem?.childs))
            return this.renderChilds(this.currentItem.childs);
    }
    renderSlides() {
        var items: { text: string, childs: { text: string, name: string }[] }[] = [
            {
                text: '标准',
                childs: [
                    { text: '通用', name: '/basic/common.json' },
                    { text: '基本', name: '/basic/basic.json' },
                    { text: '箭头', name: '/basic/arrow.json' },
                    { text: '流程', name: '/basic/flow.json' },
                    { text: '高级', name: '/basic/advanced.json' },
                ]
            },
            {
                text: 'office', childs: [

                    { text: 'clouds', name: '/office/clouds.json' },
                    { text: 'services', name: '/office/services.json' },
                    { text: 'databases', name: '/office/databases.json' },
                    { text: 'sites', name: '/office/sites.json' },
                    { text: 'users', name: '/office/users.json' },
                    { text: 'security', name: '/office/security.json' },
                    { text: 'devices', name: '/office/devices.json' },
                    { text: 'servers', name: '/office/servers.json' },
                    { text: 'communications', name: '/office/communications.json' },
                    { text: 'concepts', name: '/office/concepts.json' }

                ]
            },
            {
                text: "BPMN 2.0",
                childs: [

                    { text: 'General', name: '/bpmn/general.json' },
                    { text: 'Tasks', name: '/bpmn/tasks.json' },
                    { text: 'Events', name: '/bpmn/events.json' },
                    { text: 'Choreography', name: '/bpmn/choreographies.json' },
                    { text: 'Gateways', name: '/bpmn/gateways.json' }

                ]
            },
            {
                text: '软件',
                childs: [
                    {
                        text: '剪贴画 ', name: '/clip_art/main.json'
                    },
                    {
                        text: '网络图标', name: '/netWork/index.json'
                    },
                    {
                        text: "机架", name: '/rack/index.json'
                    }
                ]
            },
            {
                text: "网络",
                childs: [
                    {
                        text: '阿里云', name: '/allied_telesis/main.json'
                    },
                    { text: "Azure", name: "/azure2/main.json" },
                    { text: "思科", name: "/mscae/main.json" },
                    {
                        text: 'IBM', name: '/ibm/main.json'
                    },
                    {
                        text: 'sap', name: '/sap/main.json'
                    },
                    {
                        text: 'VMware', name: '/VMware/index.json'
                    }
                ]
            },
            {
                text: '其它',
                childs: [
                    {
                        text: 'FluidPower', name: '/FluidPower/index.json'
                    },
                    {
                        text: 'electrical', name: '/electrical/index.json'
                    },
                    {
                        text: 'eip', name: '/eip/index.json'
                    },
                    {
                        text: '平面图', name: '/PlaneGraph/index.json'
                    },
                    {
                        text: '材料工艺', name: '/MaterialTechnology/index.json'
                    }
                ]
            }
        ];
        return <div>
            {items.map((item, index) => {
                return <div key={index}>
                    <div>{item.text}</div>
                    <div>
                        {item.childs.map((child, at) => {
                            return <div onMouseDown={e => {
                                this.loadStore(child);
                                this.forceUpdate();
                            }} className={' h-30 flex round padding-w-10 ' + (this.currentItem?.name == child.name ? "item-hover-focus" : "item-hover")} key={at}>
                                <CheckBox onChange={e => {
                                    if (e) {
                                        if (!this.selectDs.some(s => s.name == child.name)) {
                                            this.selectDs.push(child);
                                        }
                                    }
                                    else {
                                        lodash.remove(this.selectDs, s => s.name == child.name);
                                    }
                                    this.forceUpdate();
                                }}
                                    checked={this.selectDs.some(s => s.name == child.name)}></CheckBox>
                                <span className="flex-auto gap-l-5 cursor">{child.text}</span>
                            </div>
                        })}
                    </div>
                </div>
            })}
        </div>
    }
    async loadStore(d: { name: string, text: string }) {
        this.currentItem = d as any;
        this.loading = true;
        this.forceUpdate()
        this.currentItem.childs = await this.getD(d.name);
        this.loading = false;
        this.forceUpdate()
    }
    async getD(name: string) {
        var url = STATIC_URL + 'static/board/shapes/data' + name;
        var rd = await util.getJson(url);
        if (Array.isArray(rd?.data))
            return rd.data;
        else return []
    }
    selectDs: { name: string, text: string }[] = [];
    open(ds: { name: string, text: string }[]) {
        this.selectDs = ds;
        this.forceUpdate();
    }
}




export async function useShapeShop(ds: { name: string, text: string }[]) {
    var popover = await PopoverSingleton(ShapeShopView, { mask: true });
    var shapeShop = await popover.open({ center: true, centerTop: 100 });
    shapeShop.open(ds);
    return new Promise((resolve: (data: { name: string, text: string }[]) => void, reject) => {
        shapeShop.only('selector', (data) => {
            resolve(shapeShop.selectDs);
            popover.close();
        });
        popover.only('close', () => {
            resolve(shapeShop.selectDs);
        })
    })
}

