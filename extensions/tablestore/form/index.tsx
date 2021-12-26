import React from "react";
import { TableSchema } from "../../../blocks/table-store/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Rect } from "../../../src/common/point";
import { Page } from "../../../src/page";
import { PopoverSingleton } from "../../popover/popover";
import { createFormPage } from "./page";
import Dots from "../../../src/assert/svg/dots.svg";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { OriginFormField } from "../../../blocks/table-store/element/form/origin.field";
class FormPage extends EventsComponent {
    page: Page;
    schema: TableSchema;
    row?: Record<string, any>;
    width: number = 600;
    height: number = 400;
    open(options: { width: number, height: number, page: Page, schema: TableSchema, row?: Record<string, any> }) {
        this.page = options.page;
        this.schema = options.schema;
        this.row = options.row;
        this.width = options.width;
        this.height = options.height;
        this.forceUpdate(() => {
            if (this.el && this.page) this.renderPage();
        });
    }
    componentDidMount(): void {
        if (this.el && this.page) this.renderPage();
    }
    pageView: Page;
    async renderPage() {
        this.pageView = await createFormPage(this.el, { page: this.page, schema: this.schema, row: this.row });
    }
    getData() {
        var row = {};
        var rs: OriginFormField[] = this.pageView.findAll(g => typeof (g as any).field != 'undefined') as any;
        rs.each(r => {
            row[r.field.name] = r.value;
        })
        return row
    }
    el: HTMLDivElement;
    render() {
        return <div className="shy-form" style={{ width: this.width, height: this.height }}>
            <div className="shy-form-head">
                <div className="shy-form-head-left">
                    <span>{this.schema?.text}</span>
                    <Icon size={16} icon={Dots}></Icon>
                </div>
                <div className="shy-form-head-right">
                    <a><Icon size={16} icon={Dots}></Icon><span>动态</span></a>
                </div>
            </div>
            <div className="shy-form-content" style={{ height: this.height - 40 }}>
                <div className="shy-form-box" ref={e => this.el = e} ></div>
            </div>
        </div>
    }
}

export async function useFormPage(parentPage: Page, schema: TableSchema, row?: Record<string, any>) {
    let popover = await PopoverSingleton(FormPage, { mask: true, shadow: true });
    var width = Math.min(600, parentPage.pageVisibleWidth);
    var height = parentPage.pageVisibleHeight || (window.innerHeight - 200);
    let formPage = await popover.open({
        roundArea: new Rect(
            (window.innerWidth - width) / 2,
            (window.innerHeight - height) / 2,
            width,
            height
        )
    });
    formPage.open({ width, height, page: parentPage, schema, row });
    return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
        formPage.only('save', (data: Record<string, any>) => {
            popover.close();
            resolve(data);
        });
        formPage.only('close', () => {
            popover.close();
            resolve(formPage.getData());
        })
        popover.only('close', () => {
            resolve(formPage.getData())
        })
    })
}

