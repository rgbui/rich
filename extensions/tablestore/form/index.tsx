import React from "react";
import { FieldType } from "../../../blocks/table-store/schema/field.type";
import { TableSchema } from "../../../blocks/table-store/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Rect } from "../../../src/common/point";
import { Page } from "../../../src/page";
import { PageDirective } from "../../../src/page/directive";
import { PopoverSingleton } from "../../popover/popover";
function schemaCreatePageFormData(schema: TableSchema, row?: Record<string, any>) {
    var cs: Record<string, any>[] = schema.fields.map(field => {
        switch (field.type) {
            case FieldType.text:
            case FieldType.title:
                return {
                    url: '/form/text',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
                break;
            case FieldType.bool:
                return {
                    url: '/form/check',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
            case FieldType.date:
                return {
                    url: '/form/date',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
            case FieldType.number:
                return {
                    url: '/form/number',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
                break;
            case FieldType.option:
                return {
                    url: '/form/option',
                    value: row ? row[field.name] : undefined,
                    fieldId: field.id,
                    field
                }
                break;
        }
    })
    return {
        url: '/page',
        views: [
            {
                url: '/view',
                blocks: {
                    childs: cs
                }
            }
        ]
    }
}
function createFormPage(el: HTMLElement, options: { page: Page, schema: TableSchema, row?: Record<string, any> }) {
    var page = new Page({
        user: options.page.creater
    });
    page.on(PageDirective.blur, function (ev) {
        // console.log('blur', ev)
    });
    page.on(PageDirective.focus, function (ev) {
        //console.log('focus', ev);
    });
    page.on(PageDirective.focusAnchor, function (anchor) {
        // console.log('focusAnchor', anchor);
    });
    page.on(PageDirective.history, async function (action) {
        // await item.store.saveHistory(action);
        // await item.store.savePageContent(action, await page.getFile());
    });
    page.load(schemaCreatePageFormData(options.schema, options.row));
    var bound = el.getBoundingClientRect();
    page.render(el, { width: bound.width, height: bound.height });
    return page;
}


class FormPage extends EventsComponent {
    page: Page;
    schema: TableSchema;
    row?: Record<string, any>;
    open(page: Page, schema: TableSchema, row?: Record<string, any>) {
        this.page = page;
        this.schema = schema;
        this.row = row;
        if (this.el) this.renderPage();
    }
    componentDidMount(): void {
        if (this.el) this.renderPage();
    }
    pageView: Page;
    renderPage() {
        this.pageView = createFormPage(this.el, { page: this.page, schema: this.schema, row: this.row });
    }
    getData() {
        return {}
    }
    el: HTMLDivElement;
    render() {
        return <div className="shy-form-page">
            <div className="shy-form-page-box" ref={e => this.el = e} ></div>
        </div>
    }
}

export async function useFormPage(parentPage: Page, schema: TableSchema, row?: Record<string, any>) {
    let popover = await PopoverSingleton(FormPage);
    let formPage = await popover.open({ roundArea: new Rect(0, 0, 100, 200) });
    formPage.open(parentPage, schema, row);
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