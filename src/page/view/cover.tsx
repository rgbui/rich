import React from "react";
import { Page } from "..";
import { Icon } from "../../../component/view/icon";
import { useIconPicker } from "../../../extensions/icon";
import { useImagePicker } from "../../../extensions/image/picker";
import { autoImageUrl } from "../../../net/element.type";
import { MouseDragger } from "../../common/dragger";
import { Rect } from "../../common/vector/point";
import { S } from "../../../i18n/view";
import { BlockUrlConstant } from "../../block/constant";
import { Title } from "../../../blocks/page/title";

export class PageCover extends React.Component<{ page: Page }>{
    private startPos: boolean = false;
    private loadThumb: boolean = false;
    img: HTMLImageElement;
    private top: number;
    render() {
        var self = this;
        var page = this.props.page;
        var pd = this.props.page.getPageDataInfo();
        if (pd.cover?.abled && this.props.page.hideDocTitle !== true) {
            async function changeIcon(event: React.MouseEvent) {
                if (!page.isCanEdit) return;
                event.stopPropagation();
                var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) }, pd.icon);
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
                self.top = typeof pd?.cover?.top == 'number' ? pd?.cover?.top : 50;
                self.startPos = true;
                self.forceUpdate();
            }
            function dragStart(event: React.MouseEvent) {
                event.stopPropagation();
                var currentTop = self.top;
                MouseDragger({
                    event,
                    cursor: 'grabbing',
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
            var isCenter = (this.props.page.find(c => c.url == BlockUrlConstant.Title) as Title)?.align == 'center';
            var isInsideCover = this.props.page?.pageTheme?.coverStyle?.display == 'inside-cover'
            var isInside = this.props.page?.pageTheme?.coverStyle?.display == 'inside';
            var isNoBorder = this.props.page?.pageTheme?.contentStyle?.transparency == 'noborder';
            return <div className="shy-page-view-cover" style={isInside ? page.getScreenStyle() : undefined} onMouseDown={e => dragStart(e)}>
                <img ref={e => this.img = e}
                    onDragStart={e => false}
                    onLoad={e => onloadSuccess()}
                    src={autoImageUrl(pd.cover.url)}
                    draggable={false}
                    style={{
                        height: 240,
                        borderRadius: isInsideCover && !isNoBorder ? '16px 16px 0px 0px' : undefined,
                        objectPosition: 'center' + (typeof pd?.cover?.top == 'number' ? pd.cover.top : 50) + '%'
                    }} />
                {pd.cover?.thumb && <img className="shy-page-view-cover-thumb" style={{
                    height: 240,
                    borderRadius: isInsideCover && !isNoBorder ? '16px 16px 0px 0px' : undefined,
                    visibility: self.loadThumb ? "hidden" : 'visible',
                    objectPosition: 'center' + (typeof pd?.cover?.top == 'number' ? pd.cover.top : 50) + '%'
                }} onDragStart={e => false} draggable={false} src={autoImageUrl(pd.cover.thumb)} />}
                {self.startPos && <div className="shy-page-view-cover-drag-tip"><S>拖动图片调整位置</S></div>}
                <div className="shy-page-view-cover-nav">
                    <div style={(isInside || isInsideCover) ? { paddingLeft: 16, paddingRight: 16 } : page.getScreenStyle()}>
                        <div style={{ position: 'relative', height: 24 }}>
                            {pd?.icon && <div onMouseDown={e => changeIcon(e)} className={"shy-page-view-cover-icon" + (isCenter ? " center" : "")}>
                                <Icon size={72} icon={pd?.icon}></Icon>
                            </div>}
                            {page.isCanEdit && <div className="shy-page-view-cover-operators">
                                {self.startPos && <>
                                    <a onMouseDown={e => savePostion()}><S>保存</S></a>
                                    <a onMouseDown={e => endPostion()}><S>取消</S></a>
                                </>}
                                {!self.startPos && <>
                                    <a onMouseDown={e => changeCover(e)}><S>更换</S></a>
                                    <a onMouseDown={e => startPosition(e)}><S>调整</S></a>
                                    <a onMouseDown={e => page.onAddCover()}><S>移除</S></a>
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