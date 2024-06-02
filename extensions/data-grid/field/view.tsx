
import {
    GetFieldTypeSvg,
    getSchemaFieldMenus
} from "../../../blocks/data-grid/schema/util";
export function getMenus() {
    function map(arr) {
        return arr.map(a => {
            return {
                text: a.text,
                value: a.value,
                icon: GetFieldTypeSvg({type:a.value} as any)
            }
        })
    }
    return getSchemaFieldMenus(map)
}


