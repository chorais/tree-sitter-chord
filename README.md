# tree-sitter-chord

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for
**Chord**, the description language for
[Chorais](https://github.com/chorais/chorais) AI orchestration, packaged as a
[Zed](https://zed.dev) editor extension.

## Features

- Syntax highlighting for `.chord` files
- Document outline, brackets & autoclose pairs, auto-indent
- Markdown injections inside heredoc blocks
- Text objects
- 24 code snippets

## Installing

### From the Zed extension registry

Once published: `Zed → Settings → Extensions → search "Chord"`.

### As a dev extension

```sh
git clone https://github.com/chorais/tree-sitter-chord
```

Then in Zed: `Zed → Extensions → Install Dev Extension`, and select the
cloned directory.

## Building the grammar locally

```sh
make test    # runs the corpus tests
make generate
```

Requires the tree-sitter CLI (≥ 0.24) and node.

## Repository layout

| Path | Purpose |
|---|---|
| `grammar.js`, `src/` | tree-sitter grammar (generated parser + external scanner) |
| `test/corpus/` | corpus tests |
| `languages/chord/` | Zed extension queries (highlights, outline, brackets, indents, injections, textobjects) |
| `queries/` | mirror of the above, used by the tree-sitter CLI |
| `snippets/` | Zed snippets |
| `icons/` | icon assets (reserved for a future optional file-icon theme) |

## License

MIT — see [LICENSE](LICENSE).
