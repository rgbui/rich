export var data = {
    url: '/page',
    views: [
        {
            url: '/view',
            blocks: {
                childs: [
                    {
                        url: '/card/box',
                        blocks: {
                            childs: [
                                { url: '/card/box/title' }
                            ]
                        }
                    }
                ]
            }
        }
    ]
}