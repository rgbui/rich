import React from "react";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { EventsComponent } from "../../../component/lib/events.component";
import { CloseSvg, CollectTableSvg, SearchSvg } from "../../../component/svgs";
import { Icon } from "../../../component/view/icon";
import { PopoverSingleton } from "../../popover/popover";
import { PopoverPosition } from "../../popover/position";
import { SearchListType } from "../../../component/types";
import { GetFieldTypeSvg } from "../../../blocks/data-grid/schema/util";
import { CheckBox } from "../../../component/view/checkbox";
import { Spin } from "../../../component/view/spin";
import lodash from "lodash";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import dayjs from "dayjs";
import { Avatar } from "../../../component/view/avator/face";
import { UserAvatars } from "../../../component/view/avator/users";
import { Pagination } from "../../../component/view/pagination";
import { Input } from "../../../component/view/input";
import { Page } from "../../../src/page";
import { Tip } from "../../../component/view/tooltip/tip";
import { Divider } from "../../../component/view/grid";
import { lst } from "../../../i18n/store";
import { S } from "../../../i18n/view";

class RelationPicker extends EventsComponent {
    render(): React.ReactNode {
        return <div className="w-600">
            <div className="flex padding-l-6 remark">
                <span className="size-24 flex-center"><Icon icon={this.relationSchema?.icon || CollectTableSvg} size={18}></Icon></span>
                <span>{this.relationSchema?.text}</span>
            </div>
            <Divider></Divider>
            <div className="min-h-100 max-h-400 overflow-y padding-w-10 padding-t-5 padding-b-80">
                {this.seachList.loading && <div className="flex-center"><Spin></Spin></div>}
                {this.renderList()}
            </div>
        </div>
    }
    renderList() {
        if (this.relationSchema) {
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
            return <div>
                <div className="flex">
                    <div className="flex-fixed w-250"><Input
                        prefix={<span className="size-24 flex-center cursor"><Icon className={'remark'} size={16} icon={SearchSvg}></Icon></span>}
                        size='small'
                        placeholder={lst('搜索...')}
                        value={this.seachList.word}
                        onChange={e => {
                            this.seachList.word = e;
                            this.onLazySearch();
                        }}
                        clear
                        onClear={() => {
                            this.onSearch();
                        }}
                        onEnter={e => {
                            this.onSearch();
                        }}></Input>
                    </div>
                </div>
                {this.relationDatas.length > 0 && <div className="flex min-h-30 gap-h-10">
                    {this.relationDatas.map(r => {
                        return <span key={r.id} className="item-hover remark round gap-r-10 padding-w-5 padding-h-3 flex cursor" onMouseDown={e => {
                            lodash.remove(this.relationDatas, g => g.id == r.id)
                            this.isChange = true;
                            this.forceUpdate()
                        }}><em className="max-w-100 text-overflow gap-r-5">{r.title || lst('无标题')}</em>
                            <Tip text='移除选择项'><span className="size-14 flex-center item-hover round"><Icon size={12} icon={CloseSvg}></Icon></span></Tip>
                        </span>
                    })}
                </div>}
                <div className="overflow-x gap-t-10">
                    <div className="flex  flex-full">
                        <div className="flex-fixed w-60 remark border-left border-top padding-5">
                            {this.isMultiple && <CheckBox
                                checked={this.seachList.list.length > 0 && this.seachList.list.every(c => this.relationDatas.some(s => s.id == c.id))}
                                onChange={e => {
                                    if (e) {
                                        this.seachList.list.forEach(lp => {
                                            if (!this.relationDatas.some(s => s.id == lp.id))
                                                this.relationDatas.push(lp)
                                        })
                                    }
                                    else {
                                        lodash.remove(this.relationDatas, s => this.seachList.list.some(c => c.id == s.id));
                                    }
                                    this.isChange = true;
                                    this.forceUpdate();
                                }}
                            ><S>选择</S></CheckBox>}
                        </div>
                        {vfs.map(vf => {
                            var className = 'w-120';
                            if ([FieldType.text, FieldType.bool, FieldType.option, FieldType.options, FieldType.number, FieldType.creater, FieldType.user].includes(vf.type)) {
                                className = 'w-60';
                            }
                            return <div className={"flex-fixed border-left border-top flex r-gap-r-5 padding-5 remark f-14 " + className} key={vf.id}><Icon size={16} icon={GetFieldTypeSvg(vf.type)}></Icon><span>{vf.text}</span></div>
                        })}</div>
                    <div className="border-bottom">
                        {this.seachList.list.map(l => {
                            return <div className="flex flex-full " key={l.id}>
                                <div className="flex-fixed w-60   border-left border-top padding-5"><CheckBox
                                    checked={this.relationDatas.some(s => s.id == l.id)}
                                    onChange={e => {
                                        if (this.isMultiple) {
                                            if (e) {
                                                if (!this.relationDatas.some(s => s.id == l.id))
                                                    this.relationDatas.push(l)
                                            }
                                            else {
                                                lodash.remove(this.relationDatas, s => s.id == l.id);
                                            }
                                        }
                                        else {
                                            if (e) this.relationDatas = [l]
                                            else this.relationDatas = [];
                                        }
                                        this.isChange = true;
                                        this.forceUpdate();
                                    }}
                                ></CheckBox></div>
                                {vfs.map(vf => {
                                    var className = 'w-120';
                                    if ([FieldType.text, FieldType.bool, FieldType.option, FieldType.options, FieldType.number, FieldType.creater, FieldType.user].includes(vf.type)) {
                                        className = 'w-60';
                                    }
                                    return <div className={"flex-fixed   border-left border-top r-gap-r-5 padding-5 " + className} key={vf.id}>{this.getRowValue(l, vf)}</div>
                                })}</div>
                        })}
                    </div>
                    {this.seachList.loading && <Spin></Spin>}
                    {this.seachList.list.length == 0 && this.seachList.loading == false && <div className="flex-center h-100 remark"><S>无数据</S></div>}
                </div>
                <Pagination
                    index={this.seachList.page}
                    total={this.seachList.total}
                    size={this.seachList.size}
                    onChange={(e, s) => {
                        this.seachList.page = e;
                        this.seachList.size = s;
                        this.onSearch()
                    }}></Pagination>
            </div>
        }
        else return <></>
    }
    getRowValue(row, field: Field) {
        var v = row[field.name];
        switch (field.type) {
            case FieldType.bool:
                return <div>
                    <span>{lst(v ? "是" : "否")}</span>
                </div>
            case FieldType.option:
            case FieldType.options:
                var vs = Array.isArray(v) ? v : (v ? [v] : []);
                var ops = field.config?.options || [];
                var os = ops.findAll(g => vs.some(s => s == g.value));
                return <div className="flex">
                    {os.map((o, i) => {
                        return <span className="padding-w-5 cursor round" key={i} style={{ backgroundColor: o.color }}>{o.text}</span>
                    })}
                </div>
                break;
            case FieldType.creater:
            case FieldType.modifyer:
                return <Avatar userid={v} size={24}></Avatar>
                break;
            case FieldType.user:
                var vs = Array.isArray(v) ? v : (v ? [v] : []);
                return <UserAvatars users={vs}></UserAvatars>
            case FieldType.createDate:
            case FieldType.modifyDate:
            case FieldType.date:
                return <span>{v ? dayjs(v).format('YYYY-MM-HH') : ''}</span>
            case FieldType.audio:
                var vs = Array.isArray(v) ? v : (v ? [v] : []);
                return vs.map((v, i) => {
                    return <audio className="max-w-100 obj-center max-h-120" key={i} src={v.url}></audio>
                })
            case FieldType.image:
                var vs = Array.isArray(v) ? v : (v ? [v] : []);
                return vs.map((v, i) => {
                    return <img className="max-w-100 obj-center max-h-120" key={i} src={v.url}></img>
                })
            case FieldType.video:
                var vs = Array.isArray(v) ? v : (v ? [v] : []);
                return vs.map((v, i) => {
                    return <video className="max-w-100 obj-center max-h-120" key={i} src={v.url}></video>
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
                var svg = GetFieldTypeSvg(field.type);
                return <span><Icon icon={svg}></Icon>{countStr}</span>
                break;
        }
        return row[field.name];
    }
    isChange: boolean = false;
    field: Field;
    relationDatas: any[] = [];
    isMultiple: boolean;
    relationSchema: TableSchema;
    page: Page;
    async open(options: {
        relationDatas: { id: string }[],
        relationSchema: TableSchema,
        field: Field,
        isMultiple?: boolean,
        page: Page
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
        this.onSearch();
    }
    seachList: SearchListType<Record<string, any>> = { loading: false, word: '', list: [], total: 0, size: 100, page: 1 };
    onSearch = async () => {
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
        }
        this.seachList.loading = false
        this.forceUpdate();
    }
    onLazySearch = lodash.debounce(this.onSearch, 700)
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
        page: Page
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
        popover.only('close', () => {
            resolve(fv.isChange ? fv.relationDatas : undefined);
        })
    })
}