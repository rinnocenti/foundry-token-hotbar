import { OldHotbarData, HotbarData, HotbarItem } from '../flags/hotbarFlags';
import { HotbarSlots } from '../hotbar/hotbar';
import { Flaggable } from './foundry';
import { CONSTANTS } from './constants';

export interface DataFlaggable extends Flaggable {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: { flags: { [key: string]: any } }
}

export class Migration {
    constructor(private flaggables: DataFlaggable[]) { }

    async migrate(): Promise<Error[]> {
        const errors: Error[] = [];
        const flagKey = 'hotbar-data';
        for (const flaggable of this.flaggables) {
            const oldFlags = this.getOldFlags(flaggable, flagKey);

            if (oldFlags) {
                console.debug('[Token Hotbar] Migrating', flaggable.id, flaggable.data.flags);
                const newData: HotbarData = {};
                for (const key in oldFlags) {
                    try {
                        newData[key] = this.translateDataStructure(oldFlags[key]);
                        await flaggable.unsetFlag(CONSTANTS.module.name, key);
                        await this.delay(50); // prevent race conditions
                        console.info('[Token Hotbar] Successfully migrated', flaggable.id);
                    } catch (e) {
                        errors.push(e);
                        console.error('[Token Hotbar] Failed to migrate', flaggable.id);
                    }
                }
                await flaggable.setFlag(CONSTANTS.module.name, flagKey, newData );
                await flaggable.unsetFlag('world', CONSTANTS.module.name);
            }
        }
        return errors;
    }

    public translateDataStructure(oldData: HotbarItem[] ): HotbarSlots {
        console.log("[Token Hotbar]", "Translating old data...", oldData);
        return oldData.reduce<HotbarSlots>((acc, cur) => (acc[cur.slot] = cur.id, acc), {});
    }

    private getOldFlags(flaggable: DataFlaggable, key: string): OldHotbarData | undefined {
        let oldFlags: OldHotbarData = flaggable.data.flags[CONSTANTS.module.name] && flaggable.data.flags[CONSTANTS.module.name][key];
        // if 'old data' is already in the new format, return undefined
        if (oldFlags && Object.keys(oldFlags).some(id => !Array.isArray(oldFlags[id]))) {
            return undefined;
        }

        if (!oldFlags) {
            oldFlags = flaggable.data.flags.world?.[CONSTANTS.module.name];
        }

        return oldFlags;
    }

    private delay(timeoutMs) {
        return new Promise(resolve => {
            setTimeout(resolve, timeoutMs);
        });
    }
}