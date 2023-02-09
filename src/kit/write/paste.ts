import { Kit } from "..";
import { TextCode } from "../../../blocks/present/code/code";
import { getImageSize } from "../../../component/file";
import { InputTextPopSelectorType } from "../../../extensions/common/input.pop";
import { useInputUrlSelector } from "../../../extensions/url";
import { channel } from "../../../net/channel";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { BlockChildKey, BlockUrlConstant } from "../../block/constant";
import { Matrix } from "../../common/matrix";
import { Point, Rect } from "../../common/vector/point";
import { ActionDirective } from "../../history/declare";
import { parseDom } from "../../import-export/html/parse";
import { readCopyBlocks } from "../../page/common/copy";
import { PageLayoutType } from "../../page/declare";
import { inputBackspaceDeleteContent } from "./input";
import { InputForceStore } from "./store";
// const URL_RGEX = /https?:\/\/([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*(:[\d]+)?\/?/ig;

var strRegex = "^((https|http|ws|wss|ftp|rtsp|mms)?://)"
    + "?(([0-9a-zA-Z_!~*'().&=+$%-]+: )?[0-9a-zA-Z_!~*'().&=+$%-]+@)?" //ftp的user@ 
    + "(([0-9]{1,3}\.){3}[0-9]{1,3}" // IP形式的URL- 199.194.52.184 
    + "|" // 允许IP和DOMAIN（域名）
    + "([0-9a-zA-Z_!~*'()-]+\.)*" // 域名- www. 
    + "([0-9a-zA-Z][0-9a-zA-Z-]{0,61})?[0-9a-zA-Z]\." // 二级域名 
    + "[a-zA-Z]{2,6})" // first level domain- .com or .museum 
    + "(:[0-9]{1,4})?" // 端口- :80 
    + "((/?)|" // a slash isn't required if there is no file name 
    + "(/[0-9a-zA-Z_!~*'().;?:@&=+$,%#-]+)+/?)$";

var URL_RGEX = new RegExp(strRegex);
//URL_RGEX=/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\*\+,;=.]+$/i

console.log('si', URL_RGEX.test('http://localhost:8081/ws/4/r?url=%2FSchema%2F4K5tUqSw-4%2FView%2F4L09CBhQ-4'));
console.log('ssss',URL_RGEX.test('https://localhost:8081/ws/4/r?url=gggg'));
console.log(new URL('http://localhost:8081/ws/4/r?url=%2FSchema%2F4K5tUqSw-4%2FView%2F4L09CBhQ-4'));
export async function onPasteBlank(kit: Kit, event: ClipboardEvent) {
    if (kit.page.pageLayout?.type == PageLayoutType.board) {
        var files: File[] = Array.from(event.clipboardData.files);
        var text = event.clipboardData.getData('text/plain');
        var html = event.clipboardData.getData('text/html');
        kit.operator.onClearPage(); event.preventDefault();
        var point = kit.operator.moveEvent;
        var fra: Block = kit.page.getPageFrame();
        var gm = fra.globalWindowMatrix;
        var re = gm.inverseTransform(Point.from(point));
        if (!html && text || text && html && html.endsWith(text)) {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var url = BlockUrlConstant.TextSpan;
                var data = { content: text } as any;
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(url, data, fra);
                kit.boardSelector.clearSelector();
                newBlock.mounted(() => {
                    kit.picker.onPicker([newBlock]);
                    kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });

                })
            });
        }
        else if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                var file = files[i];
                if (file.type.startsWith('image/')) {
                    //图片
                    var r = await channel.post('/ws/upload/file', {
                        file,
                        uploadProgress: (event) => {
                            // console.log(event, 'ev');
                            if (event.lengthComputable) {
                                // this.progress = `${util.byteToString(event.total)}${(100 * event.loaded / event.total).toFixed(2)}%`;
                                // this.forceUpdate();
                            }
                        }
                    })
                    if (r.ok) {
                        if (r.data?.file?.url) {
                            var size = await getImageSize(r.data.file.url);
                            var url = BlockUrlConstant.BoardImage;
                            var data = {
                                originSize: size,
                                fixedWidth: size.width,
                                fixedHeight: size.height,
                                src: { name: 'upload', ...r.data.file }
                            } as any
                            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                                var ma = new Matrix();
                                ma.translate(re.x, re.y);
                                data.matrix = ma.getValues();
                                var newBlock = await kit.page.createBlock(url, data, fra);
                                kit.boardSelector.clearSelector();
                                newBlock.mounted(() => {
                                    kit.picker.onPicker([newBlock]);
                                    kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });

                                })
                            });
                            // this.props.change(r.data?.file as any);
                        }
                    }
                }
                else {

                }
            }
        }
        else {
            await fra.page.onAction(ActionDirective.onBoardToolCreateBlock, async () => {
                var url = BlockUrlConstant.TextSpan;
                var data = { content: text } as any;
                var ma = new Matrix();
                ma.translate(re.x, re.y);
                data.matrix = ma.getValues();
                var newBlock = await kit.page.createBlock(url, data, fra);
                kit.boardSelector.clearSelector();
                newBlock.mounted(() => {
                    kit.picker.onPicker([newBlock]);
                    kit.anchorCursor.onFocusBlockAnchor(newBlock, { render: true, merge: true });

                })
            });
        }
    }
}

