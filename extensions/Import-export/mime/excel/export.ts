

/**
 * https://github.com/SheetJS/sheetjs
 * 
 */




export async function exportExcel(headers, rows, filename: string) {
    const XLSX = await getXls();
    const wb = XLSX.utils.book_new();



    var rs = rows.map(r => {
        return headers.map(h => {
            return r[h.column]
        })
    })
    const ws = XLSX.utils.aoa_to_sheet([headers.map(h => h.title), ...rs]);
    XLSX.utils.book_append_sheet(wb, ws, filename);
    XLSX.writeFile(wb, filename + ".xlsx");
}
var _xls;
async function getXls() {
    if (_xls) return _xls;
    _xls = (await import(
        /* webpackChunkName: 'xlsx' */
        "./xlsx.full.min.js"
    ));
    return _xls;
    // console.log(d);
    // var XLSX = (await import("./xlsx.full.min.js")).XLSX;
    // console.log()
    // return XLSX;
}