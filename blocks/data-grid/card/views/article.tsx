import React from "react";
import { autoImageUrl } from "../../../../net/element.type";
import { url, view } from "../../../../src/block/factory/observable";
import { BlockView } from "../../../../src/block/view";
import { ChildsArea } from "../../../../src/block/view/appear";
import { TableStoreGallery } from "../../view/gallery";
import { DataGridCard } from "../base";

@url('/data-grid/card/article')
export class CardArticle extends DataGridCard {

}
@view('/data-grid/card/article')
export class CardArticleView extends BlockView<CardArticle>{
    renderItems() {

        var ga=this.block.dataGrid as TableStoreGallery;
        var field = this.block.schema.fields.find(g => g.id == ga.cardConfig.coverFieldId);
        var imageData;
        if (field) imageData = this.block.dataRow[field.name];
        if (Array.isArray(imageData)) imageData = imageData[0];
        return <div className='sy-data-grid-item sy-data-grid-card'>
            <div className="sy-data-grid-card-cover">
                {imageData && <img style={{ maxHeight: ga.cardConfig.coverAuto ? "auto" : 200 }} src={autoImageUrl(imageData.url, 500)} />}
            </div>
            <div className="sy-data-grid-card-items">
                <ChildsArea childs={this.block.childs}></ChildsArea>
            </div>
        </div>
    }
}