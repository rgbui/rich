import React from "react";
import { Input } from "../../component/view/input";
import { GalleryType, OuterPic } from "./declare";
import { createClient } from 'pexels';
import { Loading } from "../../component/view/loading";
import { util } from "../../util/util";
import { S, Sp } from "../../i18n/view";
import { ls, lst } from "../../i18n/store";
export class ThirdGallery extends React.Component<{ type: GalleryType, onChange: (image: OuterPic) => void }>{
    word: string = '';
    error: string = '';
    loading: boolean = false;
    pics: OuterPic[] = [];
    async onSearch(word: string) {
        this.word = word;
        this.error = '';
        this.loading = true;
        this.forceUpdate();
        try {
            var size = 28;
            if (this.props.type == GalleryType.unsplash) {
                let access_key = `sw0W_oo4Z0xzhgmuL__uU6Cf4nV_qgpsor5Zmmf_Qxo`;
                /**
                 * 如果搜索词为空，调用的URL是/photos,否则是/search/photos
                 */
                var url = this.word
                    ? `https://api.unsplash.com/search/photos?orientation=landscape&lang=en&page=1&per_page=${size}&query=${this.word}&client_id=${access_key}`
                    : `https://api.unsplash.com/photos?lang=en&page=1&per_page=${size}&client_id=${access_key}`
                var r = await util.getJson(url);
                var result = []
                var rs: any[] = []
                if (r.data && Array.isArray(r.data.results)) { rs = r.data.results }
                else if (Array.isArray(r.data)) rs = r.data
                rs.forEach(g => {
                    result.push({
                        title: g.description || '',
                        thumb: g.urls.thumb,
                        url: g.urls.full,
                        name: g.user && g.user.name ? g.user.name : lst('未知'),
                        link: `https://unsplash.com/@${g.user.username}?utm_source=wolai&utm_medium=referral`,
                    })
                });
                this.pics = result;
            } else if (this.props.type == GalleryType.pexels) {
                const client_id = '563492ad6f91700001000001fbc30b1e7c68484eb1f2a919eac36266';
                const client = createClient(client_id);
                var list = await client.photos.search({ query: this.word, per_page: size });
                var result = []
                if (list && Array.isArray((list as any).photos)) {
                    ; (list as any).photos.forEach(g => {
                        result.push({
                            title: '',
                            thumb: g.src.tiny,
                            url: g.src.original,
                            name: g.photographer || lst('未知') ,
                            link: g.photographer_url,
                        })
                    })
                }
                this.pics = result;
            }
            this.loading = false;
        }
        catch (ex) {
            this.error = lst('图片资源获取失败');
            this.pics = [];
        }
        if (this.isM)
            this.forceUpdate()
    }
    onmousedown(pic) {
        this.props.onChange(pic);
    }
    componentDidMount() {
        this.isM = true;
        this.onSearch(this.props.type == GalleryType.pexels ? "flowers" : 'dog');
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
        var origin = <a href="https://www.pexels.com/" target="_blank">Pexels</a>;
        if (this.props.type == GalleryType.unsplash)
            origin = <a href="https://www.unsplash.com/" target="_blank">Unsplash</a>;
        return <div className='shy-third-gallery'>
            <div className="shy-third-gallery-search"><Input value={this.word} onChange={e => this.word = e} onEnter={e => this.onSearch(e)} clear placeholder={ls.t('搜索图片')}></Input></div>
            <div className='shy-third-gallery-origin'>
                <Sp key={'请勿上传色情、涉政涉恐涉暴、侵权内容'}>请勿上传色情、涉政涉恐涉暴、侵权内容或<a target='_blank' className="link-red" href='https://shy.live/service_protocol'>服务条款</a>
                    中禁止上传的其它内容</Sp>
            </div>
            <div className='shy-third-gallery-content'>
                {this.loading == true && <div className='shy-third-gallery-loading'><Loading></Loading></div>}
                {this.loading == false && this.renderImages()}
                {this.error && this.pics.length == 0 && <div className='shy-third-gallery-error'><span><S>图片资源获取失败</S></span><a onClick={e => this.onSearch(this.word)}><S>重新尝试</S></a></div>}
            </div>
        </div>
    }
}