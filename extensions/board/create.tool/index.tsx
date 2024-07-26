import React from "react";
import { EventsComponent } from "../../../component/lib/events.component";
import { lst } from "../../../i18n/store";







class BoardCreateTool extends EventsComponent {

    getTools() {
        return [
            { text: lst('嵌入网页') },
            { text: lst('代码块') },
            { text: lst('Latex公式') },
            { text: lst('上传文件') },
            { text: lst('插入图片') },
            { text: lst('上传视频') },
        ]
    }
    render() {
        return <div>

        </div>
    }
}