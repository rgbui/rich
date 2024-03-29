import { Block } from "..";
import { PageSvg } from "../../../component/svgs";
import { lst } from "../../../i18n/store";
import { UA } from "../../../util/ua";
import { BlockChildKey, BlockUrlConstant } from "../constant";

export var TextTurns = {
    blockDatas: () => [
        { url: '/textspan', label: UA.isMacOs ? '⌘+⌥+0' : 'Ctrl+Alt+0' },
        { url: '/todo', label: UA.isMacOs ? '⌘+⌥+5' : 'Ctrl+Alt+5' },
        { url: '/head', label: UA.isMacOs ? '⌘+⌥+1' : 'Ctrl+Alt+1' },
        { url: '/head?{level:"h2"}', label: UA.isMacOs ? '⌘+⌥+2' : 'Ctrl+Alt+2' },
        { url: '/head?{level:"h3"}', label: UA.isMacOs ? '⌘+⌥+3' : 'Ctrl+Alt+3' },
        { url: '/head?{level:"h4"}', label: UA.isMacOs ? '⌘+⌥+4' : 'Ctrl+Alt+4' },
        { url: '/head?{toggle:true}', label: UA.isMacOs ? '⌘+⌥+1' : 'Ctrl+Alt+1' },
        { url: '/head?{level:"h2",toggle:true}', label: UA.isMacOs ? '⌘+⌥+2' : 'Ctrl+Alt+2' },
        { url: '/head?{level:"h3",toggle:true}', label: UA.isMacOs ? '⌘+⌥+3' : 'Ctrl+Alt+3' },
        { url: '/head?{level:"h4",toggle:true}', label: UA.isMacOs ? '⌘+⌥+4' : 'Ctrl+Alt+4' },
        { url: '/link', text: lst('页面'), label: UA.isMacOs ? '⌘+⌥+9' : 'Ctrl+Alt+9', icon: PageSvg },
        { url: '/list?{listType:0}', label: UA.isMacOs ? '⌘+⌥+7' : 'Ctrl+Alt+6' },
        { url: '/list?{listType:1}', label: UA.isMacOs ? '⌘+⌥+6' : 'Ctrl+Alt+7' },
        { url: '/list?{listType:2}', label: UA.isMacOs ? '⌘+⌥+8' : 'Ctrl+Alt+8' },
        { url: '/quote' },
        { url: '/callout' }
    ],
    async turn(block: Block, turnToUrl) {
        switch (turnToUrl) {
            case '/textspan':
            case '/todo':
            case '/head':
            case '/head?{level:"h2"}':
            case '/head?{level:"h3"}':
            case '/head?{level:"h4"}':
            case '/head?{toggle:true}':
            case '/head?{level:"h2",toggle:true}':
            case '/head?{level:"h3",toggle:true}':
            case '/head?{level:"h4",toggle:true}':
            case '/list?{listType:1}':
            case '/list?{listType:0}':
            case '/list?{listType:2}':
            case '/quote':
            case '/callout':
                var data = await block.get();
                delete data.url;
                delete data.id;
                delete data.date;
                if (block.url.startsWith('/head')) delete data.level;
                /**
                 * list 块转成其它块，期subChilds需要移到最外面，否则转换的不正常
                 */
                if (block.hasSubChilds) {
                    if (![BlockUrlConstant.List, '/todo', '/quote', '/callout'].some(s => turnToUrl.startsWith(s))) {
                        if (block.subChilds.length > 0) {
                            var cs = block.subChilds.map(c => c);
                            await block.parent.appendArray(cs, block.at + 1, block.parent.hasSubChilds ? BlockChildKey.subChilds : BlockChildKey.childs);
                        }

                        delete data.blocks[BlockChildKey.subChilds];
                    }
                    if (BlockUrlConstant.List == block.url)
                        delete data.listType;
                }
                if (block.url == '/todo') delete data.checked;
                return { url: turnToUrl, ...data }
                break;
        }
    }
}