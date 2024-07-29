import React from "react"
import { TriangleSvg } from "../../../component/svgs"
import { Icon } from "../../../component/view/icon"
import { ToolTip } from "../../../component/view/tooltip"
import { Input } from "../../../component/view/input"
import { lst } from "../../../i18n/store"

export class IllustrationView extends React.Component<{
    images: { group: string, anthor?: string, size?: number, spread: boolean, pics: { text: string, url: string }[] }[],
    onMouseDown: (pic: { text: string, url: string }, e: React.MouseEvent) => void
}> {
    word: string = '';
    render() {
        var props = this.props;
        var images = this.word ? props.images.map(group => ({ ...group, pics: group.pics.filter(pic => pic.text && pic.text.includes(this.word)) })) : props.images;
        return (
            <div className="h100">
                <div className="gap-h-10">
                    <div className="gap-w-10">
                        <Input value={this.word} onChange={e => {
                            this.word = e;
                            this.forceUpdate();
                        }} placeholder={lst('搜索素材')} />
                    </div>
                </div>
                <div className="padding-b-30 border-box gap-w-5" style={{}}>
                    {images.map((group, index) => (
                        <div style={{
                            display: group.pics.length > 0 ? 'block' : 'none'
                        }} key={index} className="gap-b-10">
                            <div className="flex cursor gap-b-10 " onMouseDown={e => {
                                group.spread = !group.spread;
                                if (group.spread == true) {
                                    props.images.forEach((item) => {
                                        if (item != group) {
                                            item.spread = false;
                                        }
                                    })
                                }
                                this.forceUpdate()
                            }}>
                                <span className={"flex-fixed size-20 flex-center item-hover round ts " + (group.spread ? "angle-180" : "angle-90")}>
                                    <Icon size={8} icon={TriangleSvg}></Icon>
                                </span>
                                <span className="flex-auto">{group.group}</span>
                                <span className="flex-fixed remark gap-r-10">{group.pics.length}</span>
                            </div>
                            {group.spread && <div className="flex  flex-wrap r-gap-b-10 r-gap-r-10">
                                {group.pics.map((pic, index) => (
                                    <ToolTip mouseEnterDelay={1.2} key={index} overlay={pic.text}>
                                        <img className="item-hover-light round cursor" draggable={false} onMouseDown={e => {
                                            props.onMouseDown(pic, e)
                                        }} style={{
                                            userSelect: 'none',
                                            maxWidth: `calc(${100 / (group.size || 3)}% - 10px)`,
                                        }} src={pic.url} alt={pic.text} />
                                    </ToolTip>
                                ))}
                            </div>}
                            {group.spread && group.anthor && <div className="flex-center remark gap-h-10">
                                <span>{group.anthor}</span>
                                <a href='https://creativecommons.org/licenses/by/4.0/deed.en' target='_blank' style={{ color: 'inherit', textDecoration: 'underline' }} >版权信息</a>
                            </div>}
                        </div>
                    ))}
                </div>
            </div>
        )
    }
}

