


export type SearchListType<T = any, G = {}> = {
    list: T[],
    lastDate?: Date,
    total: number,
    page?: number,
    size: number,
    loading?: boolean,
    word?: string,
    error?: string
} & G;

var cv: HTMLElement;
export function assyDiv() {
    if (!cv) {
        cv = document.createElement('div');
        cv.classList.add('shy-assy');
        document.body.appendChild(cv);
    }
    var div = document.createElement('div');
    cv.appendChild(div);
    return div;
}

export function assyDivPanel() {
    if (!cv) {
        cv = document.createElement('div');
        cv.classList.add('shy-assy');
        document.body.appendChild(cv);
    }
    return cv;
}