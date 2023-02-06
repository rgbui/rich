import '@wangeditor/editor/dist/css/style.css' // 引入 css
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { EventsComponent } from '../../lib/events.component';
import { PopoverPosition } from '../../../extensions/popover/position';
import { PopoverSingleton } from '../../../extensions/popover/popover';
import React from 'react';
import { useImagePicker } from '../../../extensions/image/picker';

export class ShyRichEditor extends EventsComponent {
    html: string = '';
    text: string = '';
    editor: IDomEditor
    render() {
        var self = this;
        // 工具栏配置
        const toolbarConfig: Partial<IToolbarConfig> = {
            excludeKeys: ['fullScreen',
                'color',
                'bgColor',
                'group-indent',
                'todo',
                'fontSize',
                'fontFamily',
                'lineHeight',
                'insertVideo',
                'group-video',
                'uploadVideo',
                'insertImage'
            ],
        }
        // TS 语法
        // const toolbarConfig = { }    
        // 编辑器配置
        const editorConfig: Partial<IEditorConfig> = {    // TS 语法
            // const editorConfig = {  
            MENU_CONF: {},                // JS 语法
            placeholder: '请输入内容...',
            hoverbarKeys: {}
        }

        editorConfig.MENU_CONF['uploadImage'] = {
            // 自定义选择图片
            async customBrowseAndUpload(insertFn) {
                var r = await useImagePicker({ center: true });
                if (r) {
                    insertFn(r.url, r.text);
                    self.onChange();
                }
            }
        }
        return <div className='w-1200'>
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
                <Toolbar
                    editor={this.editor}
                    defaultConfig={toolbarConfig}
                    mode="simple"
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    value={this.html}
                    onCreated={e => this.editor = e}
                    onChange={editor => this.onChange()}
                    mode="simple"
                    style={{ height: '500px', overflowY: 'hidden' }}
                />
            </div>
        </div>
    }
    isChange: boolean = false;
    pics: string[] = [];
    onChange() {
        this.html = this.editor.getHtml();
        this.text = this.editor.getText();
        this.pics = this.editor.getElemsByType('image').map(c => (c as any).src);
        this.isChange = true;
    }
    open(props: { html: string }) {
        this.html = props.html;
        this.isChange = false;
        this.forceUpdate();
    }
    componentWillUnmount(): void {
        if (this.editor) this.editor.destroy()
        this.editor = null;
    }
}
export async function useShyRichEditor(props: { html: string }) {
    var pos: PopoverPosition = { center: true, centerTop: 100 };
    let popover = await PopoverSingleton(ShyRichEditor, { mask: true, shadow: true });
    let fv = await popover.open(pos);
    fv.open(props);
    return new Promise((resolve: (data: { content: string, text: string, pics: string[] }) => void, reject) => {
        popover.only('close', () => {
            resolve({ content: fv.isChange ? fv.html : '', text: fv.isChange ? fv.text : undefined, pics: fv.isChange ? fv.pics : undefined });
        });
    })
}
