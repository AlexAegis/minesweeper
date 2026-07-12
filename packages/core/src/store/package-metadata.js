// @ts-nocheck -- This runtime-only bridge is typed by its sibling
// `package-metadata.d.ts`. tsc still type-checks this `.js` (checkJs) and, under
// core's `nodenext` module, would demand a `with { type: 'json' }` import
// attribute on the JSON import. That attribute cannot stay here: consumers on
// `es2022` + `verbatimModuleSyntax` reject it in tsc, and eslint cannot even
// parse it in a `.js`. Skipping type-checking of this one file resolves the
// conflict; the declaration file remains the type source of truth.
// The workspace metadata is imported from the root package.json so the app can
// display its real name, version and homepage. This lives in a plain `.js`
// shadowed by `package-metadata.d.ts`: tsc resolves the declaration (so the
// JSON import never has to satisfy `nodenext`'s import-attribute requirement,
// which consumers on `es2022` + `verbatimModuleSyntax` reject), while Vite
// bundles the real values from this file at build time.
import packageJson from '../../../../package.json';

export const packageMetadata = packageJson;
