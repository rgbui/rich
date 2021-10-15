


declare var MODE: 'production' | 'dev';
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