export async function onPaste(kit: Kit, aa: AppearAnchor, event: ClipboardEvent) {
    var files: File[] = Array.from(event.clipboardData.files);
    var text = event.clipboardData.getData('text/plain');
    var html = event.clipboardData.getData('text/html');
    kit.operator.onClearPage();
    if (!html && text || text && html && html.endsWith(text)) {
        event.preventDefault();
        if (URL_RGEX.test(text)) {
            await onPasteUrl(kit, aa, text);
        }
        else await onPasteInsertText(kit, aa, text);
        return;
    }
    if (files.length > 0) {
        event.preventDefault();
        //说明复制的是文件
        await onPasterFiles(kit, aa, files);
    }
    else if (html) {
        var ma;
        if (ma = html.match(new RegExp(`data\\-name\="shy\\.live"[\\s]+content\\="([^"]+)"`))) {
            var id = ma[1];
            if (id) {
                var bs = readCopyBlocks(id);
                /**
                 * 这里的bs有可能是从诗云的一个浏览器复制到另一个浏览器，
                 * 本质上里面的内容没有缓存
                 */
                if (Array.isArray(bs) && bs.length > 0) {
                    event.preventDefault();
                    await onPasteCreateBlocks(kit, aa, bs);
                    return;
                }

            }
        }
        try {
            event.preventDefault();
            if (aa.block.url == BlockUrlConstant.Code) {
                await onPasteInsertText(kit, aa, text);
                return;
            }
            if (!aa.block.isSupportTextStyle) {
                await onPasteInsertPlainText(kit, aa, text);
                return;
            }
            var regexText = text.replace(/[\(\)\\\.\[\]\*\?]/g, ($, $1) => {
                return '\\' + $
            })
            if (html.match(new RegExp('([\\s]*<[^>]+>[\\s]*)?<[^>]+>' + regexText + '</[^>]+>'))) {
                /**
                 * 这里表示当前的文本就仅仅在外面包一层html，没有多个块
                 * 列如:
                 * text: 你好
                 * html: <p>你好</p>
                 */
                if (URL_RGEX.test(text)) {
                    await onPasteUrl(kit, aa, text);
                }
                else {
                    await onPasteInsertText(kit, aa, text);
                }
                return;
            }
            let parser = new DOMParser();
            var doc = parser.parseFromString(html, "text/html");
            var blocks = await parseDom(doc);
            if (blocks?.length > 0) {
                if (blocks.length == 1 && blocks[0].url == BlockUrlConstant.TextSpan) {
                    var cs = blocks[0].blocks.childs
                    if (cs.length == 1 && cs[0].url == BlockUrlConstant.Text) {
                        var content = cs[0].content;
                        if (URL_RGEX.test(content)) await onPasteUrl(kit, aa, text)
                        else await onPasteInsertText(kit, aa, text);
                        return;
                    }
                }
                await onPasteCreateBlocks(kit, aa, blocks);
            }
        }
        catch (ex) {
            console.error(ex);
            await onPasteInsertText(kit, aa, text);
        }
    }
}
async function onPasterFiles(kit: Kit, aa: AppearAnchor, files: File[]) {
    await InputForceStore(aa, async () => {
        var rowBlock = aa.block.closest(x => !x.isLine);
        var firstBlock = rowBlock;
        for (let i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.type.startsWith('image/')) {
                //图片
                rowBlock = await rowBlock.visibleDownCreateBlock('/image', { initialData: { file } });
            }
            else {
                rowBlock = await rowBlock.visibleDownCreateBlock('/file', { initialData: { file } });
            }
        }
        if (firstBlock.isContentEmpty) {
            await firstBlock.delete();
        }
        kit.page.addUpdateEvent(async () => {

        })
    })
}
async function onPasteCreateBlocks(kit: Kit, aa: AppearAnchor, blocks: any[]) {
    if (blocks.length == 0) return;
    var sel = window.getSelection();
    await InputForceStore(aa, async () => {
        /**
         * 这说明只有一行，那么在当前的位置插入它
         */
        if (blocks.length == 1 && blocks[0].url == BlockUrlConstant.TextSpan) {
            var content = aa.textContent;
            var offset = sel.focusOffset;
            var rowBlock = aa.block.closest(x => !x.isLine);
            var beforeText = content.slice(0, offset);
            var lastText = content.slice(offset);
            if (rowBlock.childs.length == 0) {
                await rowBlock.updateProps({ content: '' });
                if (beforeText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: beforeText });
                var bs = blocks[0].blocks.childs;
                var rs = await rowBlock.appendArrayBlockData(bs, undefined, BlockChildKey.childs);
                if (lastText) await rowBlock.appendBlock({ url: BlockUrlConstant.Text, content: lastText });
                kit.page.addUpdateEvent(async () => {
                    kit.anchorCursor.onFocusBlockAnchor(rs.last(), { last: true, render: true, merge: true });
                })
            }
            else {
                await aa.block.updateProps({ content: beforeText });
                var bs = blocks[0].blocks.childs;
                var rs = await aa.block.parent.appendArrayBlockData(bs, aa.block.at, BlockChildKey.childs);
                if (lastText) await aa.block.parent.appendBlock({
                    url: BlockUrlConstant.Text,
                    pattern: await aa.block.pattern.cloneData(),
                    content: lastText
                });
                if (aa.block.isContentEmpty) await aa.block.delete();
                kit.page.addUpdateEvent(async () => {
                    kit.anchorCursor.onFocusBlockAnchor(rs.last(), { last: true, render: true, merge: true });
                })
            }
        }
        else {
            var rowBlock = aa.block.closest(x => !x.isLine);
            var firstBlock = rowBlock;
            if (firstBlock.isContentEmpty) {
                blocks[0].url = firstBlock.url;
            }
            for (let i = 0; i < blocks.length; i++) {
                var bd = blocks[i];
                rowBlock = await rowBlock.visibleDownCreateBlock(bd.url, bd);
            }
            if (firstBlock.isContentEmpty) {
                await firstBlock.delete();
            }
            kit.page.addUpdateEvent(async () => {
                kit.anchorCursor.onFocusBlockAnchor(rowBlock, { last: true, render: true, merge: true });
            })
        }
    })
}
async function onPasteInsertText(kit: Kit, aa: AppearAnchor, text: string) {
    if (aa.isSolid) {
        kit.writer.onSolidInputCreateTextBlock(aa, undefined, text);
    }
    else if ((aa.isText && aa.block.isLine && !(aa.block.isTextContent && aa.block.asTextContent.isBlankPlain) && !aa.block.next)) {
        this.onRowLastLineBlockCreateTextBlock(aa, undefined, text);
        return;
    }
    else {
        var content = aa.textContent;
        var sel = window.getSelection();
        if (sel.isCollapsed) {
            var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
            aa.setContent(content.slice(0, offset) + text + content.slice(offset))
            aa.collapse(offset + text.length);
            await InputForceStore(aa, async () => {
                kit.page.addUpdateEvent(async () => {
                    if (aa.block.url == BlockUrlConstant.Code) {
                        (aa.block as TextCode).renderCode()
                    }
                })
            })
        }
        else {
            await inputBackspaceDeleteContent(kit.writer, aa, null, { insertContent: text })
        }
    }
}
async function onPasteInsertPlainText(kit: Kit, aa: AppearAnchor, text: string) {
    var content = aa.textContent;
    var sel = window.getSelection();
    if (sel.isCollapsed) {
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        aa.setContent(content.slice(0, offset) + text + content.slice(offset))
        aa.collapse(offset + text.length);
        await InputForceStore(aa, async () => {
        })
    }
    else {
        var s = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        var e = aa.getCursorOffset(sel.anchorNode, sel.anchorOffset);
        if (s > e) [e, s] = [s, e];
        aa.setContent(content.slice(0, s) + text + content.slice(e));
        aa.collapse(s + text.length);
        await InputForceStore(aa, async () => {
        })
    }
}
async function onPasteUrl(kit: Kit, aa: AppearAnchor, url: string) {
    if (aa.isSolid) {
        await this.kit.page.onActionAsync(ActionDirective.onSolidBlockInputTextContent, async () => {
            var text = aa.solidCursorEl.innerText;
            aa.solidCursorEl.innerHTML = '';
            var c = url;
            var newBlock = await aa.block.parent.appendBlock({
                url: BlockUrlConstant.Text,
                content: c
            },
                aa.block.at + 1,
                aa.block.parentKey
            );
            this.kit.page.addUpdateEvent(async () => {
                this.kit.writer.cursor.onFocusBlockAnchor(newBlock, { last: true, render: true, merge: true });
                var sel = window.getSelection();
                var rect = Rect.fromEle(sel.getRangeAt(0));
                kit.writer.inputPop = {
                    rect,
                    type: InputTextPopSelectorType.UrlSelector,
                    offset: 0,
                    aa: newBlock.appearAnchors.first(),
                    selector: (await useInputUrlSelector())
                };
                await kit.writer.inputPop.selector.open(rect, url, (...data) => {
                    kit.writer.onInputPopCreateBlock(...data);
                });
            });
        });
    }
    else {
        var content = aa.textContent;
        var sel = window.getSelection();
        var offset = aa.getCursorOffset(sel.focusNode, sel.focusOffset);
        aa.setContent(content.slice(0, offset) + url + content.slice(offset));
        aa.collapse(offset + url.length);
        var rect = Rect.fromEle(sel.getRangeAt(0));
        kit.writer.inputPop = {
            rect,
            type: InputTextPopSelectorType.UrlSelector,
            offset: offset - url.length,
            aa,
            selector: (await useInputUrlSelector())
        };
        await kit.writer.inputPop.selector.open(rect, url, (...data) => {
            kit.writer.onInputPopCreateBlock(...data);
        });
    }
}

