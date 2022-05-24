
/**
 * 
 * 网易云音乐
 * 原网址：https://music.163.com/#/song?id=1928721936
 * 嵌入：<iframe referrerpolicy="origin" src="https://music.163.com/outchain/player?type=2&amp;id=1928721936&amp;auto=0&amp;height=66" frameborder="no" allowfullscreen="" sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" class="" style="width: 100%; height: 100%; pointer-events: auto;"></iframe>
 * 
 * B站
 * 原网址：
 * https://www.bilibili.com/video/BV1xU4y1m7BK?spm_id_from=333.851.b_7265636f6d6d656e64.4
 *  嵌入：<iframe referrerpolicy="origin" src="//player.bilibili.com/player.html?bvid=BV1xU4y1m7BK&amp;page=1&amp;high_quality=1&amp;as_wide=1&amp;allowfullscreen=true" frameborder="no" allowfullscreen="" sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" class="" style="width: 100%; height: 100%;"></iframe>
 * 
 */

import React from "react";
import { ResourceArguments } from "../../extensions/icon/declare";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
@url('/embed')
export class Embed extends Block {
    @prop()
    src: ResourceArguments = { name: 'none', url: '' }
}
@view('/embed')
export class FileView extends BlockView<Embed>{
    render() {
        return <div className='sy-block-embed' style={this.block.visibleStyle}>
            <iframe referrerPolicy="origin" src="https://music.163.com/outchain/player?type=2&amp;id=1928721936&amp;auto=0&amp;height=66" frameBorder="no" sandbox="allow-top-navigation-by-user-activation allow-same-origin allow-forms allow-scripts allow-popups" style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}></iframe>
        </div>
    }
}