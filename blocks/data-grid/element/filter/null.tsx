import React from "react";
import { CheckBox } from "../../../../component/view/checkbox";
import { prop, url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { OriginFilterField, OriginFilterFieldView } from "./origin.field";
import { lst } from "../../../../i18n/store";
import { TextArea } from "../../../../src/block/view/appear";
import { Switch } from "../../../../component/view/switch";

/**
 * 判断字段是否有值，无值
 */
@url('/field/filter/null')
export class FieldFilterNull extends OriginFilterField {
    constructor(props) {
        super(props);
        this.checkLabel = lst('是否不为空');
    }
    @prop()
    format: 'checkbox' | 'toggle' = 'checkbox';
    isNull: boolean = false;
    @prop()
    checkLabel: string = '';
    onFilter(value: boolean) {
        this.isNull = value;
        if (this.refBlock) this.refBlock.onSearch()
    }
    get filters() {
        if (this.isNull == false) return null;
        return [
            {
                name: this.field.name,
                $operator: '$ne',
                value: null
            }
        ]
    }
}

@view('/field/filter/null')
export class SearchTextView extends BlockView<FieldFilterNull>{
    renderView() {
        return <div style={this.block.visibleStyle}><OriginFilterFieldView style={this.block.contentStyle}
            filterField={this.block}>
            <div className="flex">
                {this.block.format == 'checkbox' && <CheckBox block checked={this.block.isNull ? false : true}
                    onChange={e => {
                        this.block.onFilter(!e)
                    }}></CheckBox>}
                {this.block.format == 'toggle' && <Switch checked={this.block.isNull ? false : true}
                    onChange={e => {
                        this.block.onFilter(!e)
                    }}></Switch>}
                <TextArea className={'flex-fixed gap-l-5 text-overflow'} plain placeholderEmptyVisible placeholderSmallFont placeholder={lst("不为空")} prop="checkLabel" block={this.block} ></TextArea>
            </div>
        </OriginFilterFieldView ></div>
    }
}