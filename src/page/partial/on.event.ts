import lodash from "lodash";
import ReactDOM from "react-dom";
import { Page } from "..";
import { channel } from "../../../net/channel";
import { ElementType } from "../../../net/element.type";
import { Block } from "../../block";
import { PageDirective } from "../directive";
import { storeCopyBlocks } from "../common/copy";

export class PageOnEvent {
    onPageSave(this: Page) {
        this.emit(PageDirective.save);
    }
    onPageClose(this: Page) {
        this.emit(PageDirective.close);
    }
    async onBack(this: Page) {
        if (ElementType.SchemaRecordView == this.pe.type) {
            var url: '/page/open' | '/page/dialog' | '/page/slide' = '/page/dialog'
            if (this.openSource == 'page') url = '/page/open'
            else if (this.openSource == 'slide') url = '/page/slide'
            await channel.air(url, {
                elementUrl: this.elementUrl,
                config: { wait: false, force: true }
            })
            return;
        }
        if (this.openSource == 'page') {
            if (this.isCanEdit) {
                if ([ElementType.SchemaData, ElementType.SchemaRecordView].includes(this.pe.type)) {
                    await this.onSubmitForm();
                }
                else {
                    this.onPageSave();
                }
            }
            this.emit(PageDirective.back);
        }
        else this.onPageClose();
    }
   
    onUnmount(this: Page) {
        ReactDOM.unmountComponentAtNode(this.root);
    }
    onError(this: Page, error: Error) {
        this.emit(PageDirective.error, error);
    }
    onWarn(this: Page, error: string | Error) {
        this.emit(PageDirective.warn, error);
    }
    onFocus(this: Page, event: FocusEvent) {
        if (this.isFocus == false) {
            this.isFocus = true;
            this.emit(PageDirective.focus, event);
        }
    }
    onBlur(this: Page, event: FocusEvent) {
        if (this.isFocus == true) {
            this.isFocus = false;
            this.emit(PageDirective.blur, event);
        }
    }
    onHighlightBlock(this: Page, blocks: Block | (Block[]) | string | (string[]), scrollTo?: boolean) {
        if (lodash.isNull(blocks) || lodash.isUndefined(blocks)) return;
        var bs: Block[] = [];
        if (Array.isArray(blocks)) {
            if (blocks[0] instanceof Block) {
                bs = blocks as any;
            }
            else {
                bs = this.findAll(c => blocks.includes(c.id))
            }
        }
        else {
            if (typeof blocks == 'string') {
                var g = this.find(c => c.id == blocks);
                if (g) bs.push(g);
            }
            else if (blocks instanceof Block) bs.push(g)
        }
        bs = this.getAtomBlocks(bs);
        if (bs.length == 0) return;
        var first = bs.first();
        if (scrollTo)
            this.onPageScroll(first);
        bs.forEach(b => {
            b.el.classList.remove('shy-block-highlight');
        })
        bs.forEach(b => {
            b.el.classList.add('shy-block-highlight')
        });
        setTimeout(() => {
            bs.forEach(b => {
                b.el.classList.remove('shy-block-highlight');
            })
        }, 5000);
    }
    public hoverBlock: Block;
    onHoverBlock(this: Page, block: Block) {
        var isChange = this.hoverBlock != block;
        if (isChange && this.hoverBlock) {
            this.onOutHoverBlock(this.hoverBlock);
        }
        if (isChange) {
            this.hoverBlock = block;
            if (this.hoverBlock?.el) {
                this.hoverBlock.el.classList.add('shy-block-hover');
            }
            this.emit(PageDirective.hoverBlock, this.hoverBlock);
        }
        if (this.hoverBlock) this.kit.handle.onShowBlockHandle(this.hoverBlock);
        else this.kit.handle.onCloseBlockHandle();
    }
    onOutHoverBlock(this: Page, block: Block) {
        if (block?.el) {
            block.el.classList.remove('shy-block-hover');
        }
        this.emit(PageDirective.hoverOutBlock, block);
        this.kit.handle.onCloseBlockHandle();
    }
    async onCopyBlocks(this: Page, blocks: Block[]) {
        await storeCopyBlocks(blocks);
    }
    async onCutBlocks(this: Page, blocks: Block[]) {
        await storeCopyBlocks(blocks);
        await this.onBatchDelete(blocks);
    }
}