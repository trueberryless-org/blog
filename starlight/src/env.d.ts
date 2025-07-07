/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  type StarlightLocals = import('@astrojs/starlight').StarlightLocals;
  // Define the `locals.t` object in the context of a plugin.
  interface Locals extends StarlightLocals {}
}

declare namespace StarlightApp {
  type UIStrings = typeof import('./content/i18n/en.json');
  interface I18n extends UIStrings {}
}