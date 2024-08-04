# Tattoo API for Rebar Framework
Tattoo plugin lets you set, remove player tattoos.

![image](https://github.com/user-attachments/assets/271bf72a-a94e-4534-9ed3-4fd6da277f8d)

## Requires
A player must have a character creator plugin.
-   [Rebar Character Creator](https://github.com/Stuyk/rebar-character-creator)

## Features
-   set tattoo by < index || name >
-   remove tattoo by < index >

## API example usage
```ts
import * as alt from 'alt-server';
import { useRebar } from '@Server/index.js';
const Rebar = useRebar();
const api = Rebar.useApi();
const tattooapi = await api.getAsync('tattoo-api');
const messenger = Rebar.messenger.useMessenger();

messenger.commands.register({
    name: '/settattoo',
    desc: 'tattoo <index | name>',
    options: {},
    callback: async (player: alt.Player, overlay: string | number) => {
        try {
            const { LocalizedName, Zone } = tattooapi.setTattoo(player, overlay);
            Rebar.messenger.useMessenger().message.send(player, { type: 'system', content: `${LocalizedName} tattoo has been applied to the ${Zone}.` });
        } catch (error) {
            Rebar.messenger.useMessenger().message.send(player, { type: 'alert', content: error.message });
        }
    }
});

messenger.commands.register({
    name: '/remtattoo',
    desc: 'remtattoo <index>',
    options: {},
    callback: async (player: alt.Player, index: any) => {
        tattooapi.removeTattoo(player, index as number);
    }
});
```
## Example usage: 
```
/settattoo 152 or /settattoo Mamba Sleeve
/remtattoo 0 # removes the tattoo index from db and ingame character ped
```

## Installation
```
git clone https://github.com/R3DIANCE/rebar-tattoo-api src/plugins/rebar-tattoo-api
```
