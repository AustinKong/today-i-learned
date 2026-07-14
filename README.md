# TIL

Personal notes and small explanations for algorithms, data structures, and related technical topics.

Notes live in `notes/`. Excalidraw source diagrams are committed as `.excalidraw` files and exported to sibling `.svg` files for embedding in Markdown.

## Commands

```sh
npm run export:excalidraw
```

Exports every `notes/**/*.excalidraw` file to a matching `.svg` file and rewrites Markdown embeds from `.excalidraw` to `.svg`.

```sh
npm run lint:md
```

Checks Markdown files under `notes/`.

```sh
npm run lint:md:fix
```

Fixes Markdown formatting where possible.

## Git Hook

The repository uses `.githooks/pre-commit`. Enable it with:

```sh
git config core.hooksPath .githooks
```

The hook exports Excalidraw diagrams before running Markdown lint fixes.

## Future Improvements

Add darkmode support. Currently the library `exportDiagram` does not disable `background` option. This is to avoid having SVG that has low contrast strokes against dark mode markdown readers, which we instead circumvent by having white background. It may be ugly but the easiest solution right now. This can be solved by tying into the next TODO, since Excalidraw's official library does have dark/light mode exports.

Add serialization/cleanup for `.excalidraw` files using Excalidraw's official [`serializeAsJSON`](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils#serializeasjson) utility. This should remove app state and deleted components to keep Git diffs stable and minimize file size.

I realize that never using corner rounded rectangles is always cleaner and more readable (i.e. using sharp corner rectangles,) check through old notes to convert corner rounded rectangles into sharp corner rectangles for readability.