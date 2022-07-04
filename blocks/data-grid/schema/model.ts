
export class ModelMeta {
    id: string;
    createDate: number;
    text: string;
    schemas: { name: string, schemaId: string; }[] = [];
    fields: { name: string, schemaId: string; fieldId: string }[] = [];
}

/***
 * 
 * blog{ 
 *    text:string,
 *    schemas:[{name:'blog'}]
 *    fields:[{name:'title'},{name:'content'},{name:'creater'}],
 *    interactions:['like','comment','tags','reward'],
 *    actors:['host','creater','viewer']
 * }
 * 
 * ask{
 *    schemas:[{name:'question'},{name:'answer'}]
 *    fields:[
 *         {name:'question.title'},
 *         {name:'question.description'},
 *         {name:'question.creater'},
 *         {name:'answer.content'},
 *         {name:'answer.creater'}
 *     ]
 * }
 * 
 * task{
 *    schemas:[{name:'task'},{name:'process'}]
 *    fields:[
 *         {name:'task.title'},
 *         {name:'task.description'},
 *         {name:'task.creater'},
 *         {name:'task.priority'},
 *         {name:'task.handler'},
 *         {name:'task.status'},
 *         {name:'answer.content'},
 *         {name:'answer.creater'}
 *     ]
 * }
 * 
 */