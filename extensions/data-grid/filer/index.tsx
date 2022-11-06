import lodash from "lodash";
import React from "react";
import { ReactNode } from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { DotsSvg, DragHandleSvg } from "../../../component/svgs";
import { Avatar } from "../../../component/view/avator/face";
import { Button } from "../../../component/view/button";
import { DragList } from "../../../component/view/drag.list";
import { Divider } from "../../../component/view/grid";
import { Icon } from "../../../component/view/icon";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";
import { useUserPicker } from "../../at/picker";
import { useAudioPicker } from "../../file/audio.picker";
import { useFilePicker } from "../../file/file.picker";
import { useImageFilePicker } from "../../file/image.picker";
import { useVideoPicker } from "../../file/video.picker";
import { ResourceArguments } from "../../icon/declare";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";

export class DataGridFileViewer extends EventsComponent {
    mime: 'file' | 'image' | 'video' | 'audio' | 'user' = 'file';
    resources: ResourceArguments[] = [];
    isMultiple: boolean = false;
    open(options: {
        mime: DataGridFileViewer['mime'],
        resources: ResourceArguments[],
        isMultiple: boolean
    }) {
        this.isMultiple = options.isMultiple;
        this.mime = options.mime || 'file';
        this.resources = options.resources || [];
        this.forceUpdate();
    }
    dragChange(to: number, from: number) {
        var fe = this.resources[from];
        lodash.remove(this.resources, (c, g) => g == from)
        this.resources.splice(to, 0, fe);
        this.forceUpdate()
    }
    async onContextmenu(resource: ResourceArguments, event: React.MouseEvent) {
        event.stopPropagation();
        var re = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [{ name: 'delete', text: '删除' }]);
        if (re?.item) {
            lodash.remove(this.resources, g => g === resource);
            this.forceUpdate()
        }
    }
    async uploadFile(event: React.MouseEvent) {
        var resource: ResourceArguments;
        if (this.mime == 'image') {
            resource = await useImageFilePicker({ roundArea: Rect.fromEvent(event) })
        }
        else if (this.mime == 'file') {
            resource = await useFilePicker({ roundArea: Rect.fromEvent(event) })
        }
        else if (this.mime == 'audio') {
            resource = await useAudioPicker({ roundArea: Rect.fromEvent(event) })
        } else if (this.mime == 'video') {
            resource = await useVideoPicker({ roundArea: Rect.fromEvent(event) })
        }
        else if (this.mime == 'user') {
            var r = await useUserPicker({ roundArea: Rect.fromEvent(event) });
            if (r && !this.resources.includes(r.id as any)) {
                resource = r.id as any;
            }
        }
        if (resource) {
            this.resources.push(resource);
            this.forceUpdate()
        }
    }
    render(): ReactNode {
        var self = this;
        function renderItem(resource: ResourceArguments) {
            if (self.mime == 'image') {
                return <div className="flex-center gap-5"><img src={resource.url} className="round object-center max-w-250 max-h-100" /></div>
            }
            else if (self.mime == 'audio') {
                return <div className="flex-center gap-5"><audio controls className="round object-center w-250 h-30" >
                    <source src={resource.url} type="audio/ogg" />
                    <source src={resource.url} type="audio/mpeg" />
                    <source src={resource.url} type="audio/wav" />
                </audio>
                </div>
            }
            else if (self.mime == 'video') {
                return <div className="flex-center gap-5"><video src={resource.url} className="round object-center max-w-250 max-h-100" /></div>
            }
            else if (self.mime == 'file') {
                return <div><span>{resource.text}</span></div>
            }
            else if (self.mime == 'user') return <div><Avatar size={30} userid={resource as string}></Avatar></div>
            else return <></>
        }
        function getButtonText() {
            if (self.mime == 'file') return '上传文件'
            else if (self.mime == 'user') return '添加用户'
            else if (self.mime == 'image') return '上传图片'
            else if (self.mime == 'audio') return '上传音频'
            else if (self.mime == 'video') return '上传视频'
            else return '上传文件'
        }
        return <div className={"gap-h-14" + (this.mime == 'user' ? " w-180" : " w-300")}>
            <div className="max-h-300 overflow-y">
                <DragList onChange={(e, c) => this.dragChange(e, c)}
                    isDragBar={e => e.closest('.drag') ? true : false}>
                    {this.resources.map((re, i) => {
                        return <div className="flex cursor min-h-30 padding-w-14 text-1 item-hover round" key={i}>
                            <span className="round flex-fixed drag size-24 remark flex-center cursor item-hover">
                                <Icon icon={DragHandleSvg} size={14}></Icon>
                            </span>
                            <div className="flex-auto">{renderItem(re)}</div>
                            <span onClick={e => this.onContextmenu(re, e)} className="round  remark flex-fixed drag size-24 flex-center cursor item-hover">
                                <Icon icon={DotsSvg} size={14}></Icon>
                            </span>
                        </div>
                    })}</DragList>
            </div>
            {(this.isMultiple || this.resources.length == 0) && <>{this.resources.length > 0 && <Divider></Divider>}<div className="gap-h-10 padding-w-14">
                <Button onClick={e => this.uploadFile(e)} block>{getButtonText()}</Button>
            </div></>}
        </div>
    }
    onSave() {
        this.emit('save', lodash.cloneDeep(this.resources));
    }
}


export async function useDataGridFileViewer(pos: PopoverPosition,
    option: {
        mime: DataGridFileViewer['mime'],
        resources: ResourceArguments[],
        isMultiple: boolean
    }) {
    let popover = await PopoverSingleton(DataGridFileViewer, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: ResourceArguments[]) => void, reject) => {
        fv.only('save', (data: ResourceArguments[]) => {
            popover.close();
            resolve(data);
        });
        fv.only('close', () => {
            popover.close();
            resolve(fv.resources);
        })
        popover.only('close', () => {
            resolve(fv.resources);
        })
    })
}