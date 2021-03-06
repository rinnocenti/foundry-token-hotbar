import { CONSTANTS } from '../utils/constants';
import { Flaggable } from '../utils/foundry';
import { FlagsStrategy } from './flagStrategies';
import { HotbarSlots } from '../hotbar/hotbar';
import { Logger } from '../utils/logger';

export interface HotbarItem {
    id: string,
    slot: number
}

export type OldHotbarData = { [tokenId: string]: HotbarItem[] };
export type HotbarData = { [tokenId: string]: HotbarSlots }

export interface HotbarFlags { 
    /**
     * Retrieves the hotbar for a particular entity.
     * POST: Return value is always an object.
     * @param entity the token or actor to get the hotbar for.
     */
    get(tokenId: string): HotbarData;

    set(tokenId: string, data: HotbarData): Promise<Flaggable>;
}

export class ModuleHotbarFlags implements HotbarFlags {
    private readonly key = 'hotbar-data';
    constructor(protected flagStrategy: FlagsStrategy, protected logger: Logger) { }

    get(tokenId: string): HotbarData {
        const flags = this.flagStrategy.get(tokenId);
        return flags.getFlag(CONSTANTS.module.name, this.key) || {};
    }

    set(tokenId: string, data: HotbarData): Promise<Flaggable> {
        const entity = this.flagStrategy.get(tokenId); 
        this.logger.debug('[Token Hotbar]', 'Storing data for token', tokenId, entity, this.key, data);
        return entity.unsetFlag(CONSTANTS.module.name, this.key)
            .then(entity => {
                return entity.setFlag(CONSTANTS.module.name, this.key, data);
            });
    }
}
