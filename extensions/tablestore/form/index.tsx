import React from "react";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Point } from "../../../src/common/vector/point";
import { Page } from "../../../src/page";
import { PopoverSingleton } from "../../popover/popover";
import { createFormPage } from "./page";
import Dots from "../../../src/assert/svg/dots.svg";
import { Icon } from "../../../component/view/icon";
import "./style.less";

class FormPage extends EventsComponent {
    schema: TableSchema;
    row?: Record<string, any>;
    width: number = 800;
    height: number = 500;
    recordViewId: string;
    async open(options: {
        width: number, height: number,
        schema: TableSchema | string,
        recordViewId: string,
        row?: Record<string, any>
    }) {
        if (typeof this.schema == 'string') {
            this.schema = await TableSchema.loadTableSchema(this.schema);
        }
        else this.schema = options.schema as TableSchema;
        this.row = options.row;
        this.width = options.width;
        this.height = options.height;
        this.recordViewId = options.recordViewId;
        this.forceUpdate(() => {
            if (this.el && this.schema) this.renderPage();
        });
    }
    componentDidMount(): void {
        if (this.el && this.schema) this.renderPage();
    }
    pageView: Page;
    async renderPage() {
        this.pageView = await createFormPage(this.el, {
            schema: this.schema,
            recordViewId: this.recordViewId,
            row: this.row
        });
    }
    getSchemaRow() {
        return this.pageView.getSchemaRow()
    }
    el: HTMLDivElement;
    render() {
        return <div className="shy-form" style={{ width: this.width, height: this.height }}>
            <div className="shy-form-head">
                <div className="shy-form-head-left">
                    <span>{this.schema?.text}</span>
                    <Icon wrapper size={16} icon={Dots}></Icon>
                </div>
                {/* <div className="shy-form-head-right">
                    <a><Icon size={16} icon={Dots}></Icon><span>动态</span></a>
                </div> */}
            </div>
            <div className="shy-form-content" style={{ height: this.height - 40 }}>
                <div className="shy-form-box" ref={e => this.el = e} ></div>
            </div>
        </div>
    }
}

export async function useFormPage(options: {
    schema: TableSchema | string,
    recordViewId: string,
    row?: Record<string, any>
}) {
    let popover = await PopoverSingleton(FormPage, { mask: true, shadow: true });
    var width = 600;
    var height = 400;
    let formPage = await popover.open({
        fixPoint: Point.from({
            x: (window.innerWidth - width) / 2,
            y: (window.innerHeight - height) / 2
        })
    });
    await formPage.open({
        width,
        height,
        schema: options.schema,
        row: options.row,
        recordViewId: options.recordViewId
    });
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
        formPage.only('save', (data: Record<string, any>) => {
            popover.close();
            resolve(data);
        });
        formPage.only('close', () => {
            popover.close();
            resolve(formPage.getSchemaRow());
        })
        popover.only('close', () => {
            resolve(formPage.getSchemaRow())
        })
    })
}

