import lodash from "lodash";
import React from "react";
import { AddTwoSvg, LinkSvg, LockSvg, UnlockSvg } from "../../../../component/svgs";
import { Button } from "../../../../component/view/button";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItemType } from "../../../../component/view/menu/declare";
import { BlockUrlConstant } from "../../../../src/block/constant";
import { BlockFactory } from "../../../../src/block/factory/block.factory";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { Point, Rect } from "../../../../src/common/vector/point";
import { PageLayoutType } from "../../../../src/page/declare";
import { OriginFormField } from "../../element/form/origin.field";
import { GetFieldFormBlockInfo } from "../../element/service";
import { Field } from "../../schema/field";
import { TableSchema } from "../../schema/meta";
import { GetFieldTypeSvg } from "../../schema/util";
import { DataGridView } from "../base";
import { DataGridTool } from "../components/tool";
import { GridMap } from "../../../../src/page/grid";

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
        this.gridMap = new GridMap(this)
        await this.loadSchema();
        if (this.autoCreateFeilds == false) {
            await this.autoCreateFormFields();
            this.autoCreateFeilds = true;
        }
        if (this.schema) {
            await this.checkRepeat();
            if (this.view)
                this.view.forceUpdate();
        }
    }
    isSubmit: boolean = false;
    async checkRepeat() {
        if (this.schemaView) {
            console.log(this.schemaView);
            /**
             * 说明是禁止多次提交
             */
            if (this.schemaView.disabledUserMultiple == true) {
                var r = await this.schema.checkSubmit();
                if (r.ok) {
                    this.isSubmit = r.data.exists;
                }
            }
        }
    }
    updateSchemaViewText = lodash.debounce(async function (value) {
        await this.schema.onSchemaOperate([
            { name: 'updateSchemaView', id: this.schemaView.id, data: { text: value } }
        ]);
    }, 800)
    updateSchemaViewDescription = lodash.debounce(async function (value) {
        await this.schema.onSchemaOperate([
            { name: 'updateSchemaView', id: this.schemaView.id, data: { description: value } }
        ]);
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
    saveTip: boolean = false;
    async onSave(event: React.MouseEvent, button: Button) {
        button.loading = true;
        try {
            this.saveTip = false;
            var row = this.getSchemaRow();
            var g = await this.schema.rowAdd({ data: row })
            this.saveTip = true;
            if (this.schemaView?.disabledUserMultiple == true) {
                this.isSubmit = true;
            }
        }
        catch (ex) {

        }
        finally {
            button.loading = false;
            this.forceUpdate();
        }
    }
    async onFormSettings(event: React.MouseEvent) {
        if (this.dataGridTool) this.dataGridTool.isOpenTool = true;
        var self = this;
        var rect = Rect.fromEvent(event);
        var menus = [
            { text: '复制链接', icon: LinkSvg, name: 'copylink' },
            { type: MenuItemType.divide },
            {
                text: '禁止多次提交',
                name: 'disabledUserMultiple',
                checked: this.schemaView?.disabledUserMultiple ? true : false,
                type: MenuItemType.switch,
                icon: AddTwoSvg
            },
            { type: MenuItemType.divide },
            {
                text: '锁定表单视图',
                name: 'lock',
                checked: this.schemaView?.locker?.lock ? true : false,
                type: MenuItemType.switch,
                icon: this.schemaView?.locker?.lock ? UnlockSvg : LockSvg
            }
        ]
        var um = await useSelectMenuItem({ roundArea: rect }, menus, {
            async input(item) {
                if (item.name == 'lock') {
                    await self.onTableSchemaLock(item.checked);
                }
                else if (item.name == 'disabledUserMultiple') {
                    await self.schema.onSchemaOperate([
                        {
                            name: 'updateSchemaView',
                            id: self.schemaView?.id,
                            data: {
                                disabledUserMultiple: item.checked
                            }
                        }
                    ]);
                }
            }
        });
        if (um) {
            switch (um.item.name) {
                case 'copylink':
                    this.onCopyViewLink();
                    break;
                case 'allowUserMultiple':
                    break;
                case 'lock':
                    break;
            }
        }
        if (this.dataGridTool) this.dataGridTool.isOpenTool = false;
        this.onOver(this.getVisibleContentBound().contain(Point.from(this.page.kit.operator.moveEvent)))
    }
    async onToggleFieldView(field: Field, checked: boolean) {
        await this.page.onAction('onToggleFieldView', async () => {
            this.page.addBlockChange(this);
            if (checked) {
                var b = GetFieldFormBlockInfo(field);
                if (b) {
                    var newBlock = await this.page.createBlock(b.url, b, this);
                    if (this.page.formRowData) newBlock.updateProps({ value: field.getValue(this.page.formRowData) })
                }
            }
            else {
                var f = this.find(c => (c instanceof OriginFormField) && c.field.id == field.id);
                if (f) await f.delete()
            }
        });
        this.view.forceUpdate();
    }
    async onFormFields(event: React.MouseEvent) {
        var self = this;
        if (this.dataGridTool)
            this.dataGridTool.isOpenTool = true;
        var r = await useSelectMenuItem(
            { roundArea: Rect.fromEvent(event) },
            [
                { text: '显示字段', type: MenuItemType.text },
                ...this.schema.allowFormFields.toArray(uf => {
                    // if (this.formRowData && uf.type == FieldType.title) return
                    return {
                        icon: GetFieldTypeSvg(uf.type),
                        name: uf.id,
                        text: uf.text,
                        type: MenuItemType.switch,
                        checked: this.exists(c => (c instanceof OriginFormField) && c.field.id == uf.id)
                    }
                })
            ],
            {
                input: (newItem) => {
                    self.onToggleFieldView(this.schema.allowFormFields.find(g => g.id == newItem.name), newItem.checked)
                }
            }
        )
        if (this.dataGridTool) {
            this.dataGridTool.isOpenTool = false;
            this.dataGridTool.forceUpdate();
        }
    }
    loadSchemaRecord(row: Record<string, any>) {
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    g.value = g.field.getValue(row);
                }
            }
        })
    }
    getSchemaRow() {
        var row: Record<string, any> = {};
        this.each(g => {
            if (g instanceof OriginFormField) {
                var f = g.field;
                if (f) {
                    row[f.name] = g.value;
                }
            }
        })
        return row;
    }
}

