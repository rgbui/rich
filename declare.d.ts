


declare var MODE: 'production' | 'dev';
type ArrayOf<T> = T extends (infer p)[] ? p : never;