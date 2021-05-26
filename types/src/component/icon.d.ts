/// <reference types="react" />
export declare function Icon(props: {
    icon: string | SvgrComponent;
    click?: (e: MouseEvent) => void;
    mousedown?: (e: MouseEvent) => void;
    rotate?: number;
    size?: number | 'none';
    className?: string[] | string;
}): JSX.Element;
