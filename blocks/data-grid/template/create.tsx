import lodash from "lodash";
import { channel } from "../../../net/channel";
import { TableSchema } from "../schema/meta";
import { DataGridView } from "../view/base";
import { CardFactory } from "./card/factory/factory";
import { util } from "../../../util/util";
import { BlockRenderRange } from "../../../src/block/enum";
import { Block } from "../../../src/block";

export async function onCreateDataGridTemplate(
    text: string,
    block: Block,
    url: string,
    options?: {
        isOperator?: boolean
    }
) {
    var g = CardFactory.getCardModel(url);
    var vs = typeof g.createViews == 'function' ? await g.createViews() : lodash.cloneDeep(g.views || []);
    vs.forEach(v => {
        if (text)
            v.text = text + "-" + v.text;
    })
    if (!text) {
        text = vs[0].text;
    }
    var r = await channel.put('/schema/create/define', {
        text: text,
        fields: g.props.map(pro => {
            return {
                id: pro.name,
                text: pro.text,
                type: pro.types[0],
                config: lodash.cloneDeep(pro.config)
            }
        }),
        views: vs,
        datas: typeof g.createDataList == 'function' ? await g.createDataList() : lodash.cloneDeep(g.dataList || [])
    });
    if (r.ok) {
        var newDataGrid: Block;
        var schema = await TableSchema.cacheSchema(r.data.schema);
        await schema.cacPermissions();
        var autoCreateUrl = vs.find(c => c.autoCreate)?.url || schema.listViews.first().url;
        var view = schema.views.find(g => g.url == autoCreateUrl);
        var viewfields = schema.fields.findAll(c => g.props.some(pro => pro.types.includes(c.type))).map(c => schema.createViewField(c));

        var cb = async (newBlock) => {
            if (typeof g.blockViewHandle == 'function') await g.blockViewHandle(newBlock as DataGridView, g)
            else {
                var ps = g.props.toArray(pro => {
                    var f = schema.fields.find(x => x.text == pro.text && x.type == pro.types[0]);
                    if (!f) {
                        f = schema.fields.find(g => pro.types.includes(g.type));
                    }
                    if (f) {
                        return {
                            name: pro.name,
                            visible: true,
                            bindFieldIds: [f.id]
                        }
                    }
                })
                await newBlock.updateProps({
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
                }, BlockRenderRange.self);
            }
            if ((newBlock as DataGridView).dataGridTab) {
                await (newBlock as DataGridView).dataGridTab.updateTabItems((newBlock as DataGridView))
            }
            newDataGrid = newBlock;
        };
        if (options?.isOperator) {
            await block.page.replace(block, {
                url: view.url,
                schemaId: schema.id,
                syncBlockId: view.id,
                fields: viewfields,
            }, cb)
        }
        else await block.page.onReplace(block, {
            url: view.url,
            schemaId: schema.id,
            syncBlockId: view.id,
            fields: viewfields,
        }, cb)
        return { view, block: newDataGrid };
    }
}


var cacheDatas = new Map();

function clearDoc(d) {
    delete d.id;
    delete d.loadElementUrl;
    delete d.date;
    function cc(c) {
        delete c.id;
        delete c.locker;
        if (c?.pattern?.id) {
            delete c.pattern.id;
            delete c.pattern.date;
        }
        for (let b in c.blocks) {
            for (let i = 0; i < c.blocks[b].length; i++) {
                var bb = c.blocks[b][i];
                cc(bb);
            }
        }
    }
    d.views.forEach(c => {
        cc(c)
    })
}
export async function loadPageUrlData(filename: string) {

    var url = STATIC_URL + 'static/data-grid/template/datas/' + filename + ".json";
    var d = cacheDatas.get(url);
    if (!d) {
        d = (await util.getJson(url)).data;
        clearDoc(d);
        cacheDatas.set(url, d);
    }
    return JSON.stringify(d);
}