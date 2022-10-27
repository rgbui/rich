import React from "react";
import { ArrowDownSvg, DragHandleSvg } from "../../component/svgs";
import { Icon } from "../../component/view/icon";
import { CommandStores } from "./data";

export class CommandShopView extends React.Component {
    mousedown(event: React.MouseEvent) {

    }
    render(): React.ReactNode {
        var cs = CommandStores;
        return <div>
            {cs.map(c => {
                return <div key={c.name}>
                    <div className="flex h-30">
                        <span className='sy-block-list-text-type text ts-transform round item-hover'
                            style={{
                                cursor: 'pointer',
                                transform: c.spread ? 'rotateZ(180deg)' : 'rotateZ(90deg)',
                            }} onMouseDown={e => {
                                e.stopPropagation();
                                c.spread = c.spread ? false : true;
                                this.forceUpdate();
                            }}>
                            <Icon size={10} icon={ArrowDownSvg}></Icon>
                        </span>
                        <span>{c.text}</span></div>
                    <div>
                        <div>
                            {c.childs.map(cc => {
                                return <div key={cc.url} className='flex item-hover visible-hover'>
                                    <span className="flex-auto text-over">{cc.text}</span>
                                    <span onMouseDown={e => this.mousedown(e)} className="size-24 round item-hover visible flex-fixed"><Icon icon={DragHandleSvg}></Icon></span>
                                </div>
                            })}
                        </div>

                    </div>
                </div>
            })}
        </div>
    }
}