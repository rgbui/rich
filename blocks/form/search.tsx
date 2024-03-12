import React, { CSSProperties } from "react";
import { Block } from "../../src/block";
import { prop, url, view } from "../../src/block/factory/observable";
import { BlockView } from "../../src/block/view";
import { Input } from "../../component/view/input";
import { S } from "../../i18n/view";
import { SearchListType } from "../../component/types";
import { LinkPageItem, getPageIcon, getPageText } from "../../src/page/declare";
import { channel } from "../../net/channel";
import lodash from "lodash";
import { Icon } from "../../component/view/icon";
import { lst } from "../../i18n/store";
import { Spin } from "../../component/view/spin";
import { util } from "../../util/util";
import { CloseSvg } from "../../component/svgs";
import { MenuItem } from "../../component/view/menu/declare";
import { BlockDirective, BlockRenderRange } from "../../src/block/enum";
import { Point, Rect } from "../../src/common/vector/point";

@url('/search')
export class SearchWorkspace extends Block {
    @prop()
    align: 'left' | 'center' | 'right' = 'center';
    async didMounted(): Promise<void> {
        document.addEventListener('mousedown', this.otherClick)
    }
    async didUnmounted(): Promise<void> {

        document.removeEventListener('mousedown', this.otherClick)
    }
    otherClick = (event: MouseEvent) => {
        var ele = event.target as HTMLElement;
        if (this.el.contains(ele)) return;
        (this.view as any).dropEle.style.display = 'none';
        (this.view as any).searchList = { editDate: -1, isOnlySearchTitle: false, loading: false, list: [], pages: [], total: 0, page: 1, size: 20 }
    }
    @prop()
    searchStyle: 'primary' | 'ghost' | 'dark' | 'green' | 'blue' | 'purple' = 'primary'
    async onGetContextMenus() {
        var rs = await super.onGetContextMenus();
        var rg = rs.find(g => g.name == 'text-center');
        if (rg) {
            rg.text = lst('对齐');
            rg.name = undefined;
            rg.icon = { name: 'byte', code: 'align-text-both' }
            rg.type = undefined;
            rg.childs = [
                {
                    name: 'text-center',
                    icon: { name: 'byte', code: 'align-text-left' },
                    text: lst('居左'),
                    value: 'left',
                    checkLabel: this.align == 'left'
                },
                {
                    name: 'text-center',
                    icon: { name: 'byte', code: 'align-text-center' },
                    text: lst('居中'),
                    value: 'center',
                    checkLabel: this.align == 'center'
                },
                {
                    name: 'text-center',
                    icon: {
                        name: 'byte',
                        code: 'align-text-right'
                    },
                    text: lst('居右'),
                    value: 'right',
                    checkLabel: this.align == 'right'
                }
            ]
            var pos = rs.findIndex(g => g == rg);
            var ns: MenuItem<string | BlockDirective>[] = [];
            ns.push({
                text: lst('主题'),
                icon: { name: 'bytedance-icon', code: 'link-four' },
                childs: [
                    { name: 'searchStyle', text: lst('红色'), value: 'primary', checkLabel: this.searchStyle == 'primary' },
                    { name: 'searchStyle', text: lst('蓝色'), value: 'blue', checkLabel: this.searchStyle == 'blue' },
                    { name: 'searchStyle', text: lst('绿色'), value: 'green', checkLabel: this.searchStyle == 'green' },
                    { name: 'searchStyle', text: lst('紫色'), value: 'purple', checkLabel: this.searchStyle == 'purple' },
                    { name: 'searchStyle', text: lst('黑色'), value: 'dark', checkLabel: this.searchStyle == 'dark' },
                    { name: 'searchStyle', text: lst('白色'), value: 'ghost', checkLabel: this.searchStyle == 'ghost' },
                ]
            })
            rs.splice(pos + 1, 0, ...ns)
            lodash.remove(rs, g => g.name == 'color');
        }
        return rs;
    }
    async onClickContextMenu(item: MenuItem<string | BlockDirective>, e) {
        switch (item.name) {
            case 'searchStyle':
            case 'buttonSize':
            case 'text-center':
                await this.onUpdateProps({ [item.name == 'text-center' ? "align" : item.name]: item.value }, { range: BlockRenderRange.self })
                return
        }
        return await super.onClickContextMenu(item, e);
    }
    getVisibleHandleCursorPoint(): Point {
        if (this.el) {
            var db = this.el.querySelector('.sy-search-block') as HTMLElement;
            var bound = Rect.fromEle(db);
            if (bound) {
                var pos = Point.from(bound);
                pos = pos.move(0, 3 + util.remToPx(this.page.lineHeight) / 2);
                return pos;
            }
        }
    }
}

