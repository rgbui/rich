

var upload_file: HTMLInputElement;
/**
 * 批量选择多个文件
 * @param options 
 * @returns 
 */
export async function OpenMultipleFileDialoug(options?: {
    exts?: string[],
    maxSize?: number,
    accept?:string[]
}) {
    return new Promise((resolve: (files: File[]) => void, reject: () => void) => {
        if (typeof upload_file == 'undefined') {
            upload_file = document.body.appendChild(document.createElement('input'));
            upload_file.setAttribute('type', 'file');
        }
        function selectFile(ev: Event) {
            if (upload_file.files.length > 0) {
                resolve(Array.from(upload_file.files))
            }
            else resolve([]);
            upload_file.addEventListener('change', selectFile);
        }
        upload_file.addEventListener('change', selectFile);
        upload_file.click();
    })
}
/**
 * 只选择一个文件上传
 * @param options 
 * @returns 
 */
export async function OpenFileDialoug(options?: {
    exts?: string[],
    maxSize?: number
}) {
    var files = await OpenMultipleFileDialoug(options);
    if (files.length > 0) return files[0]
    else return null;
}
