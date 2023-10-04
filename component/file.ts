

var upload_file: HTMLInputElement;
var lastSelectFile;
/**
 * 批量选择多个文件
 * @param options 
 * @returns 
 */
export async function OpenMultipleFileDialoug(options?: {
    exts?: string[],
    maxSize?: number,
    accept?: string[]
}) {
    return new Promise((resolve: (files: File[]) => void, reject: () => void) => {
        if (typeof upload_file == 'undefined') {
            upload_file = document.body.appendChild(document.createElement('input'));
            upload_file.setAttribute('type', 'file');
            upload_file.style.position = 'absolute';
            upload_file.style.left = '-1000px';
            upload_file.style.top = '-1000px';
            // upload_file.style.display = 'none';
        }
        function selectFile(ev: Event) {
            lastSelectFile = undefined;
            upload_file.removeEventListener('change', selectFile);
            if (upload_file.files.length > 0) {
                resolve(Array.from(upload_file.files))
            }
            else resolve([]);
        }
        if (options && Array.isArray(options.exts) && options.exts.length > 0) {
            upload_file.setAttribute('accept', options.exts.join(','));
        }
        else upload_file.removeAttribute('accept');
        if (lastSelectFile) upload_file.removeEventListener('change', lastSelectFile);
        upload_file.addEventListener('change', selectFile);
        lastSelectFile = selectFile;
        //upload_file.dispatchEvent(new MouseEvent('click'))
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

/**
 * 通过图片的url来获取图片的大小
 * @param url 
 * @returns 
 */
export async function getImageSize(url: string) {
    var img = new Image();
    img.src = url;
    if (img.width > 0) {
        return { width: img.width, height: img.height }
    }
    return new Promise((resolve: (size: { width: number, height: number }) => void, reject) => {
        img.onload = (ev) => {
            resolve({ width: img.width, height: img.height })
        };
        img.onerror = (e) => {
            reject(e);
        }
    })
}

export async function getVideoSize(file: File | string) {
    return new Promise((resolve: (d: { duration: number, width: number, height: number }) => void) => {
        let videoElement = document.createElement("video")
        videoElement.src = typeof file == 'string' ? file : URL.createObjectURL(file)
        videoElement.addEventListener("loadedmetadata", function () {
            resolve({
                duration: videoElement.duration,
                height: videoElement.videoHeight,
                width: videoElement.videoWidth,
            })
        })
    })
}
