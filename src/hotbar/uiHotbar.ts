import { Macro } from '../foundry';
import { HotbarSlots } from './hotbar';

export interface UiHotbar {
    toggleHotbar(showTokenBar: boolean): Promise<unknown>;
    showTokenHotbar(): Promise<unknown>;
    hideTokenHotbar(): Promise<unknown>;
    getTokenHotbarPage(): number;
    shouldUpdateTokenHotbar(): boolean;
}

export const calculatePageSlots = (page: number) => {
    function range(size: number, startAt = 0) {
        return [...Array(size).keys()].map(i => i + startAt);
    }
    return range(10, (page - 1) * 10 + 1);
}

export const pickPageSlots = (page: number, allSlots: HotbarSlots) => {
    return calculatePageSlots(page)
        .reduce<HotbarSlots>((acc, cur) => (acc[cur] = allSlots[cur], acc), {});
}
