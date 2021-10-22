export var data = {
    url: '/page',
    views: [
        {
            url: '/view',
            blocks: {
                childs: [
                    {
                        url: '/row',
                        blocks: {
                            childs: [
                                { url: '/title', },
                            ]
                        }
                    }
                ]
            }
        }
    ]
}