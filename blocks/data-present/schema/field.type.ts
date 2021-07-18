

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
    /**
     * 自增（从1开始，每次自增加1)
     * 理论上用户可以自行修改（但新加时，则取当前列表中的最大值）
     */
    autoIncrement = 200,
    /**
     * 用于排序的字段，一般不会让用户看到，主要是确保视野上排序是稳定的。
     * 主要是确保在视野上的数据，位置不要随便跳动
     * 有点不好处理，比如在两条数据中间插入一条数据，
     * 那么理论上当前的sort=(prev.sort+next.sort)/2.0
     * 这样就有可能会产生很长的小数sort，
     * 如果小数太长，是否考虑将处于一定范围内的小数（比如小数范围长度大于1的，
     * 在重新排序一下，按长度1重新计数，
     * 这样貌似更新的数据量没那么大，good idea
     * ）
     * 如果不这样，就全局更新排序，这太蛋疼了
     * 
     */
    sort = 201,
    /**
     * 日期类型
     */
    date = 300,
    /**
     * 日期范围
     */
    dateRange = 310,
    /**
     * 时长,还剩下多长时间了
     */
    timespan = 320,
    /**
     * 数字类型
     */
    number = 400,
    /**
     * 数字范围
     * 例如价格 800~900
     */
    numberRange = 410,
    /**
     * 整数
     */
    int = 430,
    /**
     * 整数范围
     * 及格 60~70
     */
    intRange = 440,
    /**
     * 文本
     */
    text = 500,
    /**
     * 多行文本
     */
    textarea = 501,
    /**
     * 加密的密码
     */
    paw = 502,
    /**
     * 长文本
     */
    longText = 510,
    /**
     * 邮件
     */
    email = 520,
    /**
     * 批量邮件
     */
    emails = 530,
    /**
     * 手机号（这里仅支持手机，主要来用来短信通知）
     */
    phone = 540,
    /**
     * 批量手机号
     */
    phones = 550,
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
    files = 610,
    /**
     * 批量文件
     */
    image = 620,
    /**
     * 图标（和图片有些区别，可以添加表情的这种）
     */
    icon = 621,
    /**
     * 批量图像
     */
    images = 630,
    /**
     * 用户
     */
    user = 700,
    /**
     * 用户群
     */
    users = 710,
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
    /**
     * 链接，收藏的
     */
    link = 900,
    links = 910,
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
    AssociativeOneToOne = 1200,
    /**
     * 该列显示关联一对一的某个子表的属性
     */
    AssociativeOneToOnePerspective = 1201,
    /**
     * 关联一对多
     * 列如课程 有多位学生在听
     */
    AssociativeOneToMany = 1210,
    /**
     *  该列显示关联一对多的某个子表的相关属性
     */
    AssociativeOneToManyPerspective = 1211,
    /**
     * 对关联的子表进行聚合，比如求和，求平均数
     */
    AssociativeOneToManyAggregate = 1212,
    /**
     * 父数据ID,
     * 就是关联自身
     */
    parentId = 1300,
    /**
     * guid字段
     */
    guid = 1400
}





