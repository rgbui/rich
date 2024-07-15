import lodash from "lodash";
import { Field } from "../../../blocks/data-grid/schema/field";
import { Page } from "../../../src/page";
import { getRegisterFuns } from "./template";
import { FieldType } from "../../../blocks/data-grid/schema/type";
import { DataGridView } from "../../../blocks/data-grid/view/base";

export async function cacFormulaValue(page: Page, dataGrid: DataGridView, field: Field, row: Record<string, any>) {
    try {
        var schema = dataGrid.schema;
        if (field?.config?.formula?.jsCode) {
            var funCode = `async function(row,sys){ 
${schema.fields.map(r => {
                if (r.type == FieldType.option || r.type == FieldType.options) {
                    var ps: string[] = [];
                    ps.push(`var ${r.name}=sys.getOptionValue(row.${r.name},'${r.id}');`);
                    return ps.join('\n') + "\n";
                }
                else if (r.type == FieldType.relation || r.type == FieldType.rollup) {
                    var ps: string[] = [];
                    ps.push(`var ${r.name}=sys.getRollupValue('${r.id}');`);
                    return ps.join('\n') + "\n";
                }
                return `var ${r.name}=row.${r.name};`
            }).join("\n")}
return ${field.config.formula.jsCode}
                }`
            console.log(funCode, 'fcode');
            var fx = eval('(' + funCode + ')');
            var sysFuncs = getRegisterFuns(page);
            sysFuncs.getOptionValue = function (value: any, id: string) {
                var field = schema.fields.find(g => g.id == id);
                var ops = field?.config?.options || [];
                var op = ops.find(g => g.value == value);
                if (op) return op.text;
                else return '';
            }
            sysFuncs.getRollupValue = function (fieldId: string) {
                var field = schema.fields.find(g => g.id == fieldId);
                if (field) {
                    if (field.type == FieldType.relation) {
                        var value = row[field.name];
                        var vs = Array.isArray(value) ? value : (value ? [value] : []);
                        var rs = (dataGrid.relationDatas.get(field.config?.relationTableId) || []).filter(g => vs.includes(g.id));
                        
                        return rs.map(g => g.title);
                    }
                    else if (field.type == FieldType.rollup) {
                        var rf = schema.fields.find(g => g.id == field.config?.rollupRelationFieldId);
                        if (rf) {
                            var value = row[rf.name];
                            var vs = Array.isArray(value) ? value : (value ? [value] : []);
                            var rs = (dataGrid.relationDatas.get(rf.config?.relationTableId) || []).filter(g => vs.includes(g.id));
                            var rff = dataGrid.relationSchemas.find(g => g.id == rf.config?.relationTableId)?.fields.find(g => g.id == field.config?.rollupFieldId);
                            if (field.config?.rollupStatistic == 'origin') {
                                return rs.map(g => g[rff.name]);
                            }
                        }
                    }
                }
            }
            sysFuncs.prop = function (fieldText) {
                var field = schema.fields.find(g => g.text == fieldText);
                if (field) {
                    if ([FieldType.option, FieldType.options].includes(field.type)) {
                        return sysFuncs.getOptionValue(row[field.name], field.id);
                    }
                    else if ([FieldType.relation, FieldType.rollup].includes(field.type)) {
                        return sysFuncs.getRollupValue(field.id);
                    }
                    else {
                        return row[field.name];
                    }
                }
                else throw new Error('未找到字段:' + fieldText);
            }
            var result = await fx.apply(row, [row, sysFuncs])
            if (typeof result == 'undefined') result = ''
            else if (lodash.isNull(result)) result = ''
            else if (lodash.isNaN(result)) result = ''
            if (typeof result != 'string') result = result.toString();
            return result;
        }
        else return '';
    }
    catch (ex) {
        console.error(ex);
        return '';
    }
}
