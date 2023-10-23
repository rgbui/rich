import lodash from "lodash";
import { useCardSelector } from "../../../blocks/data-grid/template/card/selector/selector";
import { BlockSelectorItem } from "../../../extensions/block/delcare";
import { channel } from "../../../net/channel";
import { AppearAnchor } from "../../block/appear";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { DataGridView } from "../../../blocks/data-grid/view/base";
import { Block } from "../../block";

export async function useOpenDataGridTemplate(
    blockData: BlockSelectorItem,
    aa: AppearAnchor,
    offset: number)
{
    var newBlock: Block;
    var g = await useCardSelector({
        center: true,
        centerTop: 100
    });
    if (g) {
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
            datas: typeof g.createDataList == 'function' ? await g.createDataList() : lodash.cloneDeep(g.dataList || [])
        });
        if (r.ok) {
            var schema = await TableSchema.cacheSchema(r.data.schema);
            var autoCreateUrl = g.views.find(c => c.autoCreate)?.url || g.views[0].url;
            var view = schema.views.find(g => g.url == autoCreateUrl);
            if (view) {
                aa.block.page.onAction('open', async () => {
                    newBlock = await aa.block.visibleDownCreateBlock(autoCreateUrl, {
                        ...{
                            schemaId: schema.id,
                            syncBlockId: view.id
                        },
                        createSource: 'InputBlockSelector'
                    });
                    await (newBlock as DataGridView).loadSchema();
                    var sch = (newBlock as DataGridView).schema;
                    (newBlock as DataGridView).fields = sch.fields.findAll(c => g.props.some(pro => pro.types.includes(c.type))).map(c => sch.createViewField(c));
                    if (typeof g.blockViewHandle == 'function') await g.blockViewHandle(newBlock as DataGridView, g)
                    else {
                        var ps = g.props.toArray(pro => {
                            var f = (newBlock as DataGridView).schema.fields.find(x => x.text == pro.text && x.type == pro.types[0]);
                            if (f) {
                                return {
                                    name: pro.name,
                                    visible: true,
                                    bindFieldId: f.id
                                }
                            }
                        })
                        await (newBlock as DataGridView).updateProps({
                            openRecordSource: 'page',
                            cardConfig: {
                                auto: false,
                                showCover: false,
                                coverFieldId: "",
                                coverAuto: false,
                                showMode: 'define',
                                templateProps: {
                                    url: g.url,
                                    props: ps
                                }
                            }
                        });
                    }
                });
            }
        }
    }

}