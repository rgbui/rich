import React, { CSSProperties } from "react";
import { ResourceArguments } from "../../../extensions/icon/declare";
import { Block } from "../../../src/block";
import { url, prop, view } from "../../../src/block/factory/observable";
import { BlockView } from "../../../src/block/view";
import { Point, PointArrow, Rect } from "../../../src/common/vector/point";
import { BlockRenderRange } from "../../../src/block/enum";
import { util } from "../../../util/util";
import { lst } from "../../../i18n/store";
import { useImagePicker } from "../../../extensions/image/picker";
import { BlockUrlConstant } from "../../../src/block/constant";
import { useImageViewer } from "../../../component/view/image.preview";
import { useLinkPicker } from "../../../extensions/link/picker";
import { getImageSize } from "../../../component/file";
import { closeBoardEditTool } from "../../../extensions/board.edit.tool";
import { MouseDragger } from "../../../src/common/dragger";
import lodash from 'lodash';
import { BoardPointType, BoardBlockSelector } from "../../../src/block/partial/board";
import { openBoardEditTool } from "../../../src/kit/operator/board/edit";
import { channel } from "../../../net/channel";
import { Spin } from "../../../component/view/spin";
import { S } from "../../../i18n/view";

@url('/board/image')
export class Image extends Block {
    onResizeBoardSelector(arrows: PointArrow[], event: React.MouseEvent) {
        this.onResizeScaleBoardSelector(arrows, event);
    }
    boardMove(from: Point, to: Point): void {
        if (this.isCrop) return;
        return super.boardMove(from, to);
    }
    async boardMoveEnd(from: Point, to: Point): Promise<void> {
        if (this.isCrop) return;
        return await super.boardMoveEnd(from, to);
    }
    @prop()
    crop: { x: number, y: number, width?: number, height?: number } = { x: 0, y: 0 };
    @prop()
    src: ResourceArguments;
    @prop()
    originSize: { width: number, height: number } = { width: 100, height: 100 }
    getBlockBoardSelector(types?: BoardPointType[]): BoardBlockSelector[] {
        if (this.isCrop) return []
        else return super.getBlockBoardSelector(types)
    }
    get fixedSize() {
        var width = this.crop?.width || (this.originSize.width);
        var height = this.crop?.height || (this.originSize.height);
        return { width, height };
    }
    isCrop: boolean = false;
    getVisibleBound(): Rect {
        var fs = this.fixedSize;
        var rect = new Rect(0, 0, fs.width, fs.height);
        rect = rect.transformToRect(this.globalWindowMatrix);
        return rect;
    }
    getVisibleContentBound() {
        return this.getVisibleBound()
    }
    async getBoardEditCommand(): Promise<{ name: string; value?: any; }[]> {
        if (this.isCrop) return [{ name: 'croping' }, { name: 'resetCrop' }];
        var cs: { name: string; value?: any; }[] = [];
        cs.push({ name: 'crop' });
        cs.push({ name: 'link' });
        cs.push({ name: 'upload' });
        cs.push({ name: 'look' });
        cs.push({ name: 'download' });
        return cs;
    }
    async onSaveImageSize(d: { url?: string }, merge: boolean) {
        var imgSize = await getImageSize(d?.url);
        await this.onUpdateProps({
            originSize: imgSize,
            src: { ...d }
        }, { range: BlockRenderRange.self, merge });
    }
    async setBoardEditCommand(name: string, value: any) {

        if (name == 'crop') {
            this.isCrop = true;
            this.forceManualUpdate();
        }
        else if (name == 'resetCrop') {
            var crop = lodash.cloneDeep(this.crop);
            crop.x = 0;
            crop.y = 0;
            crop.width = undefined;
            crop.height = undefined;
            await this.updateProps({ crop }, BlockRenderRange.self);
        }
        else if (name == 'croping') {
            this.isCrop = false;
            this.forceManualUpdate();
        }
        else if (name == 'upload') {
            closeBoardEditTool();
            var r = await useImagePicker({ roundArea: this.getVisibleBound() });
            if (r) {
                var imgSize = await getImageSize(r?.url);
                await this.updateProps({
                    originSize: imgSize,
                    src: { ...r }
                }, BlockRenderRange.self);
            }
            setTimeout(() => {
                this.page.kit.picker.onPicker([this]);
            }, 200);
        }
        else if (name == 'link') {
            var rgc = await useLinkPicker({ roundArea: this.getVisibleBound() }, {
            }, { allowCreate: false });
            if (rgc) {
                var link = Array.isArray(rgc.refLinks) ? rgc.refLinks[0] : rgc.link;
                await this.updateProps({ link: link }, BlockRenderRange.self);
            }
            setTimeout(() => {
                this.page.kit.picker.onPicker([this]);
            }, 200);
        }
        else if (name == 'look') {
            closeBoardEditTool();
            var pics = this.page.findAll(g => g.url == BlockUrlConstant.Image || g.url == BlockUrlConstant.BoardImage).map(g => (g as Image).src)
            await useImageViewer(this.src, pics);
            setTimeout(() => {
                this.page.kit.picker.onPicker([this]);
            }, 200);
        }
        else if (name == 'download') {
            await util.downloadFile(this.src?.url, (this.src?.filename) || (lst('图像')) + (this.src.ext || '.jpg'));
        }
        // else if (name == 'borderWidth') {
        //     await this.updateProps({ 'minBoxStyle.width': value }, BlockRenderRange.self);
        // }
        // else if (name == 'borderType') {
        //     await this.updateProps({ 'minBoxStyle.type': value }, BlockRenderRange.self);
        // }
        // else if (name == 'borderColor') {
        //     await this.updateProps({ 'minBoxStyle.borderColor': value }, BlockRenderRange.self);
        // }
        // else if (name == 'borderRadius') {
        //     await this.updateProps({ 'minBoxStyle.radius': value }, BlockRenderRange.self);
        // }
        else
            await super.setBoardEditCommand(name, value)
    }
    speed = '';
    async didMounted() {
        try {
            await this.onBlockReloadData(async () => {
                if (this.createSource == 'InputBlockSelector' && !this.src) {
                    var r = await useImagePicker({ roundArea: Rect.fromEle(this.el) });
                    if (r) {
                        await this.onSaveImageSize(r, true);
                    }
                }
                if (this.initialData && this.initialData.file) {
                    this.speed = '0%';
                    this.view.forceUpdate();
                    var d = await channel.post('/ws/upload/file', {
                        file: this.initialData.file,
                        uploadProgress: (event) => {
                            if (event.lengthComputable) {
                                this.speed = `${util.byteToString(event.total)}  ${(100 * event.loaded / event.total).toFixed(2)}%`;
                                this.forceManualUpdate();
                            }
                        }
                    });
                    if (d.ok && d.data?.file?.url) {
                        await this.onSaveImageSize(d.data?.file, true);
                    }
                }
                if (this.initialData && this.initialData.url) {
                    var d = await channel.post('/ws/download/url', { url: this.initialData.url });
                    if (d.ok && d.data?.file?.url) {
                        await this.onSaveImageSize(d.data?.file, true);
                    }
                }
                if (this.initialData && this.initialData.imageUrl) {
                    await this.onSaveImageSize({ url: this.initialData.imageUrl }, true);
                }
            })
        }
        catch (ex) {
            console.error(ex);
        }
    }
}

