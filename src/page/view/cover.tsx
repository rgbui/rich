import React from "react";
import { Page } from "..";
import { Icon } from "../../../component/view/icon";
import { useIconPicker } from "../../../extensions/icon";
import { useImagePicker } from "../../../extensions/image/picker";
import { channel } from "../../../net/channel";
import { Rect } from "../../common/vector/point";


export class PageCover extends React.Component<{ page: Page }>{

    render() {
        var self = this;
        var page = this.props.page;
        if (page.cover?.abled) {
            async function changeIcon(event: React.MouseEvent) {
                var icon = await useIconPicker({ roundArea: Rect.fromEvent(event) });
                if (icon) {
                    channel.air('/page/update/info', { id: page.pageItemId, pageInfo: { icon } })
                }
            }
            async function changeCover(event: React.MouseEvent) {
                var r = await useImagePicker({ roundArea: Rect.fromEvent(event) });
                if (r) {
                    page.onUpdateProps({ cover: { url: r.url, top: 50, abled: true } }, true)
                }
            }
            function startPosition(event: React.MouseEvent) {

            }
            return <div className="shy-page-view-cover">
                <img src={page.cover.url} draggable={false} style={{
                    height: 240,
                    objectPosition: 'center' + (page.cover.top || 50) + '%'
                }} />
                <div className="shy-page-view-cover-nav">
                    <div style={page.getScreenStyle()}>
                        <div style={{ position: 'relative', height: 24 }}>
                            {page.pageInfo?.icon && <div onMouseDown={e => changeIcon(e)} className="shy-page-view-cover-icon">
                                <Icon size={72} icon={page.pageInfo?.icon}></Icon>
                            </div>}
                            <div className="shy-page-view-cover-operators">
                                <a onMouseDown={e => changeCover(e)}>更换</a>
                                <a onMouseDown={e => startPosition(e)}>调整</a>
                                <a onMouseDown={e => page.onAddCover()}>移除</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
        else return <></>
    }
}