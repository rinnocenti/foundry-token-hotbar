import { UiHotbar, pickPageSlots } from "./uiHotbar";
import { Hotbar, HotbarSlots } from "./hotbar";
import { PageFlag } from "../flags/pageFlag";
import { Settings } from "../settings";
import { Logger } from "../logger";
import { FoundryUiHotbar } from "../foundry";

export class FoundryHotbar implements UiHotbar, Hotbar {
    constructor(private settings: Settings, private hotbar: FoundryUiHotbar, private pageFlag: PageFlag, private logger: Logger = console) { }
    public toggleHotbar(showTokenBar: boolean): Promise<unknown> {
        if (showTokenBar) {
            return this.showTokenHotbar();
        }
        else {
            return this.hideTokenHotbar();
        }
    }

    shouldUpdateTokenHotbar(): boolean {
        return this.hotbar.page == this.getTokenHotbarPage();
    }

    public getTokenHotbarPage() {
        return this.settings.hotbarPage;
    }

    public showTokenHotbar(): Promise<unknown> {
        if (this.hotbar.page != this.getTokenHotbarPage())
            this.pageFlag.set(this.hotbar.page);

        return this.render(this.getTokenHotbarPage());
    }

    public hideTokenHotbar(): Promise<unknown> {
        if (this.hotbar.page != this.getTokenHotbarPage())
            return Promise.resolve(); // user already moved away from the token hotbar.

        return this.render(this.pageFlag.get());
    }

    public getMacrosByPage(page: number) : { hotbar: HotbarSlots } {
        const allSlots = this.getAllHotbarMacros();
        const pageSlots = pickPageSlots(page, allSlots);
        return { hotbar: pageSlots };
    }

    setTokenMacros(page: number, data: { hotbar: HotbarSlots }): Promise<unknown> {
        const continuousTokenHotbar = pickPageSlots(page, data.hotbar);
        for(let slot in continuousTokenHotbar) {
            if (!continuousTokenHotbar[slot]) {
                this.unset(continuousTokenHotbar, +slot);
            }
        }

        const allSlots = this.getAllHotbarMacros();
        let combinedMacros = Object.assign({}, allSlots, continuousTokenHotbar);

        return game.user.update({ hotbar: combinedMacros });
    }

    private render(page: number): Promise<unknown> {
        this.hotbar.page = page;
        return new Promise((resolve) => {
        // FIXME: Render does not always work without the timeout.
            setTimeout(() => {
                this.hotbar.render();
                this.logger.debug('[Token Hotbar]', 'Rendered page', page);
                resolve();
            }, 5);
        });
    }

    private unset(hotbar, slot: number) {
        delete hotbar[slot];
        hotbar[`-=${slot}`] = null;
    }

    private getAllHotbarMacros(): HotbarSlots {
        return (<any>game.user.data).hotbar;
    }
}