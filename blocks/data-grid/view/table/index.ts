
import { prop, url } from "../../../../src/block/factory/observable";
import { DataGridView } from '../base';
import "./style.less";
import { FieldType } from "../../schema/type";
import lodash from "lodash";
import dayjs from "dayjs";
import { GroupIdType } from "../declare";

/***
 * 数据总共分三部分
 * 1. 数据源（调用第三方接口获取数据），编辑的数据源需要触发保存
 * 2. 表格的元数据信息（来源于全局的表格元数据信息)
 * 3. 表格的视图展示（具体到视图的展现,信息存在tableStore） 
 * 
 */
@url('/data-grid/table')
export class TableStore extends DataGridView {
    @prop()
    noBorder: boolean = false;
    @prop()
    noHead: boolean = false;
    @prop()
    statFields: { fieldId: string, stat: string }[] = [];
    statFieldsList: {
        error: string,
        loading: boolean,
        loaded: boolean,
        stats: {
            fieldId: string,
            stat: string,
            total?: number | Date,
            value: number | Date
        }[]
    } = {
            loading: false, loaded: false, error: '',
            stats: []
        }
    groupstatFieldsList: {
        error: string,
        loading: boolean,
        loaded: boolean,
        groupStats: {
            id: string,
            groupStats: {
                fieldId: string,
                stat: string,
                total?: number | Date,
                value: number | Date
            }[]
        }[]
    } = {
            loading: false,
            loaded: false,
            error: '',
            groupStats: []
        }
    onOver(isOver: boolean) {
        if (isOver == false && (this.view as any) && (this.view as any).isMoveLine == false && (this.view as any).subline) {
            (this.view as any).subline.style.display = 'none';
        }
        return super.onOver(isOver);
    }
    get sumWidth() {
        return this.fields.sum(c => c.colWidth) + (this.dataGridIsCanEdit() ? 40 : 0);
    }
    async loadDataGridData() {
        await this.loadData();
        await this.loadRelationDatas();
        await this.loadDataInteraction();
        await this.loadSchemaStats();
    }
    async loadSchemaStats() {
        if (this.statFields.length == 0) return;
        if (!this.schema) return;
        if (this.hasGroup) {
            this.groupstatFieldsList.loading = true;
            this.groupstatFieldsList.error = '';
            try {
                var groupFilters: {
                    id: GroupIdType;
                    filter: Record<string, any>;
                }[] = [];
                var groupView = this.groupView;
                this.dataGroupHeads.forEach(c => {
                    var gr = this.schema.fields.find(f => f.id == this.groupView.groupId);
                    var filter: Record<string, any> = {};
                    if ([FieldType.number, FieldType.autoIncrement, FieldType.price, FieldType.sort].includes(gr.type)) {
                        var cs = c.value as { min: number, max: number };
                        filter = { [gr.name]: lodash.isNull(c.value) ? null : { $gte: cs.min, $lt: cs.max } }
                    }
                    else if ([FieldType.creater, FieldType.user, FieldType.modifyer].includes(gr.type)) {
                        filter = { [gr.name]: lodash.isNull(c.value) ? null : { $in: [c.value] } }
                    }
                    else if ([FieldType.date, FieldType.createDate, FieldType.modifyDate].includes(gr.type)) {
                        if (lodash.isNull(c.value)) filter = { [gr.name]: null }
                        else {
                            var startDate: Date, endDate: Date;
                            if (groupView.by == 'year') {
                                startDate = dayjs(new Date(c.value as number, 0, 1)).startOf('year').toDate();
                                endDate = dayjs(new Date(c.value as number, 11, 31)).endOf('year').toDate();
                            }
                            else if (groupView.by == 'day') {
                                startDate = dayjs(c.value as string, 'YYYY-MM-DD').startOf('day').toDate();
                                endDate = dayjs(c.value as string, 'YYYY-MM-DD').endOf('day').toDate();
                            }
                            else if (groupView.by == 'week') {

                                var year = parseFloat((c.value as string).split('~')[0]);
                                var week = parseFloat((c.value as string).split('~')[1]);
                                startDate = (dayjs().year(year) as any).week(week + 1).startOf('week').toDate();
                                endDate = (dayjs().year(year) as any).week(week + 1).endOf('week').toDate();
                            }
                            else if (groupView.by == 'month') {
                                startDate = dayjs(c.value as string, 'YYYY-MM').startOf('month').toDate();
                                endDate = dayjs(c.value as string, 'YYYY-MM').endOf('month').toDate();
                            }
                            filter = {
                                [gr.name]: {
                                    $gte: startDate,
                                    $lte: endDate
                                }
                            }
                        }
                    }
                    else if ([FieldType.option, FieldType.options].includes(gr.type)) {
                        filter = { [gr.name]: lodash.isNull(c.value) ? null : { $in: [c.value] } }
                    }
                    groupFilters.push({ id: c.value, filter: filter });
                })
                var rs = await this.schema.statFields({ groupFilters, stats: this.statFields, filter: this.getSearchFilter() },
                    this.page.ws
                );
                if (rs.ok) {
                    this.groupstatFieldsList.groupStats = rs.data.groupStats as any;
                    this.groupstatFieldsList.loaded = true;
                    this.groupstatFieldsList.error = '';
                }
            }
            catch (ex) {
                this.groupstatFieldsList.error = '加载统计数据失败'
            }
            finally {
                this.groupstatFieldsList.loading = false;
            }
        }
        else {
            this.statFieldsList.loading = true;
            this.statFieldsList.error = '';
            try {
                var rs = await this.schema.statFields({ stats: this.statFields, filter: this.getSearchFilter() },
                    this.page.ws
                );
                this.statFieldsList.stats = rs.data.stats;
                this.statFieldsList.loaded = true;
                this.statFieldsList.error = '';
            }
            catch (ex) {
                this.statFieldsList.error = '加载统计数据失败'
            }
            finally {
                this.statFieldsList.loading = false;
            }
        }
    }
}


