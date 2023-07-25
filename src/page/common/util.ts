


export var PageBlockUtil = {
    async eachBlockDatas(blockDatas: (any[]) | any, predict: (r) => Promise<void>) {
        if (Array.isArray(blockDatas)) {
            await blockDatas.asyncMap(async b => {
                await predict(b);
                for (let n in b.blocks) {
                    await PageBlockUtil.eachBlockDatas(b.blocks[n], predict)
                }
            })
        }
        else {
            await predict(blockDatas);
            for (let n in blockDatas.blocks) {
                await PageBlockUtil.eachBlockDatas(blockDatas.blocks[n], predict)
            }
        }
    }
}