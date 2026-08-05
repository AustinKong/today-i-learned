# TIL

Personal notes and small explanations for algorithms, data structures, and related technical topics.

Notes live in `notes/`. The website publishes files named `index.md`; other Markdown files, such as `TODO.md`, are ignored. Each published note provides only its title and category as YAML frontmatter. Excalidraw diagrams are committed as editable `.excalidraw` sources and referenced directly from Markdown. The website build renders temporary SVG assets for publication.

See [STYLE_GUIDE.md](./STYLE_GUIDE.md) for the note-writing conventions.

## Commands

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

The hook runs Markdown lint fixes.

## Future Improvements

Add serialization/cleanup for `.excalidraw` files using Excalidraw's official [`serializeAsJSON`](https://docs.excalidraw.com/docs/@excalidraw/excalidraw/api/utils#serializeasjson) utility. This should remove app state and deleted components to keep Git diffs stable and minimize file size.

I realize that never using corner rounded rectangles is always cleaner and more readable (i.e. using sharp corner rectangles,) check through old notes to convert corner rounded rectangles into sharp corner rectangles for readability.
