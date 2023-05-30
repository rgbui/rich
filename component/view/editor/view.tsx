
import { Editor, Toolbar } from '@wangeditor/editor-for-react'
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { EventsComponent } from '../../lib/events.component';
import React from 'react';
import { useImagePicker } from '../../../extensions/image/picker';

export class RichViewEditor extends EventsComponent<{ html: string, onChange: (e: string,pics?:string[],text?:string) => void }> {

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
                'redo',
                'undo',
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
                    insertFn(r.url, r.filename);
                    self.onChange();
                }
            }
        }
        return <div >
            <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
                <Toolbar
                    editor={this.editor}
                    defaultConfig={toolbarConfig}
                    mode="simple"
                    style={{ borderBottom: '1px solid #ccc' }}
                />
                <Editor
                    defaultConfig={editorConfig}
                    value={this.props.html}
                    onCreated={e => this.editor = e}
                    onChange={editor => this.onChange()}
                    mode="simple"
                    style={{ height: '500px', overflowY: 'hidden' }}
                />
            </div>
        </div>
    }

    onChange() {
        this.editor.getHtml();
        var pics = this.editor.getElemsByType('image').map(c => (c as any).src);
        this.props.onChange(this.editor.getHtml(), pics,this.editor.getText())
    }

    componentWillUnmount(): void {
        if (this.editor) this.editor.destroy()
        this.editor = null;
    }
}