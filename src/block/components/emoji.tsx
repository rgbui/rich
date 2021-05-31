import { BaseComponent } from "../base/component";
import React from 'react';
import { url, view } from "../factory/observable";
import { Content } from "../base/common/content";
@url('/emoji')
export class Icon extends Content {

}
@view('/emoji')
export class IconView extends BaseComponent<Icon>{
    render() {
        return <div className='sy-block-emoji'>

        </div>
    }
}