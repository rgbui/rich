import { util } from "../../../util/util";


export type ShapeType = {
    name?: string,
    shape?: string,
    text?: string,
    svg?: Record<string, any>,
    src?: string,
    value?: string
}


export var ShapesList: ShapeType[] = [
    {
        name: '1',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2" d="M3 3h18v18H3z" />
        </svg>`,
        svg: { "viewBox": [3, 3, 18, 18], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [3, 3] }, { "point": [21, 3] }, { "point": [21, 21] }, { "point": [3, 21] }] }] }] }
    },
    {
        name: '2',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="nonzero" d="M7 4a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm0-2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" />
        </svg>`,
        svg: { "viewBox": [4, 4, 16, 16], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [7, 4], "handleOut": [5.34314575050762, 4] }, { "point": [4, 7], "handleIn": [4, 5.343145750507619] }, { "point": [4, 17], "handleOut": [4, 18.65685424949238] }, { "point": [7, 20], "handleIn": [5.343145750507619, 20] }, { "point": [17, 20], "handleOut": [18.65685424949238, 20] }, { "point": [20, 17], "handleIn": [20, 18.65685424949238] }, { "point": [20, 7], "handleOut": [20, 5.34314575050762] }, { "point": [17, 4], "handleIn": [18.65685424949238, 4] }] }] }] }
    },
    {
        name: '3',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2" />
        </svg>`,
        svg: { "viewBox": [3, 3, 18, 18], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [3, 12], "handleIn": [3, 16.970562748477143], "handleOut": [3, 7.029437251522858] }, { "point": [12, 3], "handleIn": [7.029437251522858, 3], "handleOut": [16.970562748477143, 3] }, { "point": [21, 12], "handleIn": [21, 7.029437251522858], "handleOut": [21, 16.970562748477143] }, { "point": [12, 21], "handleIn": [16.970562748477143, 21], "handleOut": [7.029437251522858, 21] }] }] }] }
    },
    {
        name: '4',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="nonzero"
                d="M12 4.922L4.197 19h15.606L12 4.922zm.875-2.58l9.484 17.175A1 1 0 0 1 21.484 21H2.516a1 1 0 0 1-.875-1.483l9.483-17.175a1 1 0 0 1 1.751 0z" />
        </svg>`,
        svg: { "viewBox": [4.197, 4.922, 15.606000000000002, 14.078], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [12, 4.922] }, { "point": [4.197, 19] }, { "point": [19.803, 19] }] }] }] }
    },
    {
        name: '5',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="nonzero" d="M13.073 19l-4.646 3.65A1.5 1.5 0 0 1 6 21.472V19a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5h12a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-4.927zM8 20.443L12.381 17H18a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h2v3.443z" />
        </svg>`,
        svg: { "viewBox": [1, 2, 22, 20.970745765831253], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [13.073, 19] }, { "point": [8.427, 22.65], "handleOut": [7.97568180822469, 23.004773179256198] }, { "point": [6.845016302357559, 22.82017651458252], "handleIn": [7.361462895727626, 23.07084568927965], "handleOut": [6.328569708987492, 22.569507339885387] }, { "point": [6, 21.472], "handleIn": [6.00048478937054, 22.046066097175366] }, { "point": [6, 19], "handleOut": [3.2385762508460334, 19] }, { "point": [1, 14], "handleIn": [1, 16.761423749153966] }, { "point": [1, 7], "handleOut": [1, 4.238576250846034] }, { "point": [6, 2], "handleIn": [3.238576250846033, 2] }, { "point": [18, 2], "handleOut": [20.761423749153966, 2] }, { "point": [23, 7], "handleIn": [23, 4.238576250846033] }, { "point": [23, 14], "handleOut": [23, 16.761423749153966] }, { "point": [18, 19], "handleIn": [20.761423749153966, 19] }] }] }] }
    },
    {
        name: '6',
        shape: ` <svg viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor"
            d="M11.9999 2.61691L2.61691 11.9999L11.9999 21.3829L21.3829 11.9999L11.9999 2.61691ZM12.7069 0.495911L23.5039 11.2929C23.6914 11.4804 23.7967 11.7347 23.7967 11.9999C23.7967 12.2651 23.6914 12.5194 23.5039 12.7069L12.7069 23.5039C12.5194 23.6914 12.2651 23.7967 11.9999 23.7967C11.7347 23.7967 11.4804 23.6914 11.2929 23.5039L0.495911 12.7069C0.30844 12.5194 0.203125 12.2651 0.203125 11.9999C0.203125 11.7347 0.30844 11.4804 0.495911 11.2929L11.2929 0.495911C11.4804 0.30844 11.7347 0.203125 11.9999 0.203125C12.2651 0.203125 12.5194 0.30844 12.7069 0.495911V0.495911Z">
        </path>
    </svg>`,
        svg: { "viewBox": [2.61691, 2.61691, 18.76599, 18.76599], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [11.9999, 2.61691] }, { "point": [2.61691, 11.9999] }, { "point": [11.9999, 21.3829] }, { "point": [21.3829, 11.9999] }] }] }] }
    },
    {
        name: '7',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="nonzero" d="M6.463 5L2.544 19h14.993l3.919-14H6.463zm-.758-2h17.07a1 1 0 0 1 .962 1.27l-4.479 16a1 1 0 0 1-.963.73H1.225a1 1 0 0 1-.962-1.27l4.479-16A1 1 0 0 1 5.705 3z" />
        </svg>`,
        svg: { "viewBox": [2.544, 5, 18.912, 14], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [6.463, 5] }, { "point": [2.544, 19] }, { "point": [17.537, 19] }, { "point": [21.456, 5] }] }] }] }
    },
    {
        name: '8',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" fill-rule="nonzero"
      d="M16.985 19.501l-.952-5.55 4.033-3.932-5.574-.81L12 4.16l-2.492 5.05-5.574.81 4.033 3.931-.952 5.551L12 16.881l4.985 2.62zM12 19.14l-5.704 2.999A1.08 1.08 0 0 1 4.729 21l1.09-6.351-4.616-4.499a1.08 1.08 0 0 1 .599-1.842l6.377-.927 2.853-5.779a1.08 1.08 0 0 1 1.936 0l2.853 5.78 6.377.926a1.08 1.08 0 0 1 .599 1.842l-4.615 4.499L19.272 21a1.08 1.08 0 0 1-1.568 1.139l-5.704-3z"/>
</svg>`,
        svg: { "viewBox": [3.9339999999999993, 4.16, 16.132000000000005, 15.342000000000002], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [16.985, 19.501] }, { "point": [16.033, 13.951] }, { "point": [20.066000000000003, 10.019] }, { "point": [14.492000000000003, 9.209] }, { "point": [12, 4.16] }, { "point": [9.508, 9.21] }, { "point": [3.9339999999999993, 10.020000000000001] }, { "point": [7.967, 13.951] }, { "point": [7.015, 19.502000000000002] }, { "point": [12, 16.881] }] }] }] }
    },
    {
        name: '9',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path fill="currentColor" fill-rule="nonzero"
                d="M13 4.828V8H4v8h9v3.172L21.172 12 13 4.828zM3 6h8V2.284a1 1 0 0 1 1.678-.735L24 12 12.678 22.45A1 1 0 0 1 11 21.717V18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
        </svg>`,
        svg: { "viewBox": [4, 4.828, 17.172, 14.344000000000001], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [13, 4.828] }, { "point": [13, 8] }, { "point": [4, 8] }, { "point": [4, 16] }, { "point": [13, 16] }, { "point": [13, 19.172] }, { "point": [21.172, 12] }] }] }] }
    },
    {
        name: '10',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path data-stroke-as-fill-style="placeholder" fill="black" d="M11 4.82812V8.00012H20V16.0001H11V19.1721L2.828 12.0001L11 4.82812ZM21 6.00012H13V2.28412C13 2.08978 12.9433 1.89965 12.837 1.73699C12.7307 1.57432 12.5792 1.44617 12.4012 1.3682C12.2232 1.29023 12.0263 1.26581 11.8347 1.29794C11.643 1.33007 11.4649 1.41736 11.322 1.54912L0 12.0001L11.322 22.4501C11.4647 22.5818 11.6427 22.669 11.8342 22.7012C12.0257 22.7334 12.2224 22.7092 12.4003 22.6314C12.5782 22.5537 12.7297 22.4259 12.8362 22.2635C12.9427 22.1011 12.9996 21.9113 13 21.7171V18.0001H21C21.2652 18.0001 21.5196 17.8948 21.7071 17.7072C21.8946 17.5197 22 17.2653 22 17.0001V7.00012C22 6.7349 21.8946 6.48055 21.7071 6.29301C21.5196 6.10548 21.2652 6.00012 21 6.00012Z"></path>
        </svg>`,
        svg: { "viewBox": [2.828, 4.82812, 17.172, 14.34398], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [11, 4.82812] }, { "point": [11, 8.00012] }, { "point": [20, 8.00012] }, { "point": [20, 16.0001] }, { "point": [11, 16.0001] }, { "point": [11, 19.1721] }, { "point": [2.828, 12.0001] }] }] }] }
    },
    {
        name: '11',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path data-stroke-style="placeholder" stroke-width="2" stroke="black" d="M22.5861 12.0001L15.0001 4.41406V9.00006H9.00006V4.41406L1.41406 12.0001L9.00006 19.5861V15.0001H15.0001V19.5861L22.5861 12.0001Z"></path>
        </svg>`,
        svg: { "viewBox": [1.41406, 4.41406, 21.17204, 15.172039999999999], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [22.5861, 12.0001] }, { "point": [15.0001, 4.41406] }, { "point": [15.0001, 9.00006] }, { "point": [9.00006, 9.00006] }, { "point": [9.00006, 4.41406] }, { "point": [1.41406, 12.0001] }, { "point": [9.00006, 19.5861] }, { "point": [9.00006, 15.0001] }, { "point": [15.0001, 15.0001] }, { "point": [15.0001, 19.5861] }] }] }] }
    },
    {
        name: '12',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path data-stroke-as-fill-style="placeholder" fill="black" d="M11.9763 3.27998L3.18528 10.332L6.70028 20H17.3003L20.8153 10.334L11.9753 3.28098L11.9763 3.27998ZM22.9403 10.342L18.9403 21.342C18.8701 21.5349 18.7422 21.7015 18.574 21.8192C18.4059 21.9369 18.2056 22 18.0003 22H6.00028C5.79501 22 5.59469 21.9369 5.42652 21.8192C5.25835 21.7015 5.13049 21.5349 5.06028 21.342L1.06028 10.342C0.988823 10.1456 0.980681 9.93177 1.037 9.73052C1.09332 9.52928 1.21127 9.35074 1.37428 9.21998L11.3493 1.21998C11.5263 1.07794 11.7464 1.00036 11.9734 1C12.2004 0.999638 12.4208 1.07651 12.5983 1.21798L22.6243 9.21798C22.7881 9.34862 22.9067 9.5274 22.9634 9.72907C23.0201 9.93075 23.012 10.1451 22.9403 10.342V10.342Z"></path>
        </svg>`,
        svg: { "viewBox": [3.18528, 3.27998, 17.630020000000002, 16.720019999999998], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [11.9763, 3.27998] }, { "point": [3.18528, 10.332] }, { "point": [6.70028, 20] }, { "point": [17.3003, 20] }, { "point": [20.8153, 10.334] }, { "point": [11.9753, 3.28098] }] }] }] }
    },
    {
        name: '13',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
       <path data-stroke-as-fill-style="placeholder" fill="black" d="M15.172 4H8.828L4 8.828V15.172L8.828 20H15.172L20 15.172V8.828L15.172 4ZM16.292 2.293L21.707 7.707C21.8946 7.89449 21.9999 8.1488 22 8.414V15.586C21.9999 15.8512 21.8946 16.1055 21.707 16.293L16.293 21.707C16.1055 21.8946 15.8512 21.9999 15.586 22H8.414C8.1488 21.9999 7.89449 21.8946 7.707 21.707L2.293 16.293C2.10545 16.1055 2.00006 15.8512 2 15.586V8.414C2.00006 8.1488 2.10545 7.89449 2.293 7.707L7.707 2.293C7.89449 2.10545 8.1488 2.00006 8.414 2H15.586C15.8512 2.00006 16.1055 2.10545 16.293 2.293H16.292Z"></path>
        </svg>`,
        svg: { "viewBox": [4, 4, 16, 16], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [15.172, 4] }, { "point": [8.828, 4] }, { "point": [4, 8.828] }, { "point": [4, 15.172] }, { "point": [8.828, 20] }, { "point": [15.172, 20] }, { "point": [20, 15.172] }, { "point": [20, 8.828] }] }] }] }
    },
    {
        name: '14',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
      <path data-stroke-as-fill-style="placeholder" fill="black" d="M16.8175 4H7.18345L2.78345 12L7.18345 20H16.8175L21.2175 12L16.8175 4ZM18.2855 2.518L23.2355 11.518C23.3167 11.6657 23.3593 11.8315 23.3593 12C23.3593 12.1685 23.3167 12.3343 23.2355 12.482L18.2855 21.482C18.1992 21.6388 18.0724 21.7697 17.9183 21.8608C17.7642 21.9519 17.5885 22 17.4095 22H6.59045C6.41144 22 6.23572 21.9519 6.08163 21.8608C5.92754 21.7697 5.80074 21.6388 5.71445 21.482L0.764454 12.482C0.68322 12.3343 0.640625 12.1685 0.640625 12C0.640625 11.8315 0.68322 11.6657 0.764454 11.518L5.71445 2.518C5.80082 2.36101 5.92778 2.2301 6.08206 2.13898C6.23634 2.04785 6.41227 1.99985 6.59145 2H17.4105C17.5895 2.00003 17.7652 2.04811 17.9193 2.13923C18.0734 2.23035 18.2002 2.36115 18.2865 2.518H18.2855Z"></path>
        </svg>`,
        svg: { "viewBox": [2.78345, 4, 18.43405, 16], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [16.8175, 4] }, { "point": [7.18345, 4] }, { "point": [2.78345, 12] }, { "point": [7.18345, 20] }, { "point": [16.8175, 20] }, { "point": [21.2175, 12] }] }] }] }
    },
    {
        name: '15',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
      <path data-stroke-as-fill-style="placeholder" fill="black" d="M3 3H21C21.2652 3 21.5196 3.10536 21.7071 3.29289C21.8946 3.48043 22 3.73478 22 4V20C22 20.2652 21.8946 20.5196 21.7071 20.7071C21.5196 20.8946 21.2652 21 21 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V4C2 3.73478 2.10536 3.48043 2.29289 3.29289C2.48043 3.10536 2.73478 3 3 3V3ZM16 5H8V19H16V5ZM18 5V19H20V5H18ZM6 5H4V19H6V5Z"></path>
        </svg>`,
        svg: { "childs": [{ "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [3, 3] }, { "point": [21, 3], "handleOut": [21.2652, 3] }, { "point": [21.7071, 3.29289], "handleIn": [21.5196, 3.10536], "handleOut": [21.8946, 3.48043] }, { "point": [22, 4], "handleIn": [22, 3.73478] }, { "point": [22, 20], "handleOut": [22, 20.2652] }, { "point": [21.7071, 20.7071], "handleIn": [21.8946, 20.5196], "handleOut": [21.5196, 20.8946] }, { "point": [21, 21], "handleIn": [21.2652, 21] }, { "point": [3, 21], "handleOut": [2.73478, 21] }, { "point": [2.29289, 20.7071], "handleIn": [2.48043, 20.8946], "handleOut": [2.10536, 20.5196] }, { "point": [2, 20], "handleIn": [2, 20.2652] }, { "point": [2, 4], "handleOut": [2, 3.73478] }, { "point": [2.29289, 3.29289], "handleIn": [2.10536, 3.48043], "handleOut": [2.48043, 3.10536] }, { "point": [3, 3], "handleIn": [2.73478, 3] }] }, { "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [16, 5] }, { "point": [8, 5] }, { "point": [8, 19] }, { "point": [16, 19] }] }, { "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [18, 5] }, { "point": [18, 19] }, { "point": [20, 19] }, { "point": [20, 5] }] }, { "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [6, 5] }, { "point": [4, 5] }, { "point": [4, 19] }, { "point": [6, 19] }] }] }
    },
    {
        name: '16',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
       <path data-stroke-as-fill-style="placeholder" fill="black" d="M6.64987 3.97998L3.44986 19.97H20.5609L17.3609 3.97998H6.65087H6.64987ZM5.82986 1.97998H18.1809C18.412 1.98012 18.6359 2.06029 18.8145 2.20687C18.9932 2.35344 19.1156 2.55737 19.1609 2.78398L22.7609 20.774C22.7899 20.919 22.7863 21.0686 22.7505 21.2121C22.7147 21.3556 22.6475 21.4894 22.5538 21.6038C22.46 21.7182 22.3421 21.8104 22.2084 21.8737C22.0748 21.937 21.9288 21.9699 21.7809 21.97H2.23086C2.08289 21.97 1.93675 21.9373 1.80297 21.874C1.6692 21.8107 1.55113 21.7186 1.45729 21.6042C1.36345 21.4898 1.29616 21.3559 1.26029 21.2124C1.22442 21.0688 1.22086 20.9191 1.24986 20.774L4.84986 2.78398C4.89516 2.55737 5.01754 2.35344 5.1962 2.20687C5.37486 2.06029 5.59877 1.98012 5.82986 1.97998V1.97998Z"></path>
        </svg>`,
        svg: { "viewBox": [3.44986, 3.97998, 17.11104, 15.99002], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [6.64987, 3.97998] }, { "point": [3.44986, 19.97] }, { "point": [20.5609, 19.97] }, { "point": [17.3609, 3.97998] }, { "point": [6.65087, 3.97998] }] }] }] }
    },
    {
        name: '17',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
           <path data-stroke-as-fill-style="placeholder" fill="black" d="M11.358 4.095C10.766 4.095 10.201 4.439 9.846 5.04L8.96 6.543L7.322 5.943C7.23489 5.91101 7.14279 5.89476 7.05 5.895C6.529 5.895 6.029 6.441 6.029 7.2C6.029 7.264 6.032 7.327 6.039 7.39L6.275 9.423L4.247 9.705C3.631 9.791 3.095 10.449 3.095 11.3C3.095 11.966 3.428 12.533 3.893 12.78L5.487 13.622L4.892 15.323C4.79395 15.605 4.74425 15.9015 4.745 16.2C4.745 17.512 5.655 18.505 6.683 18.505C6.969 18.505 7.243 18.432 7.499 18.289L9.309 17.276L10.339 19.076C10.643 19.605 11.129 19.905 11.633 19.905C12.099 19.905 12.546 19.651 12.854 19.193L14.05 17.411L15.802 18.649C16.042 18.819 16.307 18.905 16.583 18.905C17.409 18.905 18.155 18.091 18.155 17L18.154 16.939L18.117 15.51L19.432 14.954C20.289 14.592 20.905 13.629 20.905 12.5C20.905 11.282 20.188 10.266 19.244 9.977L17.571 9.467L17.775 7.73C17.784 7.655 17.788 7.578 17.788 7.5C17.788 6.575 17.165 5.895 16.492 5.895C16.294 5.895 16.105 5.95 15.928 6.058L13.968 7.258L12.954 5.195C12.614 4.504 12.002 4.095 11.358 4.095V4.095ZM14.594 20.361L14.484 20.515C13.812 21.421 12.784 22 11.634 22C10.321 22 9.17 21.248 8.522 20.117C7.96071 20.4334 7.32733 20.5997 6.683 20.6C4.456 20.6 2.65 18.63 2.65 16.2C2.65 15.647 2.743 15.119 2.914 14.631C1.78 14.032 1 12.766 1 11.3C1 9.417 2.29 7.862 3.958 7.63C3.94142 7.48727 3.93307 7.34369 3.933 7.2C3.933 5.322 5.329 3.8 7.05 3.8C7.397 3.8 7.73 3.862 8.042 3.976C8.742 2.787 9.966 2 11.358 2C12.59 2 13.689 2.616 14.412 3.581L14.834 4.271L15.376 4.005C15.726 3.872 16.101 3.8 16.492 3.8C18.365 3.8 19.883 5.457 19.883 7.5C19.883 7.66 19.874 7.819 19.856 7.974C21.67 8.528 23 10.344 23 12.5C23 14.497 21.858 16.203 20.248 16.884L20.25 17C20.25 19.21 18.608 21 16.583 21C15.9283 20.9991 15.2876 20.8103 14.737 20.456L14.594 20.361V20.361Z"></path>
     </svg>`,
        svg: { "viewBox": [3.095, 4.095, 17.810000000000002, 15.810000000000002], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [11.358, 4.095], "handleOut": [10.766, 4.095] }, { "point": [9.846, 5.04], "handleIn": [10.201, 4.439] }, { "point": [8.96, 6.543] }, { "point": [7.322, 5.943], "handleOut": [7.23489, 5.91101] }, { "point": [7.05, 5.895], "handleIn": [7.14279, 5.89476], "handleOut": [6.529, 5.895] }, { "point": [6.029, 7.2], "handleIn": [6.029, 6.441], "handleOut": [6.029, 7.264] }, { "point": [6.039, 7.39], "handleIn": [6.032, 7.327] }, { "point": [6.275, 9.423] }, { "point": [4.247, 9.705], "handleOut": [3.631, 9.791] }, { "point": [3.095, 11.3], "handleIn": [3.095, 10.449], "handleOut": [3.095, 11.966] }, { "point": [3.893, 12.78], "handleIn": [3.428, 12.533] }, { "point": [5.487, 13.622] }, { "point": [4.892, 15.323], "handleOut": [4.79395, 15.605] }, { "point": [4.745, 16.2], "handleIn": [4.74425, 15.9015], "handleOut": [4.745, 17.512] }, { "point": [6.683, 18.505], "handleIn": [5.655, 18.505], "handleOut": [6.969, 18.505] }, { "point": [7.499, 18.289], "handleIn": [7.243, 18.432] }, { "point": [9.309, 17.276] }, { "point": [10.339, 19.076], "handleOut": [10.643, 19.605] }, { "point": [11.633, 19.905], "handleIn": [11.129, 19.905], "handleOut": [12.099, 19.905] }, { "point": [12.854, 19.193], "handleIn": [12.546, 19.651] }, { "point": [14.05, 17.411] }, { "point": [15.802, 18.649], "handleOut": [16.042, 18.819] }, { "point": [16.583, 18.905], "handleIn": [16.307, 18.905], "handleOut": [17.409, 18.905] }, { "point": [18.155, 17], "handleIn": [18.155, 18.091] }, { "point": [18.154, 16.939] }, { "point": [18.117, 15.51] }, { "point": [19.432, 14.954], "handleOut": [20.289, 14.592] }, { "point": [20.905, 12.5], "handleIn": [20.905, 13.629], "handleOut": [20.905, 11.282] }, { "point": [19.244, 9.977], "handleIn": [20.188, 10.266] }, { "point": [17.571, 9.467] }, { "point": [17.775, 7.73], "handleOut": [17.784, 7.655] }, { "point": [17.788, 7.5], "handleIn": [17.788, 7.578], "handleOut": [17.788, 6.575] }, { "point": [16.492, 5.895], "handleIn": [17.165, 5.895], "handleOut": [16.294, 5.895] }, { "point": [15.928, 6.058], "handleIn": [16.105, 5.95] }, { "point": [13.968, 7.258] }, { "point": [12.954, 5.195], "handleOut": [12.614, 4.504] }, { "point": [11.358, 4.095], "handleIn": [12.002, 4.095] }] }] }] }
    },
    {
        name: '18',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
   <path data-stroke-as-fill-style="placeholder" fill="black" d="M15 4H9V9H4V15H9V20H15V15H20V9H15V4ZM17 7H21C21.2652 7 21.5196 7.10536 21.7071 7.29289C21.8946 7.48043 22 7.73478 22 8V16C22 16.2652 21.8946 16.5196 21.7071 16.7071C21.5196 16.8946 21.2652 17 21 17H17V21C17 21.2652 16.8946 21.5196 16.7071 21.7071C16.5196 21.8946 16.2652 22 16 22H8C7.73478 22 7.48043 21.8946 7.29289 21.7071C7.10536 21.5196 7 21.2652 7 21V17H3C2.73478 17 2.48043 16.8946 2.29289 16.7071C2.10536 16.5196 2 16.2652 2 16V8C2 7.73478 2.10536 7.48043 2.29289 7.29289C2.48043 7.10536 2.73478 7 3 7H7V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H16C16.2652 2 16.5196 2.10536 16.7071 2.29289C16.8946 2.48043 17 2.73478 17 3V7Z"></path>
    </svg>`,
        svg: { "viewBox": [4, 4, 16, 16], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [15, 4] }, { "point": [9, 4] }, { "point": [9, 9] }, { "point": [4, 9] }, { "point": [4, 15] }, { "point": [9, 15] }, { "point": [9, 20] }, { "point": [15, 20] }, { "point": [15, 15] }, { "point": [20, 15] }, { "point": [20, 9] }, { "point": [15, 9] }] }] }] }
    },
    {
        name: '19',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
    <path data-stroke-as-fill-style="placeholder" fill="black" d="M2 4.245C2 3.005 6.477 2 12 2C17.523 2 22 3.005 22 4.245V18.755C22 19.995 17.523 21 12 21C6.477 21 2 19.995 2 18.755V4.245ZM4 7.15V17.99C4.332 18.123 4.797 18.263 5.367 18.391C7.075 18.774 9.45 19 12 19C14.55 19 16.925 18.774 18.633 18.391C19.0984 18.2932 19.5555 18.1591 20 17.99V7.15C18.021 7.719 15.207 8 12 8C8.793 8 5.979 7.719 4 7.15ZM4 5.054C4.327 5.164 4.713 5.269 5.148 5.367C6.934 5.767 9.381 6 12 6C14.619 6 17.066 5.768 18.852 5.367C19.287 5.269 19.672 5.163 20 5.054V5.01C19.5555 4.84054 19.0985 4.70613 18.633 4.608C16.925 4.226 14.55 4 12 4C9.45 4 7.075 4.226 5.367 4.609C4.90157 4.70681 4.44451 4.84088 4 5.01V5.053V5.054Z"></path>
    </svg>`,
        svg: { "childs": [{ "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [2, 4.245], "handleOut": [2, 3.005] }, { "point": [12, 2], "handleIn": [6.477, 2], "handleOut": [17.523, 2] }, { "point": [22, 4.245], "handleIn": [22, 3.005] }, { "point": [22, 18.755], "handleOut": [22, 19.995] }, { "point": [12, 21], "handleIn": [17.523, 21], "handleOut": [6.477, 21] }, { "point": [2, 18.755], "handleIn": [2, 19.995] }] }, { "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [4, 7.15], "handleIn": [5.979, 7.719] }, { "point": [4, 17.99], "handleOut": [4.332, 18.123] }, { "point": [5.367, 18.391], "handleIn": [4.797, 18.263], "handleOut": [7.075, 18.774] }, { "point": [12, 19], "handleIn": [9.45, 19], "handleOut": [14.55, 19] }, { "point": [18.633, 18.391], "handleIn": [16.925, 18.774], "handleOut": [19.0984, 18.2932] }, { "point": [20, 17.99], "handleIn": [19.5555, 18.1591] }, { "point": [20, 7.15], "handleOut": [18.021, 7.719] }, { "point": [12, 8], "handleIn": [15.207, 8], "handleOut": [8.793, 8] }] }, { "name": "path", "closed": true, "stroke": null, "segments": [{ "point": [4, 5.054], "handleOut": [4.327, 5.164] }, { "point": [5.148, 5.367], "handleIn": [4.713, 5.269], "handleOut": [6.934, 5.767] }, { "point": [12, 6], "handleIn": [9.381, 6], "handleOut": [14.619, 6] }, { "point": [18.852, 5.367], "handleIn": [17.066, 5.768], "handleOut": [19.287, 5.269] }, { "point": [20, 5.054], "handleIn": [19.672, 5.163] }, { "point": [20, 5.01], "handleOut": [19.5555, 4.84054] }, { "point": [18.633, 4.608], "handleIn": [19.0985, 4.70613], "handleOut": [16.925, 4.226] }, { "point": [12, 4], "handleIn": [14.55, 4], "handleOut": [9.45, 4] }, { "point": [5.367, 4.609], "handleIn": [7.075, 4.226], "handleOut": [4.90157, 4.70681] }, { "point": [4, 5.01], "handleIn": [4.44451, 4.84088] }, { "point": [4, 5.053] }] }] }
    },
    {
        name: '20',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path data-stroke-as-fill-style="placeholder" fill="black" d="M11 12C12.215 12.912 13 14.364 13 16V19C13 19.5304 13.2107 20.0391 13.5858 20.4142C13.9609 20.7893 14.4696 21 15 21H16C16.2652 21 16.5196 21.1054 16.7071 21.2929C16.8946 21.4804 17 21.7348 17 22C17 22.2652 16.8946 22.5196 16.7071 22.7071C16.5196 22.8946 16.2652 23 16 23H15C13.9391 23 12.9217 22.5786 12.1716 21.8284C11.4214 21.0783 11 20.0609 11 19V16C11 15.2044 10.6839 14.4413 10.1213 13.8787C9.55871 13.3161 8.79565 13 8 13C7.73478 13 7.48043 12.8946 7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929C7.48043 11.1054 7.73478 11 8 11C8.79565 11 9.55871 10.6839 10.1213 10.1213C10.6839 9.55871 11 8.79565 11 8V5C11 3.93913 11.4214 2.92172 12.1716 2.17157C12.9217 1.42143 13.9391 1 15 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2C17 2.26522 16.8946 2.51957 16.7071 2.70711C16.5196 2.89464 16.2652 3 16 3H15C14.4696 3 13.9609 3.21071 13.5858 3.58579C13.2107 3.96086 13 4.46957 13 5V8C13.0006 8.77634 12.8202 9.54212 12.473 10.2365C12.1258 10.9309 11.6214 11.5347 11 12V12Z"></path>
        </svg>`,
        svg: { "viewBox": [7, 1, 10, 22], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [11, 12], "handleOut": [12.215, 12.912] }, { "point": [13, 16], "handleIn": [13, 14.364] }, { "point": [13, 19], "handleOut": [13, 19.5304] }, { "point": [13.5858, 20.4142], "handleIn": [13.2107, 20.0391], "handleOut": [13.9609, 20.7893] }, { "point": [15, 21], "handleIn": [14.4696, 21] }, { "point": [16, 21], "handleOut": [16.2652, 21] }, { "point": [16.7071, 21.2929], "handleIn": [16.5196, 21.1054], "handleOut": [16.8946, 21.4804] }, { "point": [17, 22], "handleIn": [17, 21.7348], "handleOut": [17, 22.2652] }, { "point": [16.7071, 22.7071], "handleIn": [16.8946, 22.5196], "handleOut": [16.5196, 22.8946] }, { "point": [16, 23], "handleIn": [16.2652, 23] }, { "point": [15, 23], "handleOut": [13.9391, 23] }, { "point": [12.1716, 21.8284], "handleIn": [12.9217, 22.5786], "handleOut": [11.4214, 21.0783] }, { "point": [11, 19], "handleIn": [11, 20.0609] }, { "point": [11, 16], "handleOut": [11, 15.2044] }, { "point": [10.1213, 13.8787], "handleIn": [10.6839, 14.4413], "handleOut": [9.55871, 13.3161] }, { "point": [8, 13], "handleIn": [8.79565, 13], "handleOut": [7.73478, 13] }, { "point": [7.29289, 12.7071], "handleIn": [7.48043, 12.8946], "handleOut": [7.10536, 12.5196] }, { "point": [7, 12], "handleIn": [7, 12.2652], "handleOut": [7, 11.7348] }, { "point": [7.29289, 11.2929], "handleIn": [7.10536, 11.4804], "handleOut": [7.48043, 11.1054] }, { "point": [8, 11], "handleIn": [7.73478, 11], "handleOut": [8.79565, 11] }, { "point": [10.1213, 10.1213], "handleIn": [9.55871, 10.6839], "handleOut": [10.6839, 9.55871] }, { "point": [11, 8], "handleIn": [11, 8.79565] }, { "point": [11, 5], "handleOut": [11, 3.93913] }, { "point": [12.1716, 2.17157], "handleIn": [11.4214, 2.92172], "handleOut": [12.9217, 1.42143] }, { "point": [15, 1], "handleIn": [13.9391, 1] }, { "point": [16, 1], "handleOut": [16.2652, 1] }, { "point": [16.7071, 1.29289], "handleIn": [16.5196, 1.10536], "handleOut": [16.8946, 1.48043] }, { "point": [17, 2], "handleIn": [17, 1.73478], "handleOut": [17, 2.26522] }, { "point": [16.7071, 2.70711], "handleIn": [16.8946, 2.51957], "handleOut": [16.5196, 2.89464] }, { "point": [16, 3], "handleIn": [16.2652, 3] }, { "point": [15, 3], "handleOut": [14.4696, 3] }, { "point": [13.5858, 3.58579], "handleIn": [13.9609, 3.21071], "handleOut": [13.2107, 3.96086] }, { "point": [13, 5], "handleIn": [13, 4.46957] }, { "point": [13, 8], "handleOut": [13.0006, 8.77634] }, { "point": [12.473, 10.2365], "handleIn": [12.8202, 9.54212], "handleOut": [12.1258, 10.9309] }, { "point": [11, 12], "handleIn": [11.6214, 11.5347] }] }] }] }
    },
    {
        name: '21',
        shape: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="24" width="24">
        <path data-stroke-as-fill-style="placeholder" fill="black" d="M13 12C12.3786 11.5347 11.8742 10.9309 11.527 10.2365C11.1798 9.54212 10.9994 8.77634 11 8V5C11 4.46957 10.7893 3.96086 10.4142 3.58579C10.0391 3.21071 9.53043 3 9 3H8C7.73478 3 7.48043 2.89464 7.29289 2.70711C7.10536 2.51957 7 2.26522 7 2C7 1.73478 7.10536 1.48043 7.29289 1.29289C7.48043 1.10536 7.73478 1 8 1H9C10.0609 1 11.0783 1.42143 11.8284 2.17157C12.5786 2.92172 13 3.93913 13 5V8C13 8.79565 13.3161 9.55871 13.8787 10.1213C14.4413 10.6839 15.2044 11 16 11C16.2652 11 16.5196 11.1054 16.7071 11.2929C16.8946 11.4804 17 11.7348 17 12C17 12.2652 16.8946 12.5196 16.7071 12.7071C16.5196 12.8946 16.2652 13 16 13C15.2044 13 14.4413 13.3161 13.8787 13.8787C13.3161 14.4413 13 15.2044 13 16V19C13 20.0609 12.5786 21.0783 11.8284 21.8284C11.0783 22.5786 10.0609 23 9 23H8C7.73478 23 7.48043 22.8946 7.29289 22.7071C7.10536 22.5196 7 22.2652 7 22C7 21.7348 7.10536 21.4804 7.29289 21.2929C7.48043 21.1054 7.73478 21 8 21H9C9.53043 21 10.0391 20.7893 10.4142 20.4142C10.7893 20.0391 11 19.5304 11 19V16C11 14.364 11.785 12.912 13 12Z"></path>
        </svg>`,
        svg: { "viewBox": [7, 1, 10, 22], "childs": [{ "paths": [{ "closed": true, "segments": [{ "point": [13, 12], "handleIn": [11.785, 12.912], "handleOut": [12.3786, 11.5347] }, { "point": [11.527, 10.2365], "handleIn": [11.8742, 10.9309], "handleOut": [11.1798, 9.54212] }, { "point": [11, 8], "handleIn": [10.9994, 8.77634] }, { "point": [11, 5], "handleOut": [11, 4.46957] }, { "point": [10.4142, 3.58579], "handleIn": [10.7893, 3.96086], "handleOut": [10.0391, 3.21071] }, { "point": [9, 3], "handleIn": [9.53043, 3] }, { "point": [8, 3], "handleOut": [7.73478, 3] }, { "point": [7.29289, 2.70711], "handleIn": [7.48043, 2.89464], "handleOut": [7.10536, 2.51957] }, { "point": [7, 2], "handleIn": [7, 2.26522], "handleOut": [7, 1.73478] }, { "point": [7.29289, 1.29289], "handleIn": [7.10536, 1.48043], "handleOut": [7.48043, 1.10536] }, { "point": [8, 1], "handleIn": [7.73478, 1] }, { "point": [9, 1], "handleOut": [10.0609, 1] }, { "point": [11.8284, 2.17157], "handleIn": [11.0783, 1.42143], "handleOut": [12.5786, 2.92172] }, { "point": [13, 5], "handleIn": [13, 3.93913] }, { "point": [13, 8], "handleOut": [13, 8.79565] }, { "point": [13.8787, 10.1213], "handleIn": [13.3161, 9.55871], "handleOut": [14.4413, 10.6839] }, { "point": [16, 11], "handleIn": [15.2044, 11], "handleOut": [16.2652, 11] }, { "point": [16.7071, 11.2929], "handleIn": [16.5196, 11.1054], "handleOut": [16.8946, 11.4804] }, { "point": [17, 12], "handleIn": [17, 11.7348], "handleOut": [17, 12.2652] }, { "point": [16.7071, 12.7071], "handleIn": [16.8946, 12.5196], "handleOut": [16.5196, 12.8946] }, { "point": [16, 13], "handleIn": [16.2652, 13], "handleOut": [15.2044, 13] }, { "point": [13.8787, 13.8787], "handleIn": [14.4413, 13.3161], "handleOut": [13.3161, 14.4413] }, { "point": [13, 16], "handleIn": [13, 15.2044] }, { "point": [13, 19], "handleOut": [13, 20.0609] }, { "point": [11.8284, 21.8284], "handleIn": [12.5786, 21.0783], "handleOut": [11.0783, 22.5786] }, { "point": [9, 23], "handleIn": [10.0609, 23] }, { "point": [8, 23], "handleOut": [7.73478, 23] }, { "point": [7.29289, 22.7071], "handleIn": [7.48043, 22.8946], "handleOut": [7.10536, 22.5196] }, { "point": [7, 22], "handleIn": [7, 22.2652], "handleOut": [7, 21.7348] }, { "point": [7.29289, 21.2929], "handleIn": [7.10536, 21.4804], "handleOut": [7.48043, 21.1054] }, { "point": [8, 21], "handleIn": [7.73478, 21] }, { "point": [9, 21], "handleOut": [9.53043, 21] }, { "point": [10.4142, 20.4142], "handleIn": [10.0391, 20.7893], "handleOut": [10.7893, 20.0391] }, { "point": [11, 19], "handleIn": [11, 19.5304] }, { "point": [11, 16], "handleOut": [11, 14.364] }] }] }] }
    }
]


export function getShapeStore(name: string) {
    var r = cacheShapeStore.get(name);
    if (r) return r;
    return ShapesList.map(s => {
        return {
            ...s.svg,
            id: s.name,
            shape: s.shape
        }
    })
}

const cacheShapeStore: Map<string, any> = new Map();

export var LoadShapeStore = async (name: string) => {
    var r = cacheShapeStore.get(name);
    if (r) return r
    var ds;
    if (name?.endsWith('.json')) {
        var url = STATIC_URL + 'static/board/shapes/data' + name;
        var rd = await util.getJson(url);
        if (Array.isArray(rd?.data))
            ds = rd.data;
        else ds = []
        cacheShapeStore.set(name, ds);
        return ds;
    }
}