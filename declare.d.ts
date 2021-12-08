


/**
 * 打包发布的版本
 * dev 开发版
 * beta 测试版（线上的）
 * pro 正式版
 */
declare var MODE: 'pro' | 'dev' | 'beta';
type ArrayOf<T> = T extends (infer p)[] ? p : never;

type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>

declare module '*.svg' {
  const content: SvgrComponent
  export default content
}

// for style loader
declare module '*.css' {
  const styles: any
  export = styles
}

declare module '*.jpg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.gif';

declare module "*.json" {
  const file: any;
  export default file;
}


/**
 * 自动在HTMLElement上面申明一个接收拖放元素的函数
 */
interface HTMLElement {
  shy_drop_move?: (type: string, data: any) => void;
  shy_drop_over?: (type: string, data: any) => void;
  shy_end?: () => void;
}