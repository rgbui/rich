import React from "react";
import { TableSchema } from "../../../blocks/table-store/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Rect } from "../../../src/common/vector/point";
import { Page } from "../../../src/page";
import { PopoverSingleton } from "../../popover/popover";
import { createFormPage } from "./page";
import Dots from "../../../src/assert/svg/dots.svg";
import { Icon } from "../../../component/view/icon";
import "./style.less";
import { OriginFormField } from "../../../blocks/table-store/element/form/origin.field";
import { messageChannel } from "../../../util/bus/event.bus";
import { Directive } from "../../../util/bus/directive";
class FormPage extends EventsComponent {
    schema: TableSchema;
    row?: Record<string, any>;
    width: number = 600;
    height: number = 400;
    async open(options: { width: number, height: number, schema: TableSchema | string, row?: Record<string, any> }) {
        if (typeof this.schema == 'string') {
            this.schema = await messageChannel.fireAsync(Directive.getSchemaFields, this.schema as string) as TableSchema;
        }
        else this.schema = options.schema as TableSchema;
        this.row = options.row;
        this.width = options.width;
        this.height = options.height;
        this.forceUpdate(() => {
            if (this.el && this.schema) this.renderPage();
        });
    }
    componentDidMount(): void {
        if (this.el && this.schema) this.renderPage();
    }
    pageView: Page;
    async renderPage() {
        this.pageView = await createFormPage(this.el,{schema: this.schema, row: this.row });
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

export async function useFormPage(schema: TableSchema | string, row?: Record<string, any>) {
    let popover = await PopoverSingleton(FormPage, { mask: true, shadow: true });
    var width = 600;
    var height = 200;
    let formPage = await popover.open({
        roundArea: new Rect(
            (window.innerWidth - width) / 2,
            (window.innerHeight - height) / 2,
            width,
            height
        )
    });
    await formPage.open({ width, height, schema, row });
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

