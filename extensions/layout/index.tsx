import React from "react";
import { EventsComponent } from "../../component/lib/events.component";
import { LayoutCol2Svg, LayoutCol3Svg, LayoutColLeftSvg, LayoutColRightSvg, LayoutColSvg, LayoutContentCoverSvg, LayoutContentHeadFootSvg, LayoutContentsSvg, LayoutContentSvg } from "../../component/svgs";
import { Col, Row, Space } from "../../component/view/grid";
import { Icon } from "../../component/view/icon";
import { Tip } from "../../component/view/tip";
import { Page } from "../../src/page";
import { PopoverSingleton } from "../popover/popover";
import { PopoverPosition } from "../popover/position";
import "./style.less";

// export type FillStyle = {
//     /**
//      * 如果为none表示为透明
//      */
//     mode?: 'none' | 'color' | 'image' | 'linear-gradient' | 'radial-gradient';
//     /***
//   * background-color:color
//   */
//     color?: string;
//     /***background-image */
//     src?: string;
//     objectFit?: 'cover',
//     objectPosition?: number,
//     /***linear-gradient */
//     angle?: number;
//     grads?: { grad: number, color: string }[];

//     border?: string,
//     boxShadow?: string,
//     borderRadius?: number
// }


// export interface PageAreaLayout {
//     head?: boolean,
//     headContent?: boolean,
//     headHeight?: number,
//     headFill?: FillStyle,

//     foot?: boolean,
//     footContent?: boolean,
//     footHeight?: boolean,
//     footFill?: FillStyle,

//     bodyFill?: FillStyle,
//     bodyOffsetTop?: number;
//     bodyOffsetBottom?: number;

//     contentFill?: FillStyle;
//     fullScreen?: boolean,

//     /**是否为大屏 */
//     bigScreen?: boolean;
//     /**
//      * 大屏的宽度
//      */
//     bigScreenWidth?: number

// }


/***
 * 正常的文档  content有边框
 * 带有封面的文档
 * 带有封面且内容背景有图的文档 QQ空间（干扰比较强）
 * 
 * 文档分区块的，从上到下，每个区域的背景
 * （头部、内容、底部）
 *  内容可以有在分N个
 * 
 * 
 * 处理上不好的地方
 * 如果背景是纯色、渐变色，则文字与纯色如何搭配
 * 如果背景是图片，则内容最好形成一个白色的框
 * 
 */

export class PageLayout extends EventsComponent {
    render() {
        return <div className="page-layout-selector">
            {/* <Row>
                <Col>宽度：</Col>
                <Col>
                    <Space>
                        <span>小宽</span>
                        <span>大宽</span>
                        <span>全屏</span>
                        <span>大屏</span>
                    </Space>
                </Col>
            </Row> */}
            <Row>
                <Col>版面:</Col>
                <Col>
                    <Space>
                        <Tip overlay={'文档'}><div>
                            <Icon size={30} icon={LayoutContentSvg}></Icon>
                        </div></Tip>
                        <Tip overlay={'带有封面的文档'}><div>
                            <Icon size={30} icon={LayoutContentCoverSvg}></Icon></div></Tip>
                        <Tip overlay={'顶部内容底部'}><div>
                            <Icon size={30} icon={LayoutContentHeadFootSvg}></Icon>
                        </div>
                        </Tip>
                        <Tip overlay={'多行内容'}><div>
                            <Icon size={30} icon={LayoutContentsSvg}></Icon>
                        </div></Tip>
                    </Space>
                </Col>
            </Row>
            <Row>
                <Col>分栏:</Col>
                <Col>
                    <Space>
                        <Tip overlay={'一栏'}>
                            <div>
                                <Icon size={30} icon={LayoutColSvg}></Icon>
                            </div>
                        </Tip>
                        <Tip overlay={'两栏'}>
                            <div>
                                <Icon size={30} icon={LayoutCol2Svg}></Icon>
                            </div>
                        </Tip>
                        <Tip overlay={'三栏'}>
                            <div>
                                <Icon size={30} icon={LayoutCol3Svg}></Icon>
                            </div>
                        </Tip>
                        <Tip overlay={'偏左'}>
                            <div>
                                <Icon size={30} icon={LayoutColLeftSvg}></Icon>
                            </div>
                        </Tip>
                        <Tip overlay={'偏右'}>
                            <div>
                                <Icon size={30} icon={LayoutColRightSvg}></Icon>
                            </div>
                        </Tip>
                        {/* <span>N栏</span> */}
                    </Space>
                </Col>
            </Row>

        </div>
    }
    open(page: Page) {

    }
}

export async function usePageLayout(pos: PopoverPosition, options?: { page: Page }) {
    let popover = await PopoverSingleton(PageLayout, { mask: true });
    let fv = await popover.open(pos);
    fv.open(options.page);
    return new Promise((resolve: (data: {
        text: string,
        url: string
    }) => void, reject) => {
        fv.only('save', (value) => {
            popover.close();
            resolve(value);
        });
        fv.only('close', () => {
            popover.close();
            resolve(null);
        });
        popover.only('close', () => {
            resolve(null)
        });
    })
}
