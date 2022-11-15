import React from "react";
import { Page } from "..";
import { Icon } from "../../../component/view/icon";
import { useIconPicker } from "../../../extensions/icon";
import { useImagePicker } from "../../../extensions/image/picker";
import { autoImageUrl } from "../../../net/element.type";
import { MouseDragger } from "../../common/dragger";
import { Rect } from "../../common/vector/point";
export class PageCover extends React.Component<{ page: Page }>{
    private startPos: boolean = false;
    private loadThumb: boolean = false;
    img: HTMLImageElement;
    private top: number;
    render() {
        var self = this;
        var page = this.props.page;
        var pd = this.props.page.getPageDataInfo();
        if (pd.cover?.abled) {
            async function changeIcon(event: React.MouseEvent) {
                if (!page.isCanEdit) return;
                event.stopPropagation();
                var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
                if (typeof icon != 'undefined') {
                    page.onUpdatePageData({ icon });
                }
            }
            async function changeCover(event: React.MouseEvent) {
                event.stopPropagation();
                var r = await useImagePicker({ roundArea: Rect.fromEvent(event) }, { gallery: true });
                if (r) {
                    page.onUpdatePageCover({ cover: { url: r.url, thumb: r.thumb, top: 50, abled: true } }, true)
                }
            }
            function startPosition(event: React.MouseEvent) {
                event.stopPropagation();
                self.top = typeof page?.cover?.top == 'number' ? page?.cover?.top : 50;
                self.startPos = true;
                self.forceUpdate();
            }
            function dragStart(event: React.MouseEvent) {
                event.stopPropagation();
                var currentTop = self.top;
                MouseDragger({
                    event,
                    moving(ev, data, isEnd) {
                        const dy = ev.pageY - event.pageY;
                        const z = (dy / 240) * 100;
                        var newTop = currentTop - z;
                        if (newTop < 0) newTop = 0;
                        else if (newTop > 100) newTop = 100;
                        self.top = newTop;
                        self.img.style.objectPosition = `center ` + newTop + '%';
                    }
                })
            }
            function savePostion() {
                page.onUpdatePageCover({ 'cover.top': self.top });
                self.startPos = false;
                self.forceUpdate();
            }
            function endPostion() {
                self.startPos = false;
                self.forceUpdate();
            }
            function onloadSuccess() {
                self.loadThumb = true;
                self.forceUpdate();
            }
            return <div className="shy-page-view-cover" onMouseDown={e => dragStart(e)}>
                <img ref={e => this.img = e}
                    onDragStart={e => false} onLoad={e => onloadSuccess()}
                    src={autoImageUrl(pd.cover.url)}
                    draggable={false}
                    style={{
                        height: 240,
                        objectPosition: 'center' + (typeof pd?.cover?.top == 'number' ? pd.cover.top : 50) + '%'
                    }} />
                {pd.cover?.thumb && <img className="shy-page-view-cover-thumb" style={{
                    height: 240,
                    visibility: self.loadThumb ? "hidden" : 'visible',
                    objectPosition: 'center' + (typeof pd?.cover?.top == 'number' ? pd.cover.top : 50) + '%'
                }} onDragStart={e => false} draggable={false} src={autoImageUrl(pd.cover.thumb)} />}
                {self.startPos && <div className="shy-page-view-cover-drag-tip">拖动图片调整位置</div>}
                <div className="shy-page-view-cover-nav">
                    <div style={page.getScreenStyle()}>
                        <div style={{ position: 'relative', height: 24 }}>
                            {pd?.icon && <div onMouseDown={e => changeIcon(e)} className="shy-page-view-cover-icon">
                                <Icon size={72} icon={pd?.icon}></Icon>
                            </div>}
                            {page.isCanEdit && <div className="shy-page-view-cover-operators">
                                {self.startPos && <>
                                    <a onMouseDown={e => savePostion()}>保存</a>
                                    <a onMouseDown={e => endPostion()}>取消</a>
                                </>}
                                {!self.startPos && <>
                                    <a onMouseDown={e => changeCover(e)}>更换</a>
                                    <a onMouseDown={e => startPosition(e)}>调整</a>
                                    <a onMouseDown={e => page.onAddCover()}>移除</a>
                                </>}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        }
        else return <></>
    }
}