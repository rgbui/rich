


declare var MODE: 'production' | 'dev';
type ArrayOf<T> = T extends (infer p)[] ? p : never;

type SvgrComponent = React.StatelessComponent<React.SVGAttributes<SVGElement>>

declare module '*.svg' {
  const content: SvgrComponent
  export default content
}

declare module '*.jpg';
declare module '*.png';
declare module '*.jpeg';
declare module '*.webp';