import React from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { CollectTableSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { Block } from "../../../src/block";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { createFormPage } from "./page";

class RelationPicker extends EventsComponent {
    render(): React.ReactNode {
        return <div className="w-600">
            <div className="flex padding-l-10">
                <span className="cursor flex-inline item-hover flex-center padding-w-10 h-30 round">
                    <span className="size-24 flex-center"> <Icon icon={this.relationSchema?.icon || CollectTableSvg} size={18}></Icon></span>
                    <span>{this.relationSchema?.text}</span>
                </span>
            </div>
            <div className="min-h-400 max-h-400 overflow-y padding-10">
                <div ref={e => this.el = e}></div>
            </div>
        </div>
    }
    componentDidMount(): void {
        if (this.el && this.relationSchema) this.renderPage();
    }
    pageView: Page;
    async renderPage() {
        var self = this;
        if (!this.pageView) {
            this.pageView = await createFormPage(this.el, {
                schema: this.relationSchema,
                datas: this.relationDatas,
                isMultiple: this.isMultiple
            });
            this.pageView.only(PageDirective.selectRows, function (block: Block, rows) {
                self.isChange = true;
                self.relationDatas = rows;
                if (!self.isMultiple) {
                    self.emit('save', [rows[0]]);
                    self.isChange = false;
                }
            })
        }
    }
    isChange: boolean = false;
    private el: HTMLElement;
    field: Field;
    relationDatas: any[];
    isMultiple: boolean;
    relationSchema: TableSchema;
    async open(options: {
        relationDatas: { id: string }[],
        relationSchema: TableSchema,
        field: Field,
        isMultiple?: boolean
    }) {
        this.isChange = false;
        this.field = options.field;
        this.relationDatas = options.relationDatas;
        this.isMultiple = options.isMultiple;
        this.relationSchema = options.relationSchema;
        if (this.el && this.pageView) {
            this.pageView.destory()
            delete this.pageView;
        }
        this.forceUpdate(() => {
            if (this.el && this.relationSchema) this.renderPage();
        });
    }
}
/**
 * 挑选关联的数据
 * @param pos 
 * @param options 
 * @returns 
 */
export async function useRelationPickData(pos: PopoverPosition,
    options: {
        relationDatas: { id: string }[],
        relationSchema: TableSchema,
        field: Field,
        isMultiple?: boolean
    }) {
    let popover = await PopoverSingleton(RelationPicker, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: any[]) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.isMultiple && fv.isChange && fv.relationDatas.length > 0 ? fv.relationDatas : undefined);
        });
        fv.only('save', (rows) => {
            resolve(rows);
            popover.close();
        })
        popover.only('close', () => {
            resolve(fv.isMultiple && fv.isChange && fv.relationDatas.length > 0 ? fv.relationDatas : undefined);
        })
    })
}