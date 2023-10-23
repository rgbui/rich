import { lst } from "../../i18n/store";
import { Page } from "../../src/page";
import { PageLayoutType } from "../../src/page/declare";
export function GetPageThemes(page: Page) {
    if ([
        PageLayoutType.doc,
        PageLayoutType.db,
        PageLayoutType.recordView].includes(page?.pageLayout?.type)) {
        var groups = [
            {
                text: lst('布局'),
                name: 'layout',
                childs: [{
                    text: lst('网页'),
                    name: 'default',
                    pageTheme: {
                        name: 'default',
                        bgStyle: {
                            mode: 'color',
                            color: '#fff'
                        },
                        contentStyle: {
                            color: 'light',
                            transparency: 'noborder',
                        },
                        coverStyle: {
                            display: 'outside'
                        }
                    }
                },
                {
                    text: lst('网页-小窝'),
                    name: 'default-inside',
                    pageTheme: {
                        name: 'default-inside',
                        bgStyle: {
                            mode: 'color',
                            color: '#fff'
                        },
                        contentStyle: {
                            color: 'light',
                            transparency: 'noborder',
                        },
                        coverStyle: {
                            display: 'inside'
                        }
                    }
                },
                {
                    text: lst('内容'),
                    name: 'default-content',
                    pageTheme: {
                        name: 'default-content',
                        bgStyle: {
                            mode: 'color',
                            color: '#f0f0f0'
                        },
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid',
                            border: '1px solid #eee',
                            round: 16,
                            shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: lst('封面内容'),
                    name: 'default-inside-cover',
                    pageTheme: {
                        name: 'default-inside-cover',
                        bgStyle: {
                            mode: 'color',
                            color: '#f0f0f0'
                        },
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid'
                        },
                        coverStyle: {
                            display: 'inside-cover'
                        }
                    }
                }]
            },
            {
                text: lst('风格'),
                name: 'style',
                childs: [
                    {
                        text: lst('银白'),
                        name: 'style-3',
                        pageTheme: {
                            name: 'style-3',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(246, 244, 244)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 14,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('珍珠'),
                        name: 'style-4',
                        pageTheme: {
                            name: 'style-4',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(236, 236, 243)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'frosted',
                                border: '0px solid #eee',
                                round: 14,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgba(255, 255, 255, 0.64) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('破冰'),
                        name: 'style-5',
                        pageTheme: {
                            name: 'style-5',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(237, 241, 248)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 8,
                                shadow: 'none'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('绿洲'),
                        name: 'style-6',
                        pageTheme: {
                            name: 'style-6',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(170, 188, 182)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('灵巧'),
                        name: 'style-7',
                        pageTheme: {
                            name: 'style-7',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(242, 228, 207)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 4,
                                shadow: 'none'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {

                        text: lst('伽玛'),
                        name: 'style-8',
                        pageTheme: {
                            name: 'style-8',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(250, 242, 233)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {

                        text: lst('鼠尾草'),
                        name: 'style-9',
                        pageTheme: {
                            name: 'style-9',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(235, 244, 243)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {

                        text: lst('赤土'),
                        name: 'style-10',
                        pageTheme: {
                            name: 'style-10',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(247, 237, 233)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'solid',
                                border: '0px solid #eee',
                                round: 16,
                                shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('细腻'),
                        name: 'style-1',
                        pageTheme: {
                            name: 'style-1',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(242, 228, 207)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'faded',
                                border: '1px solid #eee',
                                round: 16,
                                shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                    {
                        text: lst('火红'),
                        name: 'style-2',
                        pageTheme: {
                            name: 'style-2',
                            bgStyle: {
                                "mode": "grad",
                                "grad": {
                                    "name": "soft",
                                    "x": 4,
                                    "y": 109.5,
                                    "bg": "radial-gradient(circle at 0% 0%, rgba(255,9,32,0.5) 0px, rgba(255,9,32,0) 50%),radial-gradient(circle at 12.700117292409608% 19.41763171368182%, rgba(255,170,9,0.5) 0px, rgba(255,170,9,0) 87.2998827075904%),radial-gradient(circle at 19.41763171368182% 87.2998827075904%, rgba(255,9,217,0.5) 0px, rgba(255,9,217,0) 80.58236828631817%),linear-gradient(0deg, rgba(255,9,32,0.5) 0%, rgba(255,9,32,0.5) 100%)"
                                }
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'faded',
                                border: '1px solid #eee',
                                round: 16,
                                shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                            },
                            coverStyle: {
                                display: 'outside'
                            }
                        }
                    },
                ]
            }
        ]
        return groups;
    }
    if ([PageLayoutType.textChannel, PageLayoutType.docCard].includes(page?.pageLayout?.type)) {
        return [
            {
                text: lst('风格'),
                childs: [
                    {
                        text: lst('细腻'),
                        name: 'style-1',
                        bgStyle: { backgroundColor: 'rgb(242, 228, 207)' },
                        pageTheme: {
                            name: 'style-1',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(242, 228, 207)'
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'faded',
                                border: '1px solid #eee',
                                round: 16,
                                shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                            },
                            coverStyle: {
                                display: 'inside-cover'
                            }
                        }
                    },
                    {
                        text: lst('火红'),
                        name: 'style-2',
                        pageTheme: {
                            name: 'style-2',
                            bgStyle: {
                                "mode": "grad",
                                "grad": {
                                    "name": "soft",
                                    "x": 4,
                                    "y": 109.5,
                                    "bg": "radial-gradient(circle at 0% 0%, rgba(255,9,32,0.5) 0px, rgba(255,9,32,0) 50%),radial-gradient(circle at 12.700117292409608% 19.41763171368182%, rgba(255,170,9,0.5) 0px, rgba(255,170,9,0) 87.2998827075904%),radial-gradient(circle at 19.41763171368182% 87.2998827075904%, rgba(255,9,217,0.5) 0px, rgba(255,9,217,0) 80.58236828631817%),linear-gradient(0deg, rgba(255,9,32,0.5) 0%, rgba(255,9,32,0.5) 100%)"
                                }
                            },
                            contentStyle: {
                                color: 'light',
                                transparency: 'faded',
                                border: '1px solid #eee',
                                round: 16,
                                shadow: 'rgba(18, 18, 18, 0.1) 0px 1px 3px 0px'
                            },
                            coverStyle: {
                                display: 'inside-cover'
                            }
                        }
                    },
                ]
            }
        ]
    }
    return []
}

export function GetPageBgs() {
    return [
        { color: 'rgba(255,255,255,0)', text: lst('默认') },
        { color: 'rgba(237,233,235,0.5)', text: lst('白灰') },
        { color: '#EDF2F7', text: lst('冷灰') },
        { color: '#F2F2F2', text: lst('浅灰') },
        { color: '#F7F3F0', text: lst('暖灰') },
        { color: '#F7F1EB', text: lst('米色') },
        { color: 'rgba(217,211,215,0.5)', text: lst('暗银') },
        { color: 'rgba(247,214,183,0.5)', text: lst('幼杏') },
        { color: 'rgba(255,193,153,0.5)', text: lst('鲜橘') },
        { color: '#f8ecd3', text: lst('木瓜') },
        { color: 'rgba(252,246,189,0.5)', text: lst('淡黄') },
        { color: 'rgba(205,243,220,0.5)', text: lst('浅绿') },
        { color: '#d5eff6', text: lst('青色') },
        { color: 'rgba(169,222,249,0.5)', text: lst('天蓝') },
        { color: '#cbdbf1', text: lst('长春') },
        { color: '#bdebe8', text: lst('粉蓝') },
        { color: 'rgba(189,201,255,0.5)', text: lst('雾蓝') },
        { color: 'rgba(239,218,251,0.5)', text: lst('轻紫') },
        { color: '#e2def2', text: lst('淡紫') },
        { color: 'rgba(234,202,220,0.5)', text: lst('熏粉') },
        { color: '#f8d3d7', text: lst('淡粉') },
        { color: 'rgba(253,198,200,0.5)', text: lst('将红') },
        { color: '#eee2dd', text: lst('亚麻') },
    ]
}

export function getCardThemes() {
    return [
        {
            text: lst('风格'),
            name: 'style',
            childs: [
                {
                    text: '',
                    name: 'style-3',
                    pageTheme: {
                        name: 'style-3',
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid',
                            border: '1px solid #eee',
                            round: 8,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-4',
                    pageTheme: {
                        name: 'style-4',
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid',
                            border: '2px dashed #aaa',
                            round: 8,
                            shadow: 'none',
                            // shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-5',
                    pageTheme: {
                        name: 'style-5',
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid',
                            border: '0px solid #eee',
                            round: 2,
                            shadow: '0 1px 3px hsla(0,0%,7%,.1)'
                        },
                        coverStyle: {
                            display: 'none'
                        }
                    }
                },
                {
                    text: '',
                    name: 'style-6',
                    pageTheme: {
                        name: 'style-6',
                        contentStyle: {
                            color: 'light',
                            transparency: 'solid',
                            border: '0px solid #eee',
                            round: 2,
                            shadow: '0 1px 3px hsla(0,0%,7%,.1)'
                        },
                        coverStyle: {
                            display: 'inside',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(170, 188, 182)'
                            }
                        }
                    }
                },
                {
                    text: '',
                    // text: lst('鼠尾草'),
                    name: 'style-7',
                    pageTheme: {
                        name: 'style-7',
                        contentStyle: {
                            color: 'light',
                            transparency: 'noborder',
                            border: '0px solid #eee',
                            round: 16,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'inside',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(235, 244, 243)'
                            },
                        }
                    }
                },
                {
                    text: '',
                    // text: lst('赤土'),
                    name: 'style-8',
                    pageTheme: {
                        name: 'style-8',
                        contentStyle: {
                            color: 'light',
                            transparency: 'noborder',
                            border: '0px solid #eee',
                            round: 16,
                            shadow: 'rgba(0, 0, 0, 0.1) 0px 4.5px 6.75px -1.125px, rgba(0, 0, 0, 0.06) 0px 2.25px 4.5px -1.125px, rgb(229, 224, 223) 0px 0px 0px 1.125px'
                        },
                        coverStyle: {
                            display: 'inside',
                            bgStyle: {
                                mode: 'color',
                                color: 'rgb(247, 237, 233)'
                            },
                        }
                    }
                },
            ]
        }
    ]
}