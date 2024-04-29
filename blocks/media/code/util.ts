export function getCodeMirrorLang(name:string){
    if(name=='sh')return 'shell'
    else if(name=='js')return 'javascript'
    else return name
}