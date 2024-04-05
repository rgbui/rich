import { SchemaFilter } from "../../../../blocks/data-grid/schema/filter";
import { TableSchema } from "../../../../blocks/data-grid/schema/meta";
import lodash from "lodash";
import { FieldType } from "../../../../blocks/data-grid/schema/type";
import { GetFieldTypeSvg } from "../../../../blocks/data-grid/schema/util";
import { lst } from "../../../../i18n/store";
import { LinkWs } from "../../../../src/page/declare";
import { PopoverSingleton } from "../../../../component/popover/popover";
import { PopoverPosition } from "../../../../component/popover/position";
import { EventsComponent } from "../../../../component/lib/events.component";
import React from "react";
import { FilterView } from "./view";


export class CustomTableFilterView extends EventsComponent {
    getFields() {
        var fs = this.schema.defaultViewFields.findAll(g => g.text && ![FieldType.formula].includes(g.type)).map(fe => {
            return {
                icon: GetFieldTypeSvg(fe.type),
                text: fe.text,
                value: fe.id
            }
        });
        return fs;
    }
    getComputedFields(fieldId: string) {
        var field = this.schema.fields.find(g => g.id == fieldId);
        if ([FieldType.image, FieldType.video, FieldType.video, FieldType.file].includes(field.type)) {
            return [
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.number].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('小于'), value: '$lt' },
                { text: lst('大于'), value: '$gt' },
                { text: lst('小于等于'), value: '$lte' },
                { text: lst('大于等于'), value: '$gte' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.option, FieldType.options].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('包含'), value: '$in' },
                { text: lst('不包含'), value: '$notIn' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.user, FieldType.creater, FieldType.modifyer].includes(field.type)) {
            return [
                { text: lst('是'), value: '$eq' },
                { text: lst('不是'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('早于'), value: '$gt' },
                { text: lst('晚于'), value: '$lt' },
                { text: lst('早于等于'), value: '$gte' },
                { text: lst('晚于等于'), value: '$lte' },
                { text: lst('位于'), value: '$in' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        else if ([FieldType.text,
        FieldType.textarea,
        FieldType.title,
        FieldType.link,
        FieldType.phone,
        FieldType.email].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('包含'), value: '$contain' },
                { text: lst('不包含'), value: '$notContain' },
                { text: lst('开头为'), value: '$startWith' },
                { text: lst('结尾为'), value: '$endWith' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' }
            ]
        }
        else if ([FieldType.bool].includes(field.type)) {
            return [
                { text: lst('等于'), value: '$eq' },
                { text: lst('不等于'), value: '$ne' },
                { text: lst('为空'), value: '$isNull' },
                { text: lst('不为空'), value: '$isNotNull' },
            ]
        }
        return [
            { text: lst('为空'), value: '$isNull' },
            { text: lst('不为空'), value: '$isNotNull' },
        ]
    }
    onStore = lodash.debounce(async (filter: SchemaFilter) => {
        this.emit('change', lodash.cloneDeep(filter))
    }, 800);
    onForceStore = async (filter: SchemaFilter) => {
        this.emit('change', lodash.cloneDeep(filter))
        this.forceUpdate();
    }
    open(options: {
        schema: TableSchema,
        formSchema?: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
    }) {
        Object.assign(this, options);
        this.forceUpdate();
    }
    schema: TableSchema;
    filter: SchemaFilter;
    formSchema?: TableSchema;
    ws: LinkWs;
    render() {
        return <FilterView
            filter={this.filter}
            schema={this.schema}
            formSchema={this.formSchema}
            onInput={e => {
                this.onStore(e)
            }}
            onChange={e => {
                this.onForceStore(e)
            }}
            ws={this.ws}
        ></FilterView>
    }
}

export async function useCustomTableFilter(pos: PopoverPosition,
    option: {
        schema: TableSchema,
        formSchema?: TableSchema,
        filter: SchemaFilter,
        ws: LinkWs,
        onChange(filter: SchemaFilter): void
    }) {
    let popover = await PopoverSingleton(CustomTableFilterView, { mask: true });
    let fv = await popover.open(pos);
    fv.open(option);
    return new Promise((resolve: (data: string | { tableId: string, viewId: string, type: 'view' | 'form', viewUrl?: string }) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(undefined);
        })
        fv.only('change', (g) => {
            if (typeof option.onChange == 'function') option.onChange(g);
        })
        popover.only('close', () => {
            resolve(undefined);
        })
    })
}