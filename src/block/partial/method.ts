import { Block } from "..";
import { MenuItemType, MenuItemTypeValue } from "../../../component/menu/declare";
import { BlockDirective } from "../enum";
import duplicate from "../../assert/svg/duplicate.svg";
import loop from "../../assert/svg/loop.svg";
import blockcolor from "../../assert/svg/blockcolor.svg";
import link from "../../assert/svg/link.svg";
import squareplus from "../../assert/svg/squareplus.svg";
import moveTo from '../../assert/svg/moveTo.svg';
import comment from "../../assert/svg/comment.svg";
import trash from "../../assert/svg/trash.svg";
export class Block$Method {
    async onGetContextMenus(this: Block) {
        var items: MenuItemType<BlockDirective>[] = [];
        items.push({
            name: BlockDirective.delete,
            icon: trash,
            text: '删除',
            label: "delete"
        });
        items.push({
            name: BlockDirective.copy,
            text: '拷贝',
            label: "ctrl+D",
            icon: duplicate
        });
        // items.push({
        //     text: '转换为',
        //     icon: loop,
        //     childs: BlockSelectorData.first().childs.map(c => {
        //         return {
        //             name: BlockMenuAction.trun,
        //             text: c.text,
        //             label: c.label,
        //             icon: c.pic,
        //             value: c.url
        //         }
        //     })
        // });
        items.push({
            name: BlockDirective.trunIntoPage,
            text: '转换为页面',
            icon: squareplus
        });
        items.push({
            name: BlockDirective.moveTo,
            text: '移到',
            icon: moveTo
        });
        items.push({
            name: BlockDirective.link,
            text: '复制链接',
            icon: link
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.comment,
            text: '评论',
            icon: comment
        });
        items.push({
            type: MenuItemTypeValue.divide
        });
        items.push({
            name: BlockDirective.color,
            text: '颜色',
            icon: blockcolor
        });
        return items;
    }
    async onClickContextMenu(this: Block, item: MenuItemType<BlockDirective>, event: MouseEvent) {

    }
}