// import React from "react";
// import { TableSchema } from "../../../blocks/data-grid/schema/meta";
// import { EventsComponent } from "../../../component/lib/events.component";
// import { Point, Rect } from "../../../src/common/vector/point";
// import { Page } from "../../../src/page";
// import { PopoverSingleton } from "../../popover/popover";
// import { createFormPage } from "./page";
// import Dots from "../../../src/assert/svg/dots.svg";
// import { Icon } from "../../../component/view/icon";
// import "./style.less";
// import { useSelectMenuItem } from "../../../component/view/menu";
// import { MenuItemType } from "../../../component/view/menu/declare";
// import { LinkSvg, LockSvg, OpenAsPageThickSvg, TrashSvg, UnlockSvg } from "../../../component/svgs";

// class FormPage extends EventsComponent {
//     schema: TableSchema;
//     row?: Record<string, any>;
//     width: number = 800;
//     height: number = 500;
//     recordViewId: string;
//     async open(options: {
//         width: number, height: number,
//         schema: TableSchema | string,
//         recordViewId: string,
//         row?: Record<string, any>
//     }) {
//         if (typeof this.schema == 'string') this.schema = await TableSchema.loadTableSchema(this.schema);
//         else this.schema = options.schema as TableSchema;
//         this.row = options.row;
//         this.width = options.width;
//         this.height = options.height;
//         this.recordViewId = options.recordViewId;
//         this.forceUpdate(() => {
//             if (this.el && this.schema) this.renderPage();
//         });
//     }
//     async openProperty(event: React.MouseEvent) {
//         var result = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
//             [
//                 { name: 'smallText', text: '小字号', checked: this.pageView.smallFont ? true : false, type: MenuItemType.switch },
//                 { name: 'fullWidth', text: '宽版', checked: this.pageView.isFullWidth ? true : false, type: MenuItemType.switch },
//                 { type: MenuItemType.divide },
//                 { name: 'lock', text: 'this.pageInfo.locker?.userid' ? "解除锁定" : '编辑保护', icon: 'this.pageInfo.locker?.userid' ? UnlockSvg : LockSvg },
//                 { name: 'copylink', icon: LinkSvg, text: '复制链接' },
//                 { type: MenuItemType.divide },
//                 { name: 'delete', icon: TrashSvg, text: '删除' }
//             ],
//             {
//                 input: (item) => {
//                     if (item.name == 'smallText') {
//                         this.pageView.onUpdateProps({ smallFont: item.checked }, true);
//                     }
//                     else if (item.name == 'fullWidth') {
//                         this.pageView.onUpdateProps({ isFullWidth: item.checked }, true);
//                     }
//                 }
//             }
//         );
//         if (result?.item) {

//         }
//     }
//     async openPublish(event: React.MouseEvent) {
//         var result = await useSelectMenuItem({ roundArea: Rect.fromEvent(event) },
//             [
//                 { name: 'smallText', text: '公开至互联网', checked: this.pageView.smallFont ? true : false, type: MenuItemType.switch },
//                 { name: 'smallText', text: '仅限用户提交一次', checked: this.pageView.smallFont ? true : false, type: MenuItemType.switch },
//                 { type: MenuItemType.divide },
//                 { name: 'copylink', icon: LinkSvg, text: '复制链接' },
//                 // { name: 'fullWidth', text: '宽版', checked: this.pageView.isFullWidth ? true : false, type: MenuItemTypeValue.switch },
//                 // { type: MenuItemTypeValue.divide },
//                 // { name: 'lock', text: 'this.pageInfo.locker?.userid' ? "解除锁定" : '编辑保护', icon: 'this.pageInfo.locker?.userid' ? UnlockSvg : LockSvg },
//                 // { name: 'copylink', icon: LinkSvg, text: '复制链接' },
//                 // { type: MenuItemTypeValue.divide },
//                 // { name: 'delete', icon: TrashSvg, text: '删除' }
//             ],
//             {
//                 input: (item) => {
//                     // if (item.name == 'smallText') {
//                     //     this.pageView.onUpdateProps({ smallFont: item.checked }, true);
//                     // }
//                     // else if (item.name == 'fullWidth') {
//                     //     this.pageView.onUpdateProps({ isFullWidth: item.checked }, true);
//                     // }
//                 }
//             }
//         );
//         if (result?.item) {

//         }
//     }
//     componentDidMount(): void {
//         if (this.el && this.schema) this.renderPage();
//     }
//     pageView: Page;
//     async renderPage() {
//         this.pageView = await createFormPage(this.el, {
//             schema: this.schema,
//             recordViewId: this.recordViewId,
//             row: this.row
//         });
//     }
//     getSchemaRow() {
//         return this.pageView.getSchemaRow()
//     }
//     el: HTMLDivElement;
//     render() {
//         return <div className="shy-form" style={{ width: this.width, height: this.height }}>
//             <div className="shy-form-head">
//                 <div className="shy-form-head-left">
//                     <span>{this.schema?.text}</span>
//                     <a onMouseDown={e => this.openProperty(e)}><Icon size={14} icon={OpenAsPageThickSvg}></Icon><span></span></a>
//                 </div>
//                 <div className="shy-form-head-right">
//                     <a><Icon size={20} icon='publish:sy' onClick={e => this.openPublish(e)}></Icon></a>
//                     <a onMouseDown={e => this.openProperty(e)}><Icon size={16} icon={Dots}></Icon></a>
//                 </div>
//             </div>
//             <div className="shy-form-content" style={{ height: this.height - 40 }}>
//                 <div className="shy-form-box" ref={e => this.el = e} ></div>
//             </div>
//         </div>
//     }
// }

// export async function useFormPage(options: {
//     schema: TableSchema | string,
//     recordViewId: string,
//     row?: Record<string, any>
// }) {
//     let popover = await PopoverSingleton(FormPage, { mask: true, shadow: true });
//     var width = 600;
//     var height = 400;
//     let formPage = await popover.open({
//         fixPoint: Point.from({
//             x: (window.innerWidth - width) / 2,
//             y: (window.innerHeight - height) / 2
//         })
//     });
//     await formPage.open({
//         width,
//         height,
//         schema: options.schema,
//         row: options.row,
//         recordViewId: options.recordViewId
//     });
//     return new Promise((resolve: (data: Record<string, any>) => void, reject) => {
//         formPage.only('save', (data: Record<string, any>) => {
//             popover.close();
//             resolve(data);
//         });
//         formPage.only('close', () => {
//             popover.close();
//             resolve(formPage.getSchemaRow());
//         })
//         popover.only('close', () => {
//             resolve(formPage.getSchemaRow())
//         })
//     })
// }

