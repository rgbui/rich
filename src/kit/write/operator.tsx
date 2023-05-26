import lodash from "lodash";
import { useCardSelector } from "../../../blocks/data-grid/template/card/selector/selector";
import { BlockSelectorItem } from "../../../extensions/block/delcare";
import { channel } from "../../../net/channel";
import { Block } from "../../block";
import { AppearAnchor } from "../../block/appear";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { DataGridView } from "../../../blocks/data-grid/view/base";

export async function useOperatorBlockData(blockData: BlockSelectorItem,
    aa: AppearAnchor,
    offset: number) {
    var newBlock: Block = null;
    if (blockData.operator == 'openDataGridTemplate')
    {
        var g = await useCardSelector({
            center: true,
            centerTop: 100
        });
        if (g)
        {
            var r = await channel.put('/schema/create/define', {
                text: g.title,
                fields: g.props.map(pro => {
                    return {
                        id: pro.name,
                        text: pro.text,
                        type: pro.types[0]
                    }
                }),
                views: lodash.cloneDeep(g.views || []),
                datas: lodash.cloneDeep(g.dataList || [])
            });
            if (r.ok) {
                var schema = await TableSchema.cacheSchema(r.data.schema);
                var autoCreateUrl = g.views.find(c => c.autoCreate)?.url || g.views[0].url;
                var view = schema.views.find(g => g.url == autoCreateUrl);
                if (view) {
                    newBlock = await aa.block.visibleDownCreateBlock(autoCreateUrl, {
                        ...{
                            schemaId: schema.id,
                            syncBlockId: view.id
                        },
                        createSource: 'InputBlockSelector'
                    });
                    if (typeof g.blockViewHandle == 'function') await g.blockViewHandle(newBlock as DataGridView, g)
                }
            }
        }
    }
    return newBlock;
}