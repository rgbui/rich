import lodash from "lodash";
import { Field } from "../../../blocks/data-grid/schema/field";
import { TableSchema } from "../../../blocks/data-grid/schema/meta";
import { Page } from "../../../src/page";
import { getRegisterFuns } from "./template";

export async function cacFormulaValue(page: Page, schema: TableSchema, field: Field, row: Record<string, any>) {
    try {
        if (field?.config?.formula?.jsCode) {
            var funCode = `async function(row,sys){ 
${schema.fields.map(r => { return `var ${r.name}=row.${r.name};` }).join("\n")}
return ${field.config.formula.jsCode}
                }`
            var fx = eval('(' + funCode + ')');
            var result = await fx.apply(row, [row, getRegisterFuns(page)])
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