@view(BlockUrlConstant.FormView)
export class DataGridFormView extends BlockView<DataGridForm>{
    onStop(event: React.MouseEvent) {
        event.stopPropagation();
    }
    renderSaveTip() {
        if (this.block.isSubmit) {
            return <div>
                <div className="flex-center f-14">
                    数据已提交
                </div>
            </div>
        }
        return <div>
            <div className="flex-center f-14">
                数据已提交，再<span className="link cursor" onClick={e => { this.block.saveTip = false; this.forceUpdate() }}>提交一份</span>
            </div>
        </div>

    }
    render() {

        if (this.block.page.pageLayout.type == PageLayoutType.formView) {
            return <div>
                <div onMouseDown={e => this.onStop(e)} >
                    <div><input style={{
                        fontSize: 40,
                        fontWeight: 'bold',
                        lineHeight: '50px',
                        minHeight: '50px',
                        textAlign: 'center'
                    }}
                        placeholder="添加表单标题"
                        defaultValue={this.block.schemaView?.text}
                        onInput={e => this.block.updateSchemaViewText((e.target as HTMLInputElement).value)}
                        className="noborder w100"></input></div>
                    <div className="remark"><input style={{
                        fontSize: 14,
                        textAlign: 'center'
                    }} placeholder={'添加表单描述'} defaultValue={this.block.schemaView?.description} onInput={e => this.block.updateSchemaViewDescription((e.target as HTMLInputElement).value)} className="noborder w100"></input></div>
                </div>
                {(this.block.saveTip || this.block.isSubmit) && this.renderSaveTip()}
                <div style={{ display: this.block.saveTip || this.block.isSubmit ? 'none' : 'block' }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                    {this.block.childs.length == 0 && <div onMouseDown={e => this.onStop(e)} className="remark flex-center padding-20">没有表单字段</div>}
                    <div className="flex-center gap-h-30">
                        <Button>保&nbsp;存</Button>
                    </div>
                </div>
            </div>
        }
        else return <div
            onMouseEnter={e => this.block.onOver(true)}
            onMouseLeave={e => this.block.onOver(false)}
        >
            {this.block.schema && <DataGridTool block={this.block}></DataGridTool>}
            <div className="padding-50 round-8 shadow">
                <div onMouseDown={e => this.onStop(e)} >
                    <div className="gap-t-30"><input
                        placeholder='添加表单标题'
                        style={{
                            fontSize: 40,
                            fontWeight: 'bold',
                            lineHeight: '50px',
                            minHeight: '50px',
                            textAlign: 'center',
                        }} defaultValue={this.block.schemaView?.text}
                        onInput={e => this.block.updateSchemaViewText((e.target as HTMLInputElement).value)}
                        className="noborder w100"></input></div>
                    <div className="remark gap-b-30 gap-t-10"><input style={{
                        fontSize: 14,
                        textAlign: 'center'
                    }} placeholder={'添加表单描述'}
                        defaultValue={this.block.schemaView?.description}
                        onInput={e => this.block.updateSchemaViewDescription((e.target as HTMLInputElement).value)}
                        className="noborder w100"></input>
                    </div>
                </div>
                {(this.block.saveTip || this.block.isSubmit) && this.renderSaveTip()}
                <div style={{ display: this.block.saveTip || this.block.isSubmit ? 'none' : 'block' }}>
                    <ChildsArea childs={this.block.childs}></ChildsArea>
                    {this.block.childs.length == 0 && <div onMouseDown={e => this.onStop(e)} className="remark flex-center padding-20">没有表单字段</div>}
                    <div className="flex-center gap-h-30">
                        <Button onMouseDown={(e, b) => this.block.onSave(e, b)}>保存</Button>
                    </div>
                </div>
            </div>
        </div>
    }
}