@view('/search')
export class SearchWorkspaceView extends BlockView<SearchWorkspace>{
    searchList: SearchListType<{
        id: string,
        creater: string,
        score?: string,
        title?: string,
        content: string
    }, {
        isOnlySearchTitle?: boolean,
        editDate: number,
        pages: LinkPageItem[]
    }> = { editDate: -1, isOnlySearchTitle: false, loading: false, list: [], pages: [], total: 0, page: 1, size: 20 };
    renderView() {
        var style: CSSProperties = this.block.contentStyle;
        if (this.block.align == 'left') style.justifyContent = 'flex-start';
        else if (this.block.align == 'right') style.justifyContent = 'flex-end';
        else style.justifyContent = 'center';
        var borderStyle: CSSProperties = {

        }
        return <div style={this.block.visibleStyle}>
            <div className="flex" style={style}>
                <div className="relative"
                    style={{ width: '90%' }}
                    onMouseDown={e => {
                        e.stopPropagation();
                        if (this.dropEle?.style.display == 'none' && this.searchList.word)
                            this.dropEle.style.display = 'block';
                    }}>
                    <div className={"flex round-8 sy-search-block " + ("sy-search-block-" + this.block.searchStyle)}
                        style={{
                            height: 40,
                            borderRadius: 8,
                            paddingLeft: 2
                        }}
                    >
                        <div className="flex-auto" style={{
                            backgroundColor: '#fff',
                            borderRadius: 8
                        }}>
                            <Input
                                inputClassName={'round-8'}
                                clear
                                noborder
                                inputStyle={{ fontSize: '18px' }}
                                size='larger'
                                onClear={() => {
                                    this.searchList.word = '';
                                    if (this.dropEle) this.dropEle.style.display = 'none';
                                    this.onForceSearch()
                                }}
                                placeholder={lst('在{text}中搜索', { text: this.block.page.ws?.text || lst('空间') })}
                                value={this.searchList.word}
                                onEnter={e => {
                                    this.searchList.word = e;
                                    this.onForceSearch()
                                }}
                                onChange={e => {
                                    this.searchList.word = e;
                                    if (this.searchList.word) this.dropEle.style.display = 'block';
                                    else this.dropEle.style.display = 'none';
                                    this.onSearch()
                                }} className={'flex-auto'} />
                        </div>
                        <span className={"flex-fixed flex f-14 gap-w-5 cursor" + (this.block.searchStyle == 'ghost' ? " remark" : "")}
                            style={{

                            }}
                            onMouseDown={e => this.onForceSearch()}>
                            <Icon size={16} icon={{ name: 'byte', code: 'search' }}></Icon>
                            <span className="gap-l-3"><S>搜索</S></span>
                        </span>
                    </div>
                    <div className="pos bg-white shadow round" ref={e => this.dropEle = e} style={{ display: 'none', top: 50, left: 0, right: 0 }}>
                        <div className="pos size-20 flex-center round item-hover" style={{ top: 0, right: 0 }} onMouseDown={e => {
                            e.stopPropagation();
                            this.dropEle.style.display = 'none';
                        }} >
                            <Icon size={16} icon={CloseSvg}></Icon>
                        </div>
                        <div className="padding-h-10 overflow-y max-h-300">
                            {this.searchList.loading && <Spin block></Spin>}
                            {!this.searchList.loading && this.renderList()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    dropEle: HTMLElement;
    async onSelect(item: LinkPageItem) {
        channel.air('/page/open', { item: item.id });
    }
    renderList() {
        if (this.searchList.list.length == 0 && this.searchList.pages.length == 0) return <div className="h-30 flex-center remark"><S>没有搜到相关的内容</S></div>
        if (this.searchList.pages?.length > 0 && this.searchList.list.length == 0) {
            return this.searchList.pages.map(r => {
                return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                    <div className="flex">
                        <span className="flex-fixed flex-line flex-center size-20 round remark gap-r-5"><Icon size={16} icon={getPageIcon(r)}></Icon></span>
                        <span className="text f-14 flex-auto">{getPageText(r)}</span>
                        <span className="flex-fixed remark f-14">{util.showTime(r.editDate || r.createDate)}</span>
                    </div>
                </div>
            })
        }
        return this.searchList.list.map(r => {
            return <div key={r.id} className="padding-10 item-hover round cursor" onMouseDown={e => this.onSelect(r)}>
                <div className="flex">
                    <span className="flex-line flex-center size-20 round remark gap-r-5"><Icon size={16} icon={getPageIcon(r)}></Icon></span>
                    <span className="text f-14">{getPageText(r)}</span>
                </div>
                <div className="remark f-14">{r.content}</div>
            </div>
        })
    }
    onForceSearch = async () => {
        if (this.searchList.word) {
            this.searchList.loading = true;
            this.forceUpdate();
            try {
                var r = await channel.get('/ws/search', {
                    word: this.searchList.word,
                    ws: this.block.page.ws,
                    editDate: this.searchList.editDate,
                    isOnlySearchTitle: this.searchList.isOnlySearchTitle
                });
                if (r.ok) {
                    this.searchList = Object.assign(this.searchList, r.data);
                    if (!Array.isArray(this.searchList.pages)) this.searchList.pages = [];
                }
            }
            catch (e) {
                console.error(e);
            }
            finally {
                this.searchList.loading = false;
                this.forceUpdate();
            }
        }
        else this.forceUpdate()
    }
    onSearch = lodash.debounce(async () => {
        this.onForceSearch();
    }, 1000)
}