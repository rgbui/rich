import React from "react";
import { BlockUrlConstant } from "../../block/constant";
import { Page } from "..";
import { Rect } from "../../common/vector/point";
import { PageLayoutType } from "../declare";




export class SnapRecordPage extends React.Component<{ elementUrl: string, content: Record<string, any> }> {
    componentDidMount(): void {
        this.bindPage();
    }
    page: Page;
    async bindPage() {
        var page = this.page = new Page();
        page.openSource = "popup"
        page.isSchemaRecordViewTemplate = false;
        page.customElementUrl = this.props.elementUrl;
        page.readonly = true;
        page.bar = false;
        page.hideDocTitle = true;
        page.pageLayout = { type: PageLayoutType.doc };
        page.pageTheme = {
            bgStyle: {
                mode: 'color',
                color: 'transparent',
            },
            contentStyle: {
                color: 'light',
                transparency: "noborder"
            },
            coverStyle: {
                display: 'outside'
            }
        }
        await this.page.load({
            url: '/page', views: [{
                url: BlockUrlConstant.View,
                blocks: { childs: this.props.content || [] }
            }]
        })
        var bound = Rect.fromEle(this.el);
        page.render(this.el, {
            width: bound.width,
            height: bound.height
        });
    }
    el: HTMLElement;
    render() {
        return <div className="relative h100 w100">
            <div ref={e => this.el = e}></div>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                boxShadow: 'rgba(55, 53, 47, 0.09) 0px -1px 0px 0px inset',
                right: 0,
                zIndex: 1000
            }}></div>
        </div>
    }
}
