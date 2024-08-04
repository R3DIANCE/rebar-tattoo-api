import * as alt from 'alt-server';
import tattoos from '../shared/config.js';
import { useRebar } from '@Server/index.js';

const API_NAME = 'tattoo-api';
const Rebar = useRebar();

type Gender = 1885233650 | 2627665880;

interface ITattoo {
    readonly Name: string;
    readonly LocalizedName: string;
    readonly HashNameMale: string;
    readonly HashNameFemale: string;
    readonly Zone: string;
    readonly ZoneID: number;
    readonly Price: number;
}

function API() {
    function getHashName(gender: Gender): string { return gender === 1885233650 ? 'HashNameMale' : 'HashNameFemale'; }

    function countTattoos(gender: Gender): number { return Object.values(tattoos).flat().filter(tattoo => tattoo[getHashName(gender)]).length; }

    function selectTattoosByName(gender: Gender, name: string): Array<{ tattoo: ITattoo, collection: string, overlay: string }> {
        return Object.entries(tattoos).flatMap(([collection, items]) =>
            items.filter(tattoo => tattoo.LocalizedName.toLowerCase().includes(name.toLowerCase()))
                .map(tattoo => ({ tattoo, collection, overlay: tattoo[getHashName(gender)] })));
    }

    function getTattooList(gender: Gender) {
        return Object.entries(tattoos).flatMap(([collection, items]) =>
            items.filter(tattoo => tattoo[getHashName(gender)]).map(tattoo => ({
                tattoo, collection, overlay: tattoo[getHashName(gender)]
            })));
    }

    function setTattoo(player: alt.Player, overlay: number | string) {
        const gender = player.model as Gender;
        const maxIndex = countTattoos(gender) - 1;
        if (typeof overlay === 'number' || !isNaN(Number(overlay))) {
            const index = Number(overlay);
            if (index < 0 || index > maxIndex) {
                throw new Error(`Invalid tattoo index: ${index}. Valid range: 0-${maxIndex}`);
            }
        }
        const tattooList = getTattooList(gender);
        const tattoo = typeof overlay === 'number' || !isNaN(Number(overlay))
            ? tattooList[Number(overlay)] : selectTattoosByName(gender, overlay)[0];
        if (!tattoo) {
            throw new Error(`Tattoo not found: ${overlay}`);
        }
        const rebarPlayer = Rebar.usePlayer(player);
        const getTattoos = rebarPlayer.character.get().appearance.tattoos;
        const tattooExists = getTattoos.some(existingTattoo =>
            existingTattoo.collection === tattoo.collection &&
            existingTattoo.overlay === tattoo.overlay
        );
        let { LocalizedName, Zone } = tattoo.tattoo;
        Zone = Zone.replaceAll("_", " ").replace("ZONE", "").toLocaleLowerCase();
        if (!tattooExists) {
            rebarPlayer.appearance.setTattoos([...getTattoos, { collection: tattoo.collection, overlay: tattoo.overlay }]);
            rebarPlayer.appearance.sync();
            return { LocalizedName, Zone }
        } else {
            throw new Error(`${LocalizedName} already exists at the ${Zone}.`);
        }
    }

    function removeTattoo(player: alt.Player, index: number) {
        const rebarPlayer = Rebar.usePlayer(player);
        const getTattoos = rebarPlayer.character.get().appearance.tattoos;

        if (index >= 0 && index < getTattoos.length) {
            const updatedTattoos = [...getTattoos.slice(0, index), ...getTattoos.slice(index + 1)];
            rebarPlayer.appearance.setTattoos(updatedTattoos);
            rebarPlayer.appearance.sync();
        } else {
            throw new Error(`Invalid index`);
        }
    }

    return {
        countTattoos,
        getTattooList,
        selectTattoosByName,
        setTattoo,
        removeTattoo
    };
}

declare global {
    export interface ServerPlugin {
        [API_NAME]: ReturnType<typeof API>;
    }
}

Rebar.useApi().register(API_NAME, API());