



/**
 * 打包发布的版本
 * dev 开发版
 * beta 测试版（线上的）
 * pro 正式版
 */
declare var MODE: 'pro' | 'dev' | 'beta';
declare var ASSERT_URL: string;
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
declare module "*.ico";

declare module "*.json" {
  const file: any;
  export default file;
}


/**
 * 自动在HTMLElement上面申明一个接收拖放元素的函数
 */
interface HTMLElement {
  shy_drop_move?: (type: string, data: any, event: MouseEvent) => void;
  shy_drop_over?: (type: string, data: any, event: MouseEvent) => void;
  shy_end?: (event: MouseEvent) => void;
}

/**
 * 申明一个全局的toast ，主要是对一些通知进行报警
 */
interface Window {
  Toast: {
    error(msg: string);
    warn(msg: string);
    success(msg: string);
  },
  isAuth?: boolean,
  shyConfig?: {
    mode: 'pro' | 'dev' | 'beta' | 'desktop',
    isPro: boolean,
    isDomainWs: boolean,
    isBeta: boolean, 
    isUS?:boolean,
    isDev: boolean,
    version: string,
    isWeb: boolean,
    isPc: boolean,
    isMobile: boolean,
    isServerSide: boolean,
    platform: 'web' | 'desktop' | 'mobile' | "server-side",
    guid(): string,
    isOnline: boolean,
    isTestBeta: boolean,
    lang:  'Chinese' | 'English' | 'Japanese' | 'Korean' | 'German' | 'French' | 'Russian' | 'Italian' | 'Portuguese' | 'Spanish' | 'Dutch' | 'Arabic' | 'Indonesian';
  },
  shyLog: (...args: any[]) => void
}