
// https://github.com/zemirco/json2csv
// https://github.com/DaoDeCyrus/CSV.js
/*
 * 参数：
 *    headers：表头
 *             格式如：
 *             [
 *               {
 *                  column:"userid", //列字段
 *                  title: "姓名", //表头标题
 *                  formatter:(value) =>{return ... }   //格式化函数  
 *                },
 *                ...
 *              ]
 *    
 *    rows：行
 *          格式如：[{userid:101,gender:0 },{userid:102,gender:1}]
 *    filename：导出保存的文件名
 */
export function exportCsv(headers, rows, filename: string) {
    if (Array.isArray(headers) && headers.length > 0) { //表头信息不能为空
        if (!filename || typeof filename != "string") {
            filename = "export.csv"
        }
        let blob = getCsvBlob(headers, rows);
        if ((navigator as any).msSaveOrOpenBlob) {
            (navigator as any).msSaveOrOpenBlob(blob, filename);
        } else {
            let url = URL.createObjectURL(blob);
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        }
    }
}

function getCsvBlob(headers, rows) {
    const BOM = '\uFEFF';
    let columnDelimiter = ','; //默认列分隔符','
    let rowDelimiter = '\r\n'; //默认行分隔符 '\r\n'
    let csv = headers.reduce((previous, header) => {
        return (previous ? previous + columnDelimiter : '') + (header.title || header.column);
    }, '');
    if (Array.isArray(rows) && rows.length > 0) {
        let columns = headers.map(header => header.column);
        csv = rows.reduce((previous, row) => {
            let rowCsv = columns.reduce((pre, column) => {
                if (row.hasOwnProperty(column)) {
                    let cell = row[column];
                    if (typeof cell != 'undefined') {
                        let header = headers.find(item => item.column == column);
                        if (typeof (header.formatter) == "function") {
                            cell = header.formatter(cell);
                        }
                        if (cell == null) cell = '';
                        if (typeof cell != 'undefined') {
                            cell = cell.toString().replace(new RegExp(rowDelimiter, 'g'), ' '); // 若数据中本来就含行分隔符，则用' '替换
                            cell = new RegExp(columnDelimiter).test(cell) ? `"${cell}"` : cell; //若数据中本来就含列分隔符，则用""包起来
                            return pre ? pre + columnDelimiter + cell : pre + cell;
                        }
                    }
                    return pre ? pre + columnDelimiter : pre + " ";//reduce初始值为''，故第一次迭代时不会在行首加列分隔符。后面的遇到值为空或不存在的列要填充含空格的空白" ",则pre返回true，会加列分隔符
                }
                else {
                    return pre ? pre + columnDelimiter : pre + " ";//即使不存在该列也要填充空白，避免数据和表头错位不对应
                }
            }, '');
            return previous + rowDelimiter + rowCsv;
        }, csv);
    }
    let blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    return blob;
}
