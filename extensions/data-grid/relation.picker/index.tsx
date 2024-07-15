import React, { CSSProperties } from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { Icon } from "../../../component/view/icon";
import { PopoverSingleton } from "../../../component/popover/popover";
import { PopoverPosition } from "../../../component/popover/position";
import { SearchListType } from "../../../component/types";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import lodash from "lodash";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import dayjs from "dayjs";
import { Avatar } from "../../../component/view/avator/face";
import { UserAvatars } from "../../../component/view/avator/users";
import { Input } from "../../../component/view/input";
import { Page } from "../../../src/page";
import { lst } from "../../../i18n/store";
import { util } from "../../../util/util";
import { ResourceArguments } from "../../icon/declare";
import { getPageIcon, getPageText } from "../../../src/page/declare";
import { S } from "../../../i18n/view";
import { HelpText } from "../../../component/view/text";
import { CheckSvg, CloseSvg, DotsSvg, DragHandleSvg, EyeHideSvg, EyeSvg, PlusSvg } from "../../../component/svgs";
import { ToolTip } from "../../../component/view/tooltip";
import { KeyboardCode } from "../../../src/common/keys";
import { DragList } from "../../../component/view/drag.list";
import { channel } from "../../../net/channel";
import { ElementType, getElementUrl } from "../../../net/element.type";
import { MenuItem, MenuItemType } from "../../../component/view/menu/declare";
import { useSelectMenuItem } from "../../../component/view/menu";
import { Rect } from "../../../src/common/vector/point";

