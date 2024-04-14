import React from "react";
import { S } from "../../i18n/view";
import { ColorType } from "./data";
import { Icon } from "../../component/view/icon";
import { CloseSvg, NoneSvg, PlusSvg } from "../../component/svgs";
import { channel } from "../../net/channel";
import { Rect } from "../../src/common/vector/point";
import { useColorPicker } from "../../component/view/color/lazy";


export class ColorListBox extends React.Component<{
    title?: string,
    name: string,
    colors: ColorType[],
    value: string,
    onChange: (color: ColorType) => void,
}>{
    editing: boolean = false;
    customColors: ColorType[] = [];
    render() {
        return <div>
            <div className="flex gap-b-5">
                <span className="flex-auto f-12 remark">{this.props.title ? this.props.title : <S>颜色</S>}</span>
                {this.customColors.length > 0 && <span className="f-12 link" onMouseDown={e => {
                    this.editing = !this.editing;
                    this.forceUpdate();
                }}>{this.editing ? <S>完成</S> : <S>编辑</S>}</span>}
            </div>
            <div style={{ width: 'calc(100% + 10px)' }} className="flex flex-wrap r-cirlce r-size-20 r-circle r-gap-r-10 r-gap-b-10 r-border-box r-cursor">
                {this.props.colors.map(c => {
                    if (c.color == 'transparent') return <a className={'transparent '}
                        onMouseDown={e => this.props.onChange(c)} key={c.color}
                        style={{
                            display: 'inline-flex',
                            borderColor: 'transparent',
                            backgroundColor: c.color,
                            boxShadow: c.color == this.props.value ? "0 0 0 2px #fff, 0 0 0 4px blue" : undefined,
                        }}>
                        <Icon size={20} icon={NoneSvg}></Icon>
                    </a>
                    return <a key={c.color} onMouseDown={e => this.props.onChange(c)}
                        style={{
                            boxShadow: c.color == this.props.value ? "0 0 0 2px #fff, 0 0 0 4px blue" : undefined,
                            backgroundColor: c.color,
                            border: '1px solid rgba(0, 0, 0, 0.1)'
                        }}></a>
                })}
                {this.customColors.map(c => {
                    return <a key={c.color} onMouseDown={e => this.props.onChange(c)} style={{
                        boxShadow: c.color == this.props.value ? "0 0 0 2px #fff, 0 0 0 4px blue" : undefined,
                        backgroundColor: c.color,
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                        position: 'relative'
                    }}>
                        {this.editing && <span
                            className="flex-center size-16 cursor circle  pos bg-hover" onMouseDown={e => {
                                e.stopPropagation();
                                this.customColors = this.customColors.filter(s => s != c);
                                this.forceUpdate();
                                channel.act('/cache/set', { key: this.getKey(), value: this.customColors });
                            }} style={{
                                top: -8,
                                right: -8
                            }}><Icon size={10} icon={CloseSvg}></Icon></span>}
                    </a>
                })}
                <span onMouseDown={e => this.onAdd(e)}
                    className="flex-center text-1 cursor"
                    style={{
                        display: 'inline-flex',
                        border: '1px solid rgba(0, 0, 0, 0.1)'
                    }} ><Icon icon={PlusSvg} size={16}></Icon></span>
            </div>
        </div>
    }
    async onAdd(event: React.MouseEvent) {
        var r = await useColorPicker({ roundArea: Rect.fromEle(event.currentTarget as HTMLElement) }, { color: '#000' });
        if (r) {
            if (!this.customColors.some(s => s.color == r)) {
                this.customColors.push({ color: r });
                await channel.act('/cache/set', { key: this.getKey(), value: this.customColors });
                this.props.onChange({ color: r });
            }
        }
    }
    getKey() {
        return this.props.name + "__Custom_Colors";
    }
    componentDidMount(): void {
        this.loadCaches();
    }
    shouldComponentUpdate(nextProps: Readonly<{ title?: string; name: string; colors: ColorType[]; value: string; onChange: (color: ColorType) => void; }>, nextState: Readonly<{}>, nextContext: any): boolean {
        if (this.props.value != nextProps.value) return true;
        if (this.props.name != nextProps.name) {
            this.loadCaches();
        }
        return false;
    }
    async loadCaches() {
        var r = await channel.query('/cache/get', { key: this.getKey() });
        if (Array.isArray(r)) {
            this.customColors = r;
        }
        else this.customColors = [];
        this.forceUpdate()
    }
}