declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}
declare var MODE: 'production' | 'dev';
type ArrayOf<T> = T extends (infer p)[] ? p : never;