class RelationPicker extends EventsComponent {
    render() {
        return <div className="w-600">
            {this.renderList()}
        </div>
    }
    onPick(row) {
        this.isChange = true;
        if (this.isMultiple) {
            if (!this.relationDatas.some(c => c.id == row.id))
                this.relationDatas.push(row);
            else lodash.remove(this.relationDatas, c => c.id == row.id);
            this.forceUpdate(() => {
                setTimeout(() => {
                    if (this.input) {
                        this.input.focus()
                    }
                }, 100);
            });
        }
        else {
            this.relationDatas = [row];
            this.emit('save', this.relationDatas)
        }
    }
    async openShowFields(e: React.MouseEvent) {

        var title = this.relationSchema.fields.find(g => g.name == 'title');
        var getSubItems = () => {
            var vfs = this.relationSchema.fields.findAll(g => [
                FieldType.title,
                FieldType.text,
                FieldType.date,
                FieldType.number,
                FieldType.option,
                FieldType.options,
                FieldType.image,
                FieldType.user,
                FieldType.video,
                FieldType.file,
                FieldType.bool,
                FieldType.audio,
                FieldType.createDate,
                FieldType.creater
            ].includes(g.type));
            vfs.sort((a, b) => {
                if (a.type == FieldType.title) return -1;
            })
            var subItems: MenuItem[] = [];
            if (!this.fieldProps) this.fieldProps = [title.id];
            var showFields: Field[] = [];
            this.fieldProps.forEach(v => {
                var vf = vfs.find(g => g.id == v);
                showFields.push(vf);
            })
            var hideFields = vfs.filter(g => !showFields.some(s => s.id == g.id));
            subItems.push({
                text: lst('显示字段'),
                type: MenuItemType.text
            })
            showFields.forEach(v => {
                subItems.push({
                    name: 'turn',
                    text: v.text,
                    type: MenuItemType.drag,
                    value: v.id,
                    icon: GetFieldTypeSvg(v),
                    btns: v.id == title.id ? [] : [
                        { icon: EyeSvg, name: 'hide' }
                    ]
                })
            })
            if (hideFields.length > 0) {
                subItems.push({
                    text: lst('隐藏字段'),
                    name: 'hideFields',
                    type: MenuItemType.text
                })
                hideFields.forEach(v => {
                    subItems.push({
                        name: 'turn',
                        text: v.text,
                        type: MenuItemType.drag,
                        value: v.id,
                        icon: GetFieldTypeSvg(v),
                        btns: [
                            { icon: EyeHideSvg, name: 'show' }
                        ]
                    })
                })
            }
            return [{
                type: MenuItemType.container,
                drag: true,
                name: 'viewContainer',
                childs: subItems
            }];
        }
        var rect = Rect.fromEle(e.currentTarget as HTMLElement)
        await useSelectMenuItem({ roundArea: rect }, getSubItems(), {
            input: (item, mp) => {
                if (item.name == 'viewContainer') {
                    var cs = item.childs;
                    var h = cs.findIndex(g => g.name == 'hideFields');
                    var hs = h > -1 ? cs.findAll((c, i) => i < h) : cs;
                    lodash.remove(hs, g => g.value ? false : true);
                    this.fieldProps = hs.map(g => g.value);
                    lodash.remove(this.fieldProps, c => c == title.id)
                    this.fieldProps.unshift(title.id);
                    mp.updateItems(getSubItems())
                    this.forceUpdate();
                    this.changeFieldProps(this.fieldProps)
                }
            },
            click: async (item, ev, name, mp) => {
                if (name == 'hide' || name == 'show') {
                    mp.onFree();
                    try {
                        if (!this.fieldProps) this.fieldProps = [];
                        if (name == 'hide') {
                            lodash.remove(this.fieldProps, c => c == item.value)
                        }
                        else if (name == 'show') {
                            if (!this.fieldProps.includes(item.value))
                                this.fieldProps.push(item.value)
                        }
                        lodash.remove(this.fieldProps, c => c == title.id)
                        this.fieldProps.unshift(title.id);
                        console.log(this.fieldProps, title.id, getSubItems());
                        mp.updateItems(getSubItems())
                        this.forceUpdate();
                        this.changeFieldProps(this.fieldProps)
                    }
                    catch (ex) {

                    }
                    finally {
                        mp.onUnfree()
                    }
                }
            }
        });
        if (this.input) this.input.focus()
    }
    input: Input;
    renderList() {
        if (this.relationSchema) {
            return <div ref={e => this.el = e}>
                <div >
                    <div className="flex flex-auto padding-w-10 padding-h-5" style={{
                        backgroundColor: 'rgba(242, 241, 238, 0.6)',
                        boxShadow: 'rgba(55, 53, 47, 0.16) 0px -1px inset'
                    }}>
                        <div className="flex-auto" >
                            <Input
                                ref={e => this.input = e}
                                focusSelectionAll
                                noborder
                                placeholder={lst('搜索或创建...')}
                                value={this.seachList.word}
                                onChange={e => {
                                    this.seachList.word = e;
                                    this.onLazySearch();
                                }}
                                onKeydown={e => {
                                    if (e.key == KeyboardCode.ArrowDown) {
                                        this.index += 1;
                                        if (this.index > this.seachList.list.length - 1) this.index = 0;
                                        this.forceUpdate(() => {
                                            var ds = this.el.querySelector(`[data-selected="yes"]`) as HTMLElement;
                                            if (ds) {
                                                ds.scrollIntoView({ block: 'center', inline: 'center' });
                                            }
                                        })

                                    }
                                    else if (e.key == KeyboardCode.ArrowUp) {
                                        this.index -= 1;
                                        if (this.index < 0) this.index = this.seachList.list.length - 1;
                                        this.forceUpdate(() => {
                                            var ds = this.el.querySelector(`[data-selected="yes"]`) as HTMLElement;
                                            if (ds) {
                                                ds.scrollIntoView({ block: 'center', inline: 'center' });
                                            }
                                        })
                                    }
                                    else if (e.key == KeyboardCode.Enter) {
                                        if (this.seachList.list.length == 0 && this.seachList.word) {
                                            this.onAddRecord();
                                        }
                                        else {
                                            var r = this.seachList.list[this.index];
                                            this.onPick(r);
                                        }
                                    }
                                }}
                                clear
                                onClear={() => {
                                    this.onSearch();
                                }}
                            ></Input>
                        </div>
                        <div className="flex-fixed">
                            <span onMouseDown={e => {
                                e.stopPropagation();
                                channel.act('/page/open', { elementUrl: getElementUrl(ElementType.Schema, this.relationSchema.id) });
                            }} className="flex-fixed remark flex item-hover item-hover-light-focus round padding-w-3 padding-h-1">
                                <Icon size={16} icon={this.relationSchema.icon || { name: 'byte', code: 'table' }}></Icon>
                                <span className="gap-l-3">{this.relationSchema.text}</span>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="max-h-300 overflow-y">
                    {this.renderPickedRows()}
                    <div className="flex  gap-w-10">
                        <span className="flex-auto  f-12 remark"><S>选择页面</S></span>
                        {this.changeFieldProps && this.relationDatas.length == 0 && <ToolTip overlay={<S>设置显示属性</S>}><span onMouseDown={e => this.openShowFields(e)} className="flex-fixed size-20 gap-h-3 flex-center round item-hover">
                            <Icon icon={DotsSvg}></Icon>
                        </span></ToolTip>}
                    </div>
                    <div>{this.seachList.list.map((row, i) => {
                        return <div key={row.id}>{this.renderRow(row, i)}</div>
                    })}</div>
                </div>
                {this.seachList.list.length == 0 && this.seachList.word && <div className="gap-b-10" onMouseDown={e => {
                    this.onAddRecord();
                }}>
                    <div className={"flex item-hover round padding-w-5 padding-h-3 gap-w-5 " + (this.index == 0 ? "item-hover-focus" : "")}>
                        <Icon size={16} icon={PlusSvg}></Icon>
                        <S>创建新记录</S>
                        <span className="b-500 gap-r-5">{this.seachList.word}</span>
                        <span onMouseDown={e => {
                            e.stopPropagation();
                        }} className="flex-fixed remark flex item-hover item-hover-light-focus round padding-w-3 padding-h-1">
                            <Icon size={16} icon={this.relationSchema.icon || { name: 'byte', code: 'table' }}></Icon>
                            <span className="gap-l-3">{this.relationSchema.text}</span>
                        </span>
                    </div>
                </div>}
                <div className="h-30 border-top flex padding-w-10">
                    <HelpText onMouseDown={e => { e.stopPropagation() }} url={window.shyConfig?.isUS ? "https://help.shy.red/page/69#8se82Vo9ub2CVdQfA4CGEw" : "https://help.shy.live/page/1989#bMYCF1q5T1EDj9QArqCZMj"}><S>了解如何关联数据表</S></HelpText>
                </div>
            </div>
        }
        else return <div></div>
    }
    async onAddRecord() {
        this.isChange = true;
        var r = await this.relationSchema.rowAdd({ data: { title: this.seachList.word } }, 'RelationPicker');
        this.seachList.list.push(r.data);
        this.relationDatas.push(r.data);
        this.forceUpdate()
    }
    renderPickedRows() {
        if (this.relationDatas.length == 0) return <></>
        var dragChange = (to: number, from: number) => {
            this.isChange = true;
            var d = this.relationDatas[from];
            this.relationDatas.splice(from, 1);
            this.relationDatas.splice(to, 0, d);
            this.forceUpdate(() => {
                setTimeout(() => {
                    if (this.input) this.input.focus()
                }, 100);
            })
        };
        var vfs = this.getFields();
        return <div>
            <div className="flex gap-w-10">
                <span className="flex-auto f-12 remark"><S>已选择</S>{this.relationDatas.length}</span>
                {this.changeFieldProps && <ToolTip overlay={<S>设置显示属性</S>}><span onMouseDown={e => this.openShowFields(e)} className="flex-fixed size-20 gap-h-3 flex-center round item-hover">
                    <Icon icon={DotsSvg}></Icon>
                </span></ToolTip>}
            </div>
            <div><DragList onChange={(e, c) => dragChange(e, c)}
                isDragBar={e => e.closest('.drag') ? true : false}>
                {this.relationDatas.map(row => {
                    return <div key={row.id} className="flex visible-hover  round item-light-hover min-h-30 cursor gap-w-5 padding-w-5">
                        <span className="w-16 h-24 gap-r-5 remark drag flex-center" ><Icon size={14} icon={DragHandleSvg}></Icon></span>
                        <div className="flex-auto flex text-overflow flex-wrap">
                            {vfs.map((vf, i) => {
                                return <div key={i} className="flex-fixed  gap-r-10">
                                    {this.getRowValue(row, vf)}
                                </div>
                            })}
                        </div>
                        <ToolTip overlay={<S>移除选择的数据</S>}>
                            <span onMouseDown={e => {
                                e.stopPropagation()
                                lodash.remove(this.relationDatas, c => c.id == row.id);
                                this.isChange = true;
                                this.forceUpdate(() => {
                                    setTimeout(() => {
                                        if (this.input) this.input.focus()
                                    }, 100);
                                });
                            }} className="visible flex-fixed size-20 round flex-center item-hover">
                                <Icon icon={CloseSvg} size={12}></Icon>
                            </span>
                        </ToolTip>
                    </div>
                })}</DragList>
            </div>
        </div>
    }
    el: HTMLElement;
    getFields() {
        var fps = this.fieldProps || [this.relationSchema.fields.find(g => g.name == 'title')?.id];
        var vfs: Field[] = [];
        if (fps) {
            vfs = fps.map(v => {
                return this.relationSchema.fields.find(g => g.id == v);
            })
        }
        return vfs;
    }
    renderRow(row, i?: number) {
        var vfs = this.getFields();
        return <div onMouseDown={e => this.onPick(row)} data-selected={i == this.index ? "yes" : "no"} className={"flex round item-light-hover min-h-30 cursor gap-w-5 padding-w-5 " + (i === this.index ? "item-hover-focus" : "")}>
            <div className="flex-auto flex  text-overflow flex-wrap ">
                {vfs.map((vf, i) => {
                    return <div key={i} className="flex-fixed gap-r-10">
                        {this.getRowValue(row, vf)}
                    </div>
                })}
            </div>

            <div className="flex-fixed flex-end  ">
                {this.relationDatas.some(c => c.id == row.id) && <span className="flex-center size-20  text-1" ><Icon size={14} icon={CheckSvg}></Icon></span>}
            </div>
        </div>
    }
    getRowValue(row, field: Field) {
        var v = row[field.name];
        switch (field.type) {
            case FieldType.title:
                var textStyle: CSSProperties = {}
                textStyle.textDecoration = 'underline';
                textStyle.textDecorationColor = 'rgba(22, 22, 22, 0.2)';
                return <div className="flex">
                    {row.icon && <span className="flex-fixed size-24 flex-center remark"><Icon size={18} icon={getPageIcon(row)}></Icon></span>}
                    <span style={textStyle} className="flex-auto text-overflow b-500 ">{getPageText({ text: v })}</span>
                </div>
            case FieldType.bool:
                return <div>
                    <span>{lst(v ? "是" : "否")}</span>
                </div>
            case FieldType.option:
            case FieldType.options:
                var vs = util.covertToArray(v);
                var ops = field.config?.options || [];
                var os = ops.findAll(g => vs.some(s => s == g.value));
                return <div className="flex">
                    {os.map((o, i) => {
                        return <span className="padding-w-5 cursor round" key={i} style={{ backgroundColor: o.fill || o.color, color: o.textColor }}>{o.text}</span>
                    })}
                </div>
            case FieldType.creater:
            case FieldType.modifyer:
                return <Avatar userid={v} size={24}></Avatar>
            case FieldType.user:
                var vs = util.covertToArray(v);
                return <UserAvatars users={vs}></UserAvatars>
            case FieldType.createDate:
            case FieldType.modifyDate:
            case FieldType.date:
                return <span>{v ? dayjs(v).format('YYYY-MM-HH') : ''}</span>
            case FieldType.audio:
            case FieldType.file:
            case FieldType.video:
                var rvs: ResourceArguments[] = util.covertToArray(v);
                return rvs.map((v, i) => {
                    return <div className="  flex" key={i} ><span className="flex-auto text-overflow">{v.filename}</span><span className="flex-fixed gap-l-5">{v.size && util.byteToString(v.size)}</span></div>
                })
            case FieldType.image:
                var vs = util.covertToArray(v);
                return vs.map((v, i) => {
                    return <img className="size-60 obj-center cursor " key={i} src={v.url}></img>
                })
            case FieldType.emoji:
                if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
                if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
                var countStr = v > 0 ? `${v}` : '';
                return <span>{field.config?.emoji?.code}{countStr}</span>
            case FieldType.like:
            case FieldType.oppose:
            case FieldType.love:
            case FieldType.browse:
                if (typeof v == 'object' && typeof v?.count == 'number') v = v.count;
                if (lodash.isNull(v) || lodash.isUndefined(v)) v = 0;
                var countStr = v > 0 ? `${v}` : '';
                var svg = GetFieldTypeSvg(field);
                return <span><Icon icon={svg}></Icon>{countStr}</span>
        }
        if (!lodash.isObject(v))
            return <span>{v}</span>;
        else return <span>{JSON.stringify(v)}</span>

    }
    index: number = 0;
    isChange: boolean = false;
    field: Field;
    relationDatas: any[] = [];
    isMultiple: boolean;
    relationSchema: TableSchema;
    page: Page;
    fieldProps?: string[];
    changeFieldProps?: (props: string[]) => void;
    async open(options: {
        relationDatas: { id: string }[],
        relationSchema: TableSchema,
        field: Field,
        isMultiple?: boolean,
        page: Page,
        fieldProps?: string[];
        changeFieldProps?: (props: string[]) => void;
    }) {
        this.seachList = {
            loading: false,
            word: '',
            list: [],
            total: 0,
            size: 50,
            page: 1
        };
        this.page = options.page;
        this.isChange = false;
        this.field = options.field;
        this.relationDatas = options.relationDatas;
        this.isMultiple = options.isMultiple;
        this.relationSchema = options.relationSchema;
        this.fieldProps = options.fieldProps;
        this.changeFieldProps = options.changeFieldProps;
        await this.onSearch(false);
        this.forceUpdate(() => {
            setTimeout(() => {
                this.emit('update')
            }, 100);
        })
    }
    seachList: SearchListType<Record<string, any>> = { loading: false, word: '', list: [], total: 0, size: 100, page: 1 };
    onSearch = async (force: boolean = true) => {
        this.seachList.loading = true;
        this.forceUpdate();
        var dr = await this.relationSchema.list({
            page: this.seachList.page,
            size: this.seachList.size,
            directFilter: this.seachList.word ? { title: this.seachList.word } : undefined
        }, this.page.ws);
        if (dr.ok) {
            this.seachList.list = dr.data.list;
            this.seachList.total = dr.data.total;
            this.seachList.page = dr.data.page;
            this.seachList.size = dr.data.size;
            if (this.index >= this.seachList.list.length) {
                this.index = 0;
            }
        }
        this.seachList.loading = false
        if (force)
            this.forceUpdate();
    }
    onLazySearch = lodash.debounce(this.onSearch, 500)
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
        isMultiple?: boolean,
        page: Page,
        fieldProps?: string[];
        changeFieldProps?: (props: string[]) => void;
    }) {
    let popover = await PopoverSingleton(RelationPicker, { mask: true });
    let fv = await popover.open(pos);
    await fv.open(options);
    return new Promise((resolve: (data: any[]) => void, reject) => {
        fv.only('close', () => {
            popover.close();
            resolve(fv.isChange ? fv.relationDatas : undefined);
        });
        fv.only('save', (rows) => {
            resolve(rows);
            popover.close();
        })
        fv.only('update', () => {
            popover.updateLayout()
        })
        popover.only('close', () => {
            resolve(fv.isChange ? fv.relationDatas : undefined);
        })
    })
}