
import React, { CSSProperties } from "react";
import { TableStoreGallery } from "../../view/gallery";
import { TableStoreItem } from "../../view/item";
import { DataGridItemRecord } from "../../view/item/record";
import { useImageFilePicker } from "../../../../extensions/file/image.picker";
import { Rect } from "../../../../src/common/vector/point";
import { DataGridView } from "../../view/base";
import { Field } from "../../schema/field";
import { FieldType } from "../../schema/type";
import { TableStoreList } from "../../view/list";
import lodash from "lodash";
import { ShyAlert } from "../../../../component/lib/alert";
import { lst } from "../../../../i18n/store";
import { Confirm } from "../../../../component/lib/confirm";
import { util } from "../../../../util/util";
import { ResourceArguments } from "../../../../extensions/icon/declare";
import { Edit1Svg, LoveFillSvg, LoveSvg, TrashSvg, UploadSvg } from "../../../../component/svgs";
import { S } from "../../../../i18n/view";
import { ElementType, autoImageUrl, getElementUrl } from "../../../../net/element.type";
import { Icon } from "../../../../component/view/icon";
import { useUserCard } from "../../../../component/view/avator/card";
import { Avatar } from "../../../../component/view/avator/face";
import { UserBox } from "../../../../component/view/avator/user";
import { useSelectMenuItem } from "../../../../component/view/menu";
import { MenuItem, MenuItemType } from "../../../../component/view/menu/declare";
import { channel } from "../../../../net/channel";
import { BlockDirective, BlockRenderRange } from "../../../../src/block/enum";
import { CopyAlert } from "../../../../component/copy";

