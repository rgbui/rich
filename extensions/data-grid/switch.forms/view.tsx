// import React, { ReactNode } from "react";
// import { EventsComponent } from "../../../component/lib/events.component";
// import { Icon } from "../../../component/view/icon";
// import { useSelectMenuItem } from "../../../component/view/menu";
// import { MenuItemType } from "../../../component/view/menu/declare";
// import { channel } from "../../../net/channel";
// import { Point } from "../../../src/common/vector/point";
// import { PopoverSingleton } from "../../popover/popover";
// import { PopoverPosition } from "../../popover/position";
// import "./style.less";
// import Plus from "../../../src/assert/svg/plus.svg";
// import Dots from "../../../src/assert/svg/dots.svg";
// import DragSvg from "../../../src/assert/svg/dragHandle.svg";
// import TrashSvg from "../../../src/assert/svg/trash.svg";
// import { Divider } from "../../../component/view/grid";
// import { DocAddSvg, DocEditSvg, EditSvg } from "../../../component/svgs";
// import { getElementUrl, ElementType } from "../../../net/element.type";
// import { Page } from "../../../src/page";
// import { DataGridView } from "../../../blocks/data-grid/view/base";

// class TabelSchemaFormDrop extends EventsComponent {
//     block: DataGridView;
//     get schema() {
//         return this.block?.schema
//     }
//     async open(options: { block: DataGridView }) {
//         this.block = options.block;
//         await this.syncForceUpdate();
//     }
//     getFields() {
//         return this.schema.fields.map(fe => {
//             return {
//                 text: fe.text,
//                 value: fe.id
//             }
//         })
//     }
//     async onAdd(event: React.MouseEvent) {
//         var menus = [
//             { text: '表单名', name: 'name', value: '', type: MenuItemType.input },
//             { type: MenuItemType.divide },
//             {
//                 type: MenuItemType.button,
//                 text: '创建表单',
//                 name: 'create'
//             }
//         ]
//         var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
//         if (um) {
//             var name = menus[0].value;
//             if (name) {
//                 var result = await this.schema.onSchemaOperate([{ name: 'createSchemaRecordView', text: name }])
//                 var oneAction = result.data.actions.first();
//                 this.forceUpdate();
//                 this.onChange(this.schema.views.find(g => g.id == oneAction.id));
//             }
//         }
//     }
//     async onChange(view) {
//         this.emit('save', view);
//         var dialougPage: Page = await channel.air('/page/dialog',
//             {
//                 elementUrl: getElementUrl(ElementType.SchemaRecordView, this.schema.id, view.id),
//                 config: { isTemplate: true }
//             })
//         if (dialougPage) {
//             var newRow = dialougPage.getSchemaRow();
//             if (newRow) {
//                 //   await this.block.onAddRow(newRow, undefined, 'after');
//             }
//         }
//         await channel.air('/page/dialog', { elementUrl: null });
//     }
//     async onProperty(view, event: React.MouseEvent) {
//         event.stopPropagation();
//         var menus = [
//             {
//                 type: MenuItemType.input,
//                 text: '重命名表单',
//                 value: view.text,
//                 name: 'rename'
//             },
//             { type: MenuItemType.divide },
//             { text: '编辑', name: 'edit', icon: EditSvg },
//             { type: MenuItemType.divide },
//             { text: '默认收集单', name: 'defaultCollect', checkLabel: this.schema.defaultCollectFormId == view.id ? true : false, icon: DocAddSvg },
//             { text: '默认编辑单', name: 'defaultEdit', checkLabel: this.schema.defaultEditFormId == view.id ? true : false, icon: DocEditSvg },
//             { type: MenuItemType.divide },
//             { text: '删除', name: 'delete', icon: TrashSvg }
//         ]
//         var um = await useSelectMenuItem({ roundPoint: Point.from(event) }, menus);
//         if (um) {
//             if (um.item.name == 'delete') {
//                 this.schema.onSchemaOperate([{ name: 'removeSchemaRecordView', id: view.id }])
//                 this.forceUpdate();
//                 return;
//             }
//             else if (um.item.name == 'edit') {
//                 this.onChange(view);
//                 /**
//                  * 这里打开表单，进行编辑
//                  */
//                 return;
//             }
//             else if (um.item.name == 'defaultCollect') {
//                 this.schema.update({ defaultCollectFormId: view.id })
//             }
//             else if (um.item.name == 'defaultEdit') {
//                 this.schema.update({ defaultEditFormId: view.id })
//             }
//         }
//         var it = menus.find(g => g.name == 'rename');
//         if (it.value != view.text && it.value) {
//             this.schema.onSchemaOperate([{
//                 name: 'updateSchemaRecordView',
//                 id: view.id,
//                 data: { text: it.value }
//             }])
//             view.text = it.value;
//             this.forceUpdate();
//             return;
//         }
//     }
//     render(): ReactNode {
//         var self = this;
//         if (!this.schema) return <div></div>
//         var views = this.schema.recordViews;
//         if (!Array.isArray(views)) views = [];
//         return <div className="shy-schema-view-form-selectors">
//             {views.map(v => {
//                 return <div className="item-hover padding-w-10 h-30 round flex cursor text-1 f-14" key={v.id} onClick={e => this.onChange(v)}>
//                     <span className="size-24 flex-center flex-fixed"><Icon size={12} className={'drag'} icon={DragSvg}></Icon></span>
//                     <span className="flex-auto">{v.text}</span>
//                     <span className="size-24 flex-center flex-fixed item-hover round">
//                         <Icon size={14} className={'property'} icon={Dots} onClick={e => this.onProperty(v, e)}></Icon>
//                     </span>
//                 </div>
//             })}
//             <Divider></Divider>
//             <div className="item-hover padding-w-10  h-30 round flex item-hover cursor  text-1 f-14" onClick={e => this.onAdd(e)}>
//                 <span className="size-24 flex-center "><Icon size={16} icon={Plus}></Icon></span>
//                 <span className="flex-auto">新增表单</span>
//             </div>
//         </div>
//     }
// }

// export async function useTabelSchemaFormDrop(pos: PopoverPosition,
//     options: {
//         block: DataGridView
//     }) {
//     let popover = await PopoverSingleton(TabelSchemaFormDrop, { mask: true });
//     let fv = await popover.open(pos);
//     await fv.open(options);
//     popover.updateLayout()
//     return new Promise((resolve: (view: { id: string, text: string, url: string }) => void, reject) => {
//         popover.only('close', () => {
//             resolve(null)
//         });
//         fv.only('save', (data) => {
//             resolve(data);
//             popover.close()
//         })
//     })
// }