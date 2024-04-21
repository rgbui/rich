import React from "react";
import { OuterPic } from "./declare";
import { GalleryPics } from "./store";



export class GalleryView extends React.Component<{ onChange: (image: OuterPic) => void }> {
    renderImages(pics) {
        return <div className='shy-gallery-pics'>{pics.map((pic, i) => {
            return <div className='shy-gallery-pic' key={i} onClick={e => this.props.onChange(pic)}>
                <div><img src={pic.thumb} /></div>
            </div>
        })}</div>
    }
    render() {
        return <div className='shy-gallery'>
            {GalleryPics().map(gp => {
                return <div className="shy-gallery-group" key={gp.group}>
                    <h3>{gp.group}</h3>
                    {this.renderImages(gp.childs)}
                </div>
            })}
        </div>
    }
}