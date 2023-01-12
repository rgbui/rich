import React from "react";
import { ResourceArguments } from "../icon/declare";
import { PopoverSingleton } from "../popover/popover";

export class ImageViewer extends React.Component {
    pics: ResourceArguments[] = [];
    index: number = 0;
    setIndex(index: number, event: React.MouseEvent) {
        this.index = index;
        this.forceUpdate()
    }
    render() {
        return <div className="w-500">
            <div className="flex-center h-400 overflow-hidden">
                <img className="w100 obj-center" src={this.pics[this.index].url} />
            </div>
            <div className="flex-center w-500 h-100 overflow-x gap-t-10">
                {this.pics.map((pic, index) => {
                    return <div key={index} onMouseDown={e => this.setIndex(index, e)} className={'cursor round w-100 h-100' + (index == this.index ? " border-0" : "border-selected")}>
                        <img className="w100 h100 obj-center" src={pic.url} />
                    </div>
                })}
            </div>
        </div>
    }
    open(pics: ResourceArguments[]) {
        this.pics=pics;
        this.forceUpdate();
    }
}

export async function useImageViewer(pics: ResourceArguments[]) {
    let popover = await PopoverSingleton(ImageViewer, { mask: true, visible: 'hidden' });
    let imageViewer = await popover.open({ center: true });
    imageViewer.open(pics)
    return new Promise((resolve: (value?: any) => void, reject) => {
        popover.only('close', () => {
            resolve()
        })
    })
}