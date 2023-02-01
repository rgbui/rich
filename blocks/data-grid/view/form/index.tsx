import lodash from "lodash";
import React from "react";
import { ReactNode } from "react";
import { Button } from "../../../../component/view/button";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { GetFieldFormBlockInfo } from "../../element/service";
import { TableSchema } from "../../schema/meta";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";

@url(BlockUrlConstant.FormView)
export class DataGridForm extends DataGridView {
    @prop()
    noTitle: boolean = false;
    @prop()
    schemaId: string;
    @prop()
    autoCreateFeilds: boolean = false;
    isOver: boolean = false;
    schema: TableSchema;
    get schemaView() {
        if (this.schema)
            return this.schema.views.find(g => g.id == this.syncBlockId);
    }
    async loadSchema() {
        if (this.schemaId && !this.schema) {
            this.schema = await TableSchema.loadTableSchema(this.schemaId);
        }
    }
    async didMounted() {
        await this.loadSchema();
        if (this.schema) {
            if (this.view)
                this.view.forceUpdate();
        }
    }
    async initialedLoad() {
        await this.loadSchema();
        if (this.schema) {
            if (this.autoCreateFeilds == false) {
                await this.autoCreateFormFields();
                this.autoCreateFeilds = true;
            }
        }
    }
    updateSchemaViewText = lodash.debounce(async function (value) {

    }, 800)
    updateSchemaViewDescription = lodash.debounce(async function (value) {

    }, 800)
    async autoCreateFormFields() {
        var cs: Record<string, any>[] = this.schema.initUserFields.toArray(field => {
            var r = GetFieldFormBlockInfo(field);
            if (r) return r;
        })
        this.blocks.childs = [];
        await cs.eachAsync(async (dc) => {
            var block = await BlockFactory.createBlock(dc.url, this.page, dc, this);
            this.blocks.childs.push(block);
        })
    }
}

@view(BlockUrlConstant.FormView)
export class DataGridFormView extends BlockView<DataGridForm>{
    render(): ReactNode {
        return <div
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
            <div className="padding-30 round-8 shadow">
                <div><input style={{
                    fontSize: 40,
                    fontWeight: 'bold',
                    lineHeight: '50px',
                    minHeight: '50px',
                    textAlign: 'center'
                }}
                    defaultValue={this.block.schemaView.text} onInput={e => this.block.updateSchemaViewText((e.target as HTMLInputElement).value)} className="noborder w100"></input></div>

                <div className="remark"><input style={{
                    fontSize: 14,
                    textAlign: 'center'
                }} placeholder={'添加表单描述'} defaultValue={this.block.schemaView.description} onInput={e => this.block.updateSchemaViewDescription((e.target as HTMLInputElement).value)} className="noborder w100"></input></div>

                <ChildsArea childs={this.block.childs}></ChildsArea>
                {this.block.childs.length == 0 && <div className="remark flex-center padding-20">没有表单字段</div>}
                <div className="flex-center">
                    <Button>保存</Button>
                </div>
            </div>
        </div>
    }
}