
import lodash from "lodash";
import React from "react";
import { Input } from "../../component/view/input";
import { Loading } from "../../component/view/loading";
import { OuterPic } from "./declare";
import { S } from "../../i18n/view";
import { lst } from "../../i18n/store";

export class ImageGallery extends React.Component<{
    type: 'background' | 'content' | 'icon',
    onChange: (image: OuterPic) => void
}>{
    word: string = '';
    error: string = '';
    loading: boolean = false;
    pics: OuterPic[] = [];
    onSearch = lodash.debounce(async function () {

    }, 800);
    onmousedown(pic) {
        this.props.onChange(pic);
    }
    componentDidMount() {
        this.isM = true;
        this.onSearch.flush()
    }
    isM = false;
    componentWillUnmount(): void {
        this.isM = false;
    }
    renderImages() {
        return <div className='shy-third-gallery-pics'>{this.pics.map((pic, i) => {
            return <div className='shy-third-gallery-pic' key={i} onClick={e => this.onmousedown(pic)}>
                <div><img src={pic.thumb} draggable={false} /></div>
                <div className='shy-third-gallery-author'>
                    {pic.name && <><span>by</span><a target="_blank" href={pic.link}>{pic.name}</a></>}
                </div>
            </div>
        })}</div>
    }
    render() {
        return <div className='shy-third-gallery'>
            <div className="shy-third-gallery-search"><Input value={this.word} onChange={e => this.word = e} onEnter={e => { this.word = e; this.onSearch() }} clear placeholder={lst('图片搜索...')}></Input></div>
            <div className='shy-third-gallery-content'>
                {this.loading == true && <div className='shy-third-gallery-loading'><Loading></Loading></div>}
                {this.loading == false && this.renderImages()}
                {this.error && this.pics.length == 0 && <div className='shy-third-gallery-error'><span><S>图片资源获取失败</S></span><a onClick={e => this.onSearch()}><S>重新尝试</S></a></div>}
            </div>
        </div>
    }
}