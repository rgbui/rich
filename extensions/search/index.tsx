import { channel } from "../../net/channel";
import { useAISearchBox } from "./ai";
import { useSearchBox } from "./keyword";

export async function useWsSearch(options?: { word?: string, isNav?: boolean }) {

    var r = await await channel.query('/cache/get', { key: 'search-mode' })
    if (r == 'ai') {
        await useAISearchBox()
    }
    else {
        await useSearchBox()
    }
}