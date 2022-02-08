export enum StatusCode {
    Continue = 100,
    SwitchingProtocols = 101,
    /**
     * 服务器成功返回用户请求的数据，该操作是幂等的（Idempotent）。
     */
    Ok = 200,
    /**
     * 用户新建或修改数据成功。
     */
    Created = 201,
    /**
     * 表示一个请求已经进入后台排队（异步任务）
     */
    Acccepted = 202,
    NonAuthoritativeInfo = 203,
    /**
     * [DELETE]：用户删除数据成功。
     */
    NoContent = 204,
    ResetContent = 205,
    PartialContent = 206,
    MultipleChoices = 300,
    MovedPermanently = 301,
    Found = 302,
    SeeOther = 303,
    NotModified = 304,
    UseProxy = 305,
    TemporaryRedirect = 307,
    /**
     * [POST/PUT/PATCH]：用户发出的请求有错误，服务器没有进行新建或修改数据的操作，该操作是幂等的。
     */
    BadRequest = 400,
    /**
     * 表示用户没有权限（令牌、用户名、密码错误）。
     */
    Unauthorized = 401,
    PaymentRequired = 402,
    /**
     * 表示用户得到授权（与401错误相对），但是访问是被禁止的。
     */
    Forbidden = 403,
    /**
     * 用户发出的请求针对的是不存在的记录，服务器没有进行操作，该操作是幂等的。
     */
    NotFound = 404,
    MethodNotAllowed = 405,
    /**
     * 用户请求的格式不可得（比如用户请求JSON格式，但是只有XML格式）。
     */
    NotAcceptable = 406,
    ProxyAuthRequired = 407,
    RequestTimeout = 408,
    Conflict = 409,

    /**
    * 用户请求的资源被永久删除，且不会再得到的。
    */
    Gone = 410,
    LengthRequired = 411,
    PreconditionFailed = 412,
    RequestEntityTooLarge = 413,
    RequestURITooLong = 414,
    UnsupportedMediaType = 415,
    RequestedRangeNotSatisfiable = 416,
    ExpectationFailed = 417,
    Teapot = 418,
    /**
     * entity - [POST/PUT/PATCH] 当创建一个对象时，发生一个验证错误。
     */
    Unprocesable = 422,
    // See discussion at https://codereview.appspot.com/7678043/
    PreconditionRequired = 428,
    TooManyRequests = 429,
    RequestHeaderFieldsTooLarge = 431,
    /**
     * 服务器发生错误，用户将无法判断发出的请求是否成功。
     */
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
    HTTPVersionNotSupported = 505,  // New HTTP status codes from RFC 6585. Not exported yet in Go 1.1.
    NetworkAuthenticationRequired = 511,
}
