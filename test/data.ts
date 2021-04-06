
export var data = {
    url: '/page',
    views: [
        {
            url: '/view',
            blocks: {
                childs: [{
                    url: '/row',
                    blocks: {
                        childs: [
                            { url: '/textspan', content: '你还好吗\n\n大师，换行' }
                        ]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [
                            {
                                url: '/textspan',
                                blocks: {
                                    childs: [
                                        { url: '/text', content: '你就这样' },
                                        { url: '/text', content: '我就这样喽' }]
                                }
                            }
                        ]
                    }
                },
                {
                    url: "/row",
                    blocks: {
                        childs: [
                            { url: '/todo', content: '我可以选择吗', checked: true }
                        ]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [{
                            url: '/image',
                            widthPercent: 50,
                            src: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fb-ssl.duitang.com%2Fuploads%2Fblog%2F201508%2F10%2F20150810150356_hnves.jpeg&refer=http%3A%2F%2Fb-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1614066907&t=93f1dfde3d75b35f1153af1eda01e314'
                        }]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [
                            {
                                url: '/table/store',
                                cols: [{ name: 's1', width: 50 }, { name: 's2', width: 50 }],
                                meta: {
                                    cols: [
                                        { name: 's1', text: '姓名', type: 'string' },
                                        { name: 's2', text: "年龄", type: 'string' }]
                                },
                                data: [{ s1: "阚海", s2: 32 }, { s1: '', s2: 24 }]
                            }
                        ]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [{ url: '/katex', formula: "c = \\pm\\sqrt{a^2 + b^2}" }]
                    }
                },
                {
                    url: "/row",
                    blocks: {
                        childs: [{
                            url: '/table',
                            blocks: {
                                childs: [
                                    {
                                        url: '/table/row', blocks: {
                                            childs: [
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        url: '/table/row', blocks: {
                                            childs: [
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    },
                                                    colspan: 2
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        url: '/table/row', blocks: {
                                            childs: [
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    url: "/table/cell",
                                                    blocks: {
                                                        childs: [
                                                            {
                                                                url: '/row',
                                                                blocks: {
                                                                    childs: [{ url: '/textspan', content: "子内容。\n。。。。" }]
                                                                }
                                                            }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [
                            {
                                url: '/code',
                                code: 'var d="ssss";'
                            }
                        ]
                    }
                },
                {
                    url: '/row',
                    blocks: {
                        childs: [
                            {
                                url: '/list',
                                blocks: {
                                    childs: [{ url: '/list/text', content: '选项1' }],
                                    subChilds: [
                                        {
                                            url: '/col',
                                            blocks: {
                                                childs: [
                                                    {
                                                        url: '/row',
                                                        blocks: {
                                                            childs: [{ url: '/textspan', content: "子内容。。。。。" }]
                                                        }
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }]
                    }
                }
                ]
            }
        }
    ]
}