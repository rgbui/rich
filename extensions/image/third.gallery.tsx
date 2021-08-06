import React from "react";
import { Input } from "../../component/input";
import { Sp } from "../../i18n";
import { LangID } from "../../i18n/declare";
import { langProvider } from "../../i18n/provider";
import { Directive } from "../../util/bus/directive";
import { richBus } from "../../util/bus/event.bus";
import { GalleryType, OuterPic } from "./declare";
export class ThirdGallery extends React.Component<{ type: GalleryType, onChange: (image: OuterPic) => void }>{
    word: string = 'cat';
    loading: boolean = false;
    pics: OuterPic[] = [];
    async onSearch(word: string) {
        this.word = word;
        this.loading = true;
        this.forceUpdate();
        var list = await richBus.fireAsync(Directive.GalleryQuery, this.props.type, this.word);
        if (Array.isArray(list)) this.pics = list;
        else this.pics = [];
        this.forceUpdate()
    }
    renderImages() {
        return <div className='shy-gallery-pics'>{this.pics.map((pic, i) => {
            <div className='shy-gallery-pic' onMouseDown={e => this.props.onChange(pic)}>
                <img src={pic.thumb} />
                <div className='shy-gallery-author'>
                    <span>by<a href={pic.link}>{pic.name}</a></span>
                </div>
            </div>
        })}</div>
    }
    render() {
        var origin = <a href="https://www.pexels.com/" target="_blank">Pexels</a>;
        if (this.props.type == GalleryType.unsplash)
            origin = <a href="https://www.unsplash.com/" target="_blank">Unsplash</a>;
        return <div className='shy-gallery'>
            <Input value={this.word} onChange={e => this.word = e} onEnter={e => this.onSearch(e)} clear placeholder={langProvider.getText(LangID.SearchImage)}></Input>
            <div className='shy-gallery-origin'>
                <Sp id={LangID.ImageOrigin}></Sp>
                {origin}
            </div>
            <div className='shy-gallery-content'>
                {this.loading == true && <div className='shy-gallery-loading'></div>}
                {this.loading == false && this.renderImages()}
            </div>
        </div>
    }
}