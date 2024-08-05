import { Block } from "../../src/block";
import { BlockCssName } from "../../src/block/pattern/css";
import { Note } from "./note";


export var BoardTurns = {
    async turn(block: Block, turnToUrl) {
        var data = await block.get();
        delete data.url;
        delete data.id;
        delete data.date;
        var pattern = data.pattern;
        var style = pattern.styles[0]?.cssList;
        var fontStyle = style?.find(s => s.cssName == BlockCssName.font);
        switch (turnToUrl) {
            case '/shape':
            case '/flow/mind':
            case '/note':
            case '/board/page/card':
            case '/textspan':
                if (['/textspan', '/flow/mind'].includes(turnToUrl)) {
                    delete data.fixedWidth;
                    delete data.fixedHeight
                }
                if (['/textspan', '/flow/mind'].includes(block.url)) {
                    delete data.fixedWidth;
                    delete data.fixedHeight
                }
                if (block.url == '/textspan') {
                    if (fontStyle) {
                        fontStyle.fontSize = Math.round((block as any).fontScale * 14)
                    }
                    else if (style) {
                        style.push({
                            cssName: BlockCssName.font,
                            fontSize: Math.round((block as any).fontScale * 14)
                        })
                    }
                    else data.pattern = {
                        styles: [
                            {
                                name: 'default',
                                cssList: [{
                                    cssName: BlockCssName.font,
                                    fontSize: Math.round((block as any).fontScale * 14)
                                }]
                            }
                        ]
                    }
                }
                if (block.url == '/note') {
                    var fillStyle = style?.find(s => s.cssName == BlockCssName.fill);
                    if (fillStyle) {
                        fillStyle.color = (block as Note).color;
                        fillStyle.mode = 'color'
                    }
                    else if (style) {
                        style.push({
                            cssName: BlockCssName.fill,
                            color: (block as Note).color,
                            mode: 'color'
                        })
                    }
                    else data.pattern = {
                        styles: [
                            {
                                name: 'default',
                                cssList: [{
                                    cssName: BlockCssName.fill,
                                    color: (block as Note).color,
                                    mode: 'color'
                                }]
                            }
                        ]
                    }
                }
                if (turnToUrl == '/textspan') {
                    if (fontStyle) {
                        data.fontScale = fontStyle.fontSize / 14
                        fontStyle.fontSize = 14
                    }
                }
                if (block.url == '/flow/mind') {
                    data = { blocks: {}, matrix: data.matrix, content: data.content, pattern: data.pattern };
                }
                if (block.url == '/board/page/card') {
                    var row = await block.childs.first().getPlain()
                    data = { blocks: {}, matrix: data.matrix, content: row, pattern: data.pattern };
                }
        }
        return { url: turnToUrl, ...data }
    }
}