export class CardView extends React.Component<{
    item: DataGridItemRecord | TableStoreItem,
    dataGrid: DataGridView | DataGridItemRecord
}> {
    get dataGrid() {
        return this.props.dataGrid instanceof DataGridView ? this.props.dataGrid : null;
    }
    cardConfig() {
        if ((this.props.dataGrid instanceof TableStoreGallery) || (this.props.dataGrid instanceof TableStoreList)) {
            return this.props.dataGrid.cardConfig;
        }
    }
    cardSettings<T = Record<string, any>>(def?: T) {
        var cs = this.props.dataGrid?.cardSettings || {};
        if (typeof def == 'undefined') def = {} as T;
        return Object.assign(def, cs) as T;
    }
    get schema() {
        if ((this.props.dataGrid instanceof TableStoreGallery) || (this.props.dataGrid instanceof TableStoreList)) {
            return this.props.dataGrid.schema;
        }
    }
    get dataRow() {
        return this.props.item.dataRow;
    }
    get elementUrl() {
        return getElementUrl(ElementType.SchemaData, this.dataGrid.schema.id, this.dataRow.id)
    }
    getRowIndex() {
        if (this.props.item instanceof TableStoreItem) return this.props.item.dataIndex;
        else return -1;
    }
    getFields(name: string) {
        var n = this.cardConfig().templateProps.props?.find(g => g.name == name);
        if (n) {
            var fs: Field[];
            if (Array.isArray(n.bindFieldIds)) {
                fs = this.schema.fields.filter(c => n.bindFieldIds.includes(c.id));
            }
            else fs = [this.schema.fields.find(c => c.id == n.bindFieldId)];
            lodash.remove(fs, c => c ? false : true);
            return fs
        }
        return []
    }
    getFieldRowValue(name: string) {
        var fs = this.getFields(name);
        if (fs.length > 0) {
            if (typeof this.props.item?.dataRow != 'undefined')
                for (let f of fs) {
                    if (typeof this.props.item.dataRow[f.name] != 'undefined') return { field: f, value: this.props.item.dataRow[f.name] };
                }
        }
        return { field: null, value: undefined };
    }
    getValue<T = string>(name: string, safeType?: FieldType): T {
        var { value, field } = this.getFieldRowValue(name)
        if (typeof value != 'undefined') {
            if (typeof safeType != 'undefined') {
                switch (safeType) {
                    case FieldType.comment:
                    case FieldType.like:
                    case FieldType.love:
                    case FieldType.oppose:
                    case FieldType.browse:
                        if (typeof value?.count == 'number' && Array.isArray(value?.users)) return value;
                        else return { count: 0, users: [] } as any
                        break
                    case FieldType.option:
                    case FieldType.options:
                        var v = util.covertToArray(value);
                        return v.map(g => {
                            var op = field.config.options.find(c => c.value == g);
                            if (op?.text) return { text: op.text, color: op.color };
                            else return { text: g };
                        }) as any
                        break;
                    case FieldType.image:
                    case FieldType.cover:
                        var v = util.covertToArray(value);
                        return v as any;
                        break;
                    case FieldType.creater:
                    case FieldType.modifyer:
                    case FieldType.user:
                        var v = util.covertToArray(value);
                        return v as any;
                        break;
                }
            }
            return value;
        }
        else {
            if (typeof safeType != 'undefined') {
                switch (safeType) {
                    case FieldType.comment:
                    case FieldType.like:
                    case FieldType.love:
                    case FieldType.oppose:
                    case FieldType.browse:
                        return { count: 0, users: [] } as any
                    case FieldType.option:
                    case FieldType.options:
                        return [] as any
                    case FieldType.image:
                    case FieldType.cover:
                        return [] as any
                    case FieldType.creater:
                    case FieldType.modifyer:
                    case FieldType.user:
                        return [] as any
                }
            }
        }
    }
    async uploadImage(name: string, event: React.MouseEvent | MouseEvent | Rect, updateFileName?: string) {
        if (typeof (event as any).stopPropagation == 'function') (event as any).stopPropagation()
        var resource = await useImageFilePicker({ roundArea: event instanceof Rect ? event : Rect.fromEle(event.currentTarget as HTMLElement) });
        if (resource) {
            var fs = this.getFields(name);
            var field: Field;
            if (fs.length > 1) field = fs.find(g => g.type != FieldType.cover)
            else field = fs[0];
            if (this.props.item instanceof TableStoreItem) {
                if (updateFileName) {
                    var uf = this.schema.fields.find(c => c.name == updateFileName);
                    var filename = resource.filename;
                    var filename = filename ? filename.slice(0, filename.lastIndexOf('.')) : lst('图片') as string;
                    await this.props.item.onUpdateCellProps({
                        [field.name]: [resource],
                        [uf.name]: filename
                    })
                }
                else {
                    await this.props.item.onUpdateCellValue(field, [resource]);
                }
                this.forceUpdate()
            }
        }
    }
    async deleteItem() {
        if (this.props.item instanceof TableStoreItem || this.props.dataGrid instanceof TableStoreList) {
            if (await Confirm(lst("确定要删除吗")))
                await (this.props.dataGrid as DataGridView).onRemoveRow(this.props.item.dataRow.id);
        }
    }
    async openEdit(event?: React.MouseEvent, forceUrl?: '/page/open' | '/page/dialog' | '/page/slide') {
        if (this.dataGrid) {
            this.dataGrid.onOpenEditForm(this.props.item.dataRow.id, forceUrl)
        }
    }
    async onGetMenus() {
        var self = this;
        var items: MenuItem<BlockDirective | string>[] = [
            { name: 'open', icon: Edit1Svg, text: lst('打开') },
            {
                name: 'openSlide',
                icon: { name: 'byte', code: 'logout' },
                text: lst('右侧边栏打开'),
            },
            { type: MenuItemType.divide },
            {
                name: 'copyID',
                text: lst('复制数据ID'),
                icon: { name: 'byte', code: 'adobe-indesign' }
            },
            {
                name: 'copyUrl',
                text: lst('复制数据网址'),
                icon: { name: 'byte', code: 'copy-link' }
            },
            { type: MenuItemType.divide },
            { name: 'remove', icon: TrashSvg, text: lst('删除') }
        ]
        if (self.dataRow.modifyer) {
            items.push({
                type: MenuItemType.divide,
            });
            var ru = await channel.get('/user/basic', { userid: self.dataRow.modifyer });
            if (ru?.data?.user) items.push({
                type: MenuItemType.text,
                text: lst('编辑人') + ' ' + ru.data.user.name
            });
            if (self.dataRow.modifyDate) items.push({
                type: MenuItemType.text,
                text: lst('编辑于') + ' ' + util.showTime(new Date(this.dataRow.modifyDate))
            });
        }
        return items;
    }
    async openMenu(event: React.MouseEvent) {
        var self = this;
        var ele = event.currentTarget as HTMLElement;
        event.stopPropagation();
        var action = async () => {
            ele.classList.remove('visible');
            try {
                var rect = Rect.fromEvent(event);
                var menus = await this.onGetMenus()
                menus = util.neighborDeWeight(menus, c => {
                    if (c.type == MenuItemType.text) return 'text.' + c.text;
                    else if (c.type == MenuItemType.divide) return (c.name || '') + (c.type || 0).toString()
                    else return 'l.' + c.text
                });
                if (menus[0]?.type == MenuItemType.divide) menus = menus.slice(1);
                if (menus.last()?.type == MenuItemType.divide) menus = menus.slice(0, -1);
                var r = await useSelectMenuItem({ roundArea: rect }, menus, {
                    async input(item) {
                        await self.onContextMenuInput(item)
                    },
                    async click(item, event, clickName, mp) {
                        await self.onClickContextMenu(item, event.nativeEvent);
                    }
                });
                if (r) {
                    await self.onClickContextMenu(r.item, r.event)
                }
            }
            catch (ex) {

            }
            finally {
                ele.classList.add('visible')
            }
        }
        if (this.dataGrid) this.dataGrid.onDataGridTool(async () => await action())
        else await action();
    }
    async onContextMenuInput(item: MenuItem<BlockDirective | string>, options?: { merge?: boolean }) {
        var self = this;
        if (item.name == 'align') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.align': item.value }, { range: BlockRenderRange.self })
        }
    }
    async onClickContextMenu(item: MenuItem<BlockDirective | string>, event: MouseEvent, options?: { merge?: boolean }) {
        var self = this;
        if (item.name == 'align') {
            await self.dataGrid.onUpdateProps({ 'cardSettings.align': item.value }, { range: BlockRenderRange.self })
        }
        else if (item.name == 'remove') {
            await self.deleteItem();
        }
        else if (item.name == 'open') {
            await self.openEdit();
        }
        else if (item.name == 'openSlide') {
            await this.dataGrid.onOpenEditForm(this.dataRow.id, '/page/slide');
        }
        else if (item.name == 'copyID') {
            CopyAlert(this.dataRow.id, lst('复制ID成功'));
        }
        else if (item.name == 'copyUrl') {
            CopyAlert(self.dataGrid.page.ws.resolve({ elementUrl: this.elementUrl }), lst('复制网址成功'));
        }
    }
    get isCanEdit() {
        return this.props.dataGrid.isCanEdit();
    }
    isEmoji(name: string) {
        if (!this.props.item.dataRow) return false;
        var field: Field = this.getFields(name).first();
        if ((this.props.dataGrid instanceof TableStoreGallery || this.props.dataGrid instanceof TableStoreList) && field) {
            var r = this.props.dataGrid.isEmoji(field, this.props.item.dataRow.id);
            return r;
        }
    }
    async onUpdateCellInteractive(event: React.MouseEvent, name: string) {
        event.stopPropagation()
        if (!this.props.dataGrid.page.isSign) {
            ShyAlert(lst('请先登录'))
            return
        }
        var field: Field = this.getFields(name).first();
        if (this.props.item instanceof TableStoreItem) {
            await this.props.item.onUpdateCellInteractive(field);
            this.forceUpdate()
        }
    }
    /***
     * 渲染各种卡片视图模块
     */
    /**
     *  渲染封面
     * @param name 
     * @param options 
     * @returns 
     */
    renderCover(name: string,
        options?: {
            allowUpload?: boolean,
            uploadFileName?: string
        }) {
        var pics = this.getValue<ResourceArguments[]>(name);
        if (pics && !Array.isArray(pics)) pics = [pics];
        var hasPic = Array.isArray(pics) && pics.length > 0;
        return <>
            {hasPic && <img style={{
                backgroundColor: 'rgb(202, 202, 202)'
            }} className="w100 block round-8 object-center" src={autoImageUrl(pics[0].url, 500)} />}
            {!hasPic && <div className="relative flex-center" style={{
                height: util.getRandom(150, 300),
                backgroundColor: 'rgb(202, 202, 202)'
            }}>
                {options?.allowUpload && <span onMouseDown={e => this.uploadImage(name, e, options?.uploadFileName || 'title')} className="padding-w-5 visible  bg-dark-1 text-white round cursor flex">
                    <span className="size-20 flex-center flex-inline"><Icon size={16} icon={UploadSvg}></Icon></span>
                    <span className="f-14"><S>上传图片</S></span>
                </span>}
                {!options?.allowUpload && <span className="f-14 remark"><S>暂无图片</S></span>}
            </div>}
        </>
    }
    /**
     * 
     * @param title 
     * @param remark 
     * @param options {
     * titleLink?: string, 标题是否加超链接
     * titleLinkTarget?: boolean, 标题超链接是否新窗口打开
     * remarkRowCount?: number, 备注显示行数
     * remarkLink?: string, 备注是否加查看全文超链接
     * }
     * @returns 
     */
    renderTitleRemark(title: string, remark: string, options?: {
        titleLink?: string,
        titleLinkTarget?: boolean,
        titleStyle?: CSSProperties,
        titleClassName?: string | string[],
        remarkRowCount?: number,
        remarkLink?: string,
        remarkStyle?: CSSProperties,
        remarkClassName?: string | string[]
    }) {
        var title = this.getValue<string>('title');
        var remark = this.getValue<string>('remark');
        return <div>
            {title && <div className={"text-1 gap-h-5 bold break-all " + (util.covertToArray(options?.titleClassName || []).join(" "))}
                style={{ ...(options?.titleStyle || {}) }}>{options?.titleLink ? <a href={options?.titleLink} target={options?.titleLinkTarget ? "_blank" : "_self"}>{title}</a> : title}</div>}
            {remark && <div className={"remark f-12 gap-h-5 break-all " + (util.covertToArray(options?.titleClassName || []).join(" "))} style={{ ...(options?.remarkStyle || {}) }}>
                {remark}
            </div>}
        </div>
    }
    renderTags(name: string) {
        var tags = this.getValue<{ text: string, color: string }[]>(name, FieldType.options);
        return tags && tags.length > 0 && <div className="flex flex-wrap">
            {tags.map((t, i) => {
                return <span className="round-16 padding-w-10 item-light-hover-focus h-24 flex-center f-12 gap-h-5 gap-r-10" key={i}>{t.text}</span>
            })}
        </div>
    }
    renderUserLove(userName: string, loveName: string, options?: {}) {
        var author = this.getValue<string[]>(userName, FieldType.user)[0];
        var like = this.getValue<{ count: number, users: string[] }>(loveName, FieldType.like);
        var isLike = this.isEmoji(loveName)
        return <div className="f-14  flex">
            <div className="flex-fixed flex">
                <UserBox userid={author}>{(user) => {
                    return <div onMouseDown={e => {
                        e.stopPropagation();
                        useUserCard({ roundArea: Rect.fromEle(e.currentTarget as HTMLElement) }, { user, ws: this.dataGrid.page.ws })
                    }} className="flex" >
                        <Avatar user={user}></Avatar>
                        <a className="cursor gap-l-5 underline-hover  " style={{ color: 'inherit' }}>{user.name}</a>
                    </div>
                }}</UserBox>
            </div>
            <div className="flex-auto flex-end">
                <span onMouseDown={e => this.onUpdateCellInteractive(e, loveName)} className={"circle flex-center cursor" + (isLike ? " text-p" : " ")}>
                    <Icon size={16} icon={isLike ? LoveFillSvg : LoveSvg}></Icon>
                </span>
                {like.count > 0 && <span className=" cursor gap-l-5">{like.count}</span>}
            </div>
        </div>
    }
    renderUserDate(userName: string, dateName: string, options?: {}) {
        var author = this.getValue<string[]>(userName, FieldType.user)[0];
        var date = this.getValue<Date>(dateName);
        return author && <div className="flex">
            <UserBox userid={author}>{(user) => {
                return <div className="flex gap-r-10">
                    <Avatar size={24} user={user}></Avatar>
                    <a className="cursor gap-l-5 underline-hover text-1">{user.name}</a>
                </div>
            }}</UserBox><span className="remark f-12">{util.showTime(date)}</span>
        </div>
    }

}