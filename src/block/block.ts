
import { BlockType, BlockTypeToComponentName } from "./block.type";
import { Editor } from "../editor/editor";
import { Prop } from "./prop";
import { Mode } from "./mode";
import { ExpressList, VcExpress } from "../components/express";
import { util } from "../util/util";

export class Block {
    id: string;
    private editor: Editor;
    express: VcExpress;
    type: BlockType;
    props: Prop[] = [];
    modes: Mode[] = [];
    private modeId: string;
    blocks: Block[] = [];
    parent: Block;
    get mode() {
        return this.modes.find(x => x.id == this.modeId);
    }
    constructor(data: { blockInfo?: Record<string, any>, editor: Editor, parent?: Block }) {
        this.editor = data.editor;
        this.parent = data.parent;
        this.willInit(data.blockInfo);
        this.willCreate();
    }
    private willInit(blockInfo?: Record<string, any>) {
        if (typeof blockInfo == 'undefined') {
            blockInfo = {
                id: util.guid()
            }
        }
        if (typeof blockInfo.modeId == 'undefined') {
            var modeId = util.guid();
            blockInfo.modeId = modeId;
            blockInfo.modes = [{ id: modeId }];
        }
        if (typeof blockInfo.id == 'undefined') blockInfo.id = util.guid();
        for (let m in blockInfo) {
            if (m == 'modes' || m == 'props') continue;
            else this[m] = blockInfo[m];
        }
        this.modes = [];
        if (Array.isArray(blockInfo.modes)) {
            blockInfo.modes.each(mi => {
                var mode = new Mode(mi, this);
                this.modes.push(mode);
            })
        }
        this.props = [];
        if (Array.isArray(blockInfo.props)) {
            blockInfo.props.each(pro => {
                var pr = new Prop(pro, this);
                this.props.push(pr);
            })
        }
        if (typeof this.type != 'undefined') {
            var exp = ExpressList.find(x => x.type == this.type);
            if (!exp) {
                throw new Error('not found block type express:' + BlockType[this.type])
            }
            this.express = exp;
        }
        else {
            throw new Error('the block type is not undefined');
        }
    }
    private willCreate() {

    }
    static createBlock(editor: Editor, blockInfo?: Record<string, any>,
        options?: {
            parent?: Block,
            at?: number
        }) {
        var block = new Block({ editor: editor, blockInfo: blockInfo });
        if (typeof options == 'undefined') options = {
            parent: undefined,
            at: undefined
        }
        if (options.parent) {
            if (typeof options.at == 'number') options.parent.blocks.push(block)
            else options.parent.blocks.insertAt(options.at, block);
        }
        else {
            editor.append(block, options.at);
        }
        return block;
    }
    getText() {
        var pro = this.findPro('text');
        return pro.value;
    }
    setText(text: string) {
        var pro = this.findPro('text');
        if (!pro) {
            this.createPro({ text: text })
        }
        else pro.value = text;
    }
    findPro(predict: string | ((pro: Prop) => boolean)) {
        if (typeof predict == 'string') {
            var name = predict;
            predict = (pro: Prop) => pro.name == name;
        }
        if (typeof predict == 'function') {
            if (this.mode) {
                let pro = this.mode.props.find(predict);
                if (pro) return pro;
            }
            return this.props.find(predict);
        }
    }
    get propJson() {
        var json: Record<string, any> = {};
        this.express.propNames.each(name => {
            var pro = this.props.find(z => z.name == name);
            if (pro) json[name] = pro.value
            else {
                var ep = this.express.props.find(x => x.name == name);
                if (ep && typeof ep.default != 'undefined') json[name] = util.clone(ep.default);
            }
        });
        this.express.modePropNames.each(name => {
            var pro = this.mode.props.find(z => z.name == name);
            if (pro) json[name] = pro.value
            else {
                var ep = this.express.props.find(x => x.name == name);
                if (ep && typeof ep.default != 'undefined') json[name] = util.clone(ep.default);
            }
        })
        return json;
    }
    /**
     * 
     * @param proInfo  [key]:value
     * 
     */
    createPro(proInfo: Record<string, any>) {
        var pros: Prop[] = [];
        for (let key in proInfo) {
            let value = proInfo[key];
            if (this.express.propNames.exists(key)) {
                var pro = new Prop({ name: key, val: value }, this);
                pros.push(pro);
                this.props.push(pro);
            }
            else if (this.express.modePropNames.exists(key)) {
                var pro = new Prop({ name: key, val: value }, this.mode);
                pros.push(pro);
                this.mode.props.push(pro);
            }
        }
        return pros;
    }
    private vm;
    get ele(): HTMLElement {
        return this.vm.$el as HTMLElement;
    }
    get viewData() {
        var self = this;
        var ref = {};
        Object.defineProperty(ref, 'block', {
            get() {
                return self;
            }
        });
        var json: Record<string, any> = {
            id: this.id,
            componentName: BlockTypeToComponentName(this.type),
            props: { ...this.propJson, rf: ref },
            events: {}
        };
        if (Array.isArray(this.blocks) && this.blocks.length > 0) {
            json.blocks = this.blocks.map(b => b.viewData);
        }
        return json;
    }
}

