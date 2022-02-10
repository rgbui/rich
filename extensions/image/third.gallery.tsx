import React from "react";
import { Input } from "../../component/view/input";
import { Sp } from "../../i18n/view";
import { LangID } from "../../i18n/declare";
import { langProvider } from "../../i18n/provider";
import { Directive } from "../../util/bus/directive";
import { GalleryType, OuterPic } from "./declare";
import { channel } from "../../net/channel";
export class ThirdGallery extends React.Component<{ type: GalleryType, onChange: (image: OuterPic) => void }>{
    word: string = 'cat';
    loading: boolean = false;
    pics: OuterPic[] = [];
    async onSearch(word: string) {
        this.word = word;
        this.loading = true;
        this.forceUpdate();
        var r = await channel.get('/gallery/query', { type: this.props.type, word: this.word });
        if (r && r.ok) this.pics = r.data;
        else this.pics = [];
        this.forceUpdate()
    }
    renderImages() {
        return <div className='shy-third-gallery-pics'>{this.pics.map((pic, i) => {
            <div className='shy-third-gallery-pic' onMouseDown={e => this.props.onChange(pic)}>
                <img src={pic.thumb} />
                <div className='shy-third-gallery-author'>
                    <span>by<a href={pic.link}>{pic.name}</a></span>
                </div>
            </div>
        })}</div>
    }
    render() {
        var origin = <a href="https://www.pexels.com/" target="_blank">Pexels</a>;
        if (this.props.type == GalleryType.unsplash)
            origin = <a href="https://www.unsplash.com/" target="_blank">Unsplash</a>;
        return <div className='shy-third-gallery'>
            <Input value={this.word} onChange={e => this.word = e} onEnter={e => this.onSearch(e)} clear placeholder={langProvider.getText(LangID.SearchImage)}></Input>
            <div className='shy-third-gallery-origin'>
                <Sp id={LangID.ImageOrigin}></Sp>
                {origin}
            </div>
            <div className='shy-third-gallery-content'>
                {this.loading == true && <div className='shy-third-gallery-loading'></div>}
                {this.loading == false && this.renderImages()}
            </div>
        </div>
    }
}