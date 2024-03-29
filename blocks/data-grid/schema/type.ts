
/**
 * 这里定义字段类型 
 * 但这个字段类型只是做为存储来用
 */
export enum FieldType {
    none = 0,
    any = 1,
    object = 2,
    array = 3,
    /**
     * 主键id
     */
    id = 100,
    /**标记是否是删除状态 */
    deleted = 101,
    /**
     * 标题，每条记录的标题
     */
    title = 150,
    icon = 151,
    description = 152,
    cover = 153,
    plain = 154,
    thumb = 155,
    /**
     * 自增（从1开始，每次自增加1)
     * 理论上用户可以自行修改（但新加时，则取当前列表中的最大值）
     */
    autoIncrement = 200,
    /**
     * 用于排序的字段，一般不会让用户看到，主要是确保视野上排序是稳定的。
     * 主要是确保在视野上的数据，位置不要随便跳动
     * 
     */
    sort = 201,
    /**
     * 日期类型
     */
    date = 300,
    /**
     * 数字类型
     */
    number = 400,
    price = 401,
    /**
     * 文本
     */
    text = 500,
    /**
     * 多行文本
     *  弃用
     */
    textarea = 501,
    /**
     * 弃用
     */
    paw = 505,
    /**
     * 邮件
     */
    email = 510,
    /**
     * 手机号（这里仅支持手机，主要来用来短信通知）
     */
    phone = 540,
    /**
     * 选项
     */
    option = 520,
    /**
     * 多选
     */
    options = 530,
    /**
     * 文件
     */
    file = 600,
    /**
     * 批量文件
     */
    image = 620,
    audio = 630,
    video = 640,
    /**
     * 用户
     */
    user = 700,
    /**
     * 创建人
     */
    creater = 800,
    /**
     * 创建时间
     */
    createDate = 810,
    /**
     * 修改人
     */
    modifyer = 820,
    /**
     * 修改时间
     */
    modifyDate = 830,
    modifyDynamic = 840,
    /**
     * 链接
     */
    link = 900,
    /**
     * 地理坐标（经纬度）
     * 一般存高德地图的坐标
     */
    geolocation = 1000,
    /**
     * 勾选，待办
     */
    bool = 1100,
    /**
     * 关联一对一
     * 例如课程  一般只有一位老师在教
     */
    relation = 1200,
    /**
     * 对关联的子表进行聚合，比如求和，求平均数
     */
    rollup = 1210,
    /**
     * 父数据ID,
     * 就是关联自身
     */
    parentId = 1300,
    subs = 1310,
    /**
     * guid字段
     * 弃用
     */
    guid = 1400,



    /**
     * 公式
     */
    formula = 5000,
    /**
     * 按钮
     */
    button = 6000,
    top = 6010,
    /**
     * 交互
     */
    emoji = 7000,
    comment = 7010,
    /**
 * 弃用
 */
    favourite = 7020,
    /**
     * 弃用
     */
    share = 7030,
    /**
 * 弃用
 */
    donate = 7040,
    /**
 * 弃用
 */
    buy = 7050,
    browse = 7060,
    /**
     * 喜欢
     */
    love = 7070,
    /**点赞 */
    like = 7071,
    /**
     * 投票
     * 
     */
    vote = 7072,
    /**
     * 反对
     */
    oppose = 7073,

    /**
     * 审批
     * 弃用
     */
    approve = 7080,

    /**
     * 举报
     * 弃用
     */
    report = 7090,


    /**
   * 文章
   * 弃用
   */
    blog = 8000,
    /**
     * 富文本
     * 弃用
     */
    rich = 9000,
}

/**
 * 系统字段
 */
export var SysFieldTypes: FieldType[] = [
    FieldType.createDate,
    FieldType.creater,
    FieldType.modifyer,
    FieldType.modifyDate,
    FieldType.cover,
    FieldType.icon,
    FieldType.title,
    FieldType.comment,
    FieldType.browse,
    FieldType.plain,
    FieldType.description,
    FieldType.thumb,
    FieldType.autoIncrement,
    FieldType.sort,
    FieldType.id,
    FieldType.deleted
]

/**
 * 只能创建一次性的字段
 * 不能创建多个
 */
export var OnlyFieldTypes: FieldType[] = [
    FieldType.modifyDate,
    FieldType.createDate,
    FieldType.creater,
    FieldType.cover,
    FieldType.icon,
    FieldType.title,
    FieldType.comment,
    FieldType.browse,
    FieldType.plain,
    FieldType.description,
    FieldType.thumb,
    FieldType.autoIncrement,
    FieldType.sort,
    FieldType.id,
    FieldType.deleted,
    FieldType.like,
    FieldType.oppose,
    FieldType.love,
    FieldType.parentId,
    FieldType.subs
]