@view('/board/image')
export class ImageView extends BlockView<Image> {
    renderView() {
        if (!this.block.src) {
            return <div className="sy-block-image" style={this.block.visibleStyle}>
                {this.block.speed && <div className="sy-block-image-empty flex f-14">
                    <Spin size={16}></Spin>
                    <span className="gap-l-5"><S>上传中</S>:<i >{this.block.speed}</i></span>
                </div>}
            </div>
        }
        var style = this.block.visibleStyle;
        var size = this.block.fixedSize;
        size.width = (this.block.crop?.width || size.width);
        size.height = (this.block.crop?.height || size.height);
        return <div className='sy-block-image' style={style} >
            {!this.block.isCrop && <div
                style={{
                    width: size.width,
                    height: size.height,
                    backgroundImage: `url(${this.block.src.url})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: (this.block.originSize.width) + 'px ' + (this.block.originSize.height) + 'px',
                    backgroundPosition: (0 - this.block.crop?.x || 0) + 'px ' + (0 - this.block.crop?.y || 0) + 'px',
                    // width: size.width,
                    // height: size.height
                }}
            >
            </div>}
            {this.block.isCrop && this.renderCrop()}
            {this.renderComment()}
        </div>
    }
    renderCrop() {
        var size = this.block.fixedSize;
        var crop = this.block.crop;
        var imageStyle: CSSProperties = {};
        if (this.block.src?.url) {
            imageStyle.position = 'absolute';
            imageStyle.top = 0;
            imageStyle.left = 0;
            imageStyle.backgroundImage = `url(${this.block.src.url})`;
            imageStyle.backgroundRepeat = 'no-repeat';
            imageStyle.backgroundSize = (this.block.originSize.width) + 'px ' + (this.block.originSize.height) + 'px';
            imageStyle.backgroundPosition = (0 - crop?.x || 0) + 'px ' + (0 - crop?.y || 0) + 'px';
            imageStyle.width = size.width;
            imageStyle.height = size.height;
        }
        var imgCropStyle: CSSProperties = {};
        imgCropStyle.position = 'absolute';
        imgCropStyle.top = 0;
        imgCropStyle.left = 0;
        imgCropStyle.opacity = 0.5;
        imgCropStyle.width = this.block.originSize.width;
        imgCropStyle.height = this.block.originSize.height;
        imgCropStyle.backgroundImage = `url(${this.block.src.url})`;
        imgCropStyle.backgroundRepeat = 'no-repeat';
        imgCropStyle.transform = `translate(-${crop?.x || 0}px, -${crop?.y || 0}px)`;


        var gap = 8;
        var s = this.block.matrix.getScaling().x;
        gap = gap / s;
        return <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size.width,
            height: size.height
        }}>
            <div onMouseDown={e => {
                // e.stopPropagation();
            }} style={imgCropStyle}>
            </div>
            <div style={imageStyle} onMouseDown={e => { this.onCrop('move', e) }}>
                <div onMouseDown={e => { this.onCrop('top', e) }} style={{
                    position: 'absolute',
                    // backgroundColor: 'var(--text-b-1-color)',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: gap,
                    cursor: 'ns-resize'
                }} className="flex-center">
                    <div style={{
                        backgroundColor: 'var(--text-b-1-color)',
                        height: gap,
                        width: '30%'
                    }}></div>
                </div>
                <div
                    className="flex-center"
                    onMouseDown={e => { this.onCrop('left', e) }}
                    style={{
                        position: 'absolute',

                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: gap,
                        cursor: 'ew-resize'
                    }}>
                    <div style={{
                        backgroundColor: 'var(--text-b-1-color)',
                        width: gap,
                        height: '30%'
                    }}></div>

                </div>
                <div
                    className="flex-center"
                    onMouseDown={e => { this.onCrop('right', e) }}

                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        bottom: 0,
                        width: gap,
                        cursor: 'ew-resize'
                    }}>

                    <div style={{
                        backgroundColor: 'var(--text-b-1-color)',
                        width: gap,
                        height: '30%'
                    }}></div>
                </div>
                <div className="flex-center"

                    onMouseDown={e => { this.onCrop('bottom', e) }}
                    style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        height: gap,
                        cursor: 'ns-resize'
                    }}>

                    <div style={{
                        backgroundColor: 'var(--text-b-1-color)',
                        height: gap,
                        width: '30%'
                    }}></div>
                </div>

                <div
                    onMouseDown={e => { this.onCrop('top-left', e) }}
                    style={{
                        position: 'absolute', zIndex: 1, top: 0, left: 0, width: '10%', height: '10%',
                        cursor: 'nw-resize',
                        borderTop: gap + 'px solid var(--text-b-1-color)',
                        borderLeft: gap + 'px solid var(--text-b-1-color)',
                    }}></div>
                <div

                    onMouseDown={e => { this.onCrop('top-right', e) }}

                    style={{
                        position: 'absolute', zIndex: 1, top: 0, right: 0, width: '10%', height: '10%',
                        cursor: 'ne-resize',
                        borderTop: gap + 'px solid var(--text-b-1-color)',
                        borderRight: gap + 'px solid var(--text-b-1-color)',
                    }}></div>
                <div
                    onMouseDown={e => { this.onCrop('bottom-left', e) }}
                    style={{
                        position: 'absolute', zIndex: 1, bottom: 0, left: 0, width: '10%', height: '10%',
                        cursor: 'sw-resize',
                        borderBottom: gap + 'px solid var(--text-b-1-color)',
                        borderLeft: gap + 'px solid var(--text-b-1-color)',
                    }}></div>
                <div
                    onMouseDown={e => { this.onCrop('bottom-right', e) }}
                    style={{
                        position: 'absolute', zIndex: 1, bottom: 0, right: 0, width: '10%', height: '10%',
                        cursor: 'se-resize',
                        borderBottom: gap + 'px solid var(--text-b-1-color)',
                        borderRight: gap + 'px solid var(--text-b-1-color)',
                    }}></div>
            </div>
        </div>
    }
    onCrop(name: string, e: React.MouseEvent) {
        if (name != 'move')
            e.stopPropagation();
        var oldCrop = lodash.cloneDeep(this.block.crop);
        var ma = this.block.matrix.clone();
        var ow = this.block.originSize.width;
        var oh = this.block.originSize.height;
        if (typeof oldCrop.width == 'undefined') oldCrop.width = ow;
        if (typeof oldCrop.height == 'undefined') oldCrop.height = oh;
        closeBoardEditTool();
        var s = this.block.matrix.getScaling().x;
        MouseDragger({
            event: e,
            moving: (event, data, isEnd, isMove) => {
                var dx = event.clientX - e.clientX;
                var dy = event.clientY - e.clientY;
                dx = dx / s;
                dy = dy / s;
                var newCrop = lodash.cloneDeep(oldCrop);
                var newMa = ma.clone();
                if (name == 'move') {
                    newCrop.x += dx;
                    newCrop.y += dy;
                }
                else if (name == 'top') {
                    newCrop.y += dy;
                    newCrop.height -= dy;
                }
                else if (name == 'left') {
                    newCrop.x += dx;
                    newCrop.width -= dx;
                }
                else if (name == 'right') {
                    newCrop.width += dx;
                }
                else if (name == 'bottom') {
                    newCrop.height += dy;

                }
                else if (name == 'top-left') {
                    newCrop.x += dx;
                    newCrop.y += dy;
                    newCrop.width -= dx;
                    newCrop.height -= dy;
                }
                else if (name == 'top-right') {
                    newCrop.y += dy;
                    newCrop.width += dx;
                    newCrop.height -= dy;
                }
                else if (name == 'bottom-left') {
                    newCrop.x += dx;
                    newCrop.width -= dx;
                    newCrop.height += dy;
                }
                else if (name == 'bottom-right') {
                    newCrop.width += dx;
                    newCrop.height += dy;
                }

                if (newCrop.width < 0) {
                    newCrop.x = newCrop.x + newCrop.width;
                    newCrop.width = -newCrop.width;
                }
                if (newCrop.height < 0) {
                    newCrop.y = newCrop.y + newCrop.height;
                    newCrop.height = -newCrop.height;
                }
                var oldRect = { x: 0, y: 0, width: ow, height: oh };
                //newCrop与oldRect的交集
                newCrop.x = Math.max(newCrop.x, oldRect.x);
                newCrop.y = Math.max(newCrop.y, oldRect.y);
                if (newCrop.x + newCrop.width > oldRect.x + oldRect.width) {
                    newCrop.width = oldRect.x + oldRect.width - newCrop.x;
                }
                if (newCrop.y + newCrop.height > oldRect.y + oldRect.height) {
                    newCrop.height = oldRect.y + oldRect.height - newCrop.y;
                }

                newMa.translate(newCrop.x - oldCrop.x, newCrop.y - oldCrop.y);
                this.block.matrix = newMa;
                this.block.crop = newCrop;
                this.block.forceManualUpdate();
                if (isEnd) {
                    openBoardEditTool(this.block.page.kit);
                    this.block.onManualUpdateProps({ matrix: ma, crop: oldCrop }, { matrix: newMa, crop: newCrop }, { range: BlockRenderRange.self });
                }
            },
        })

    }
}