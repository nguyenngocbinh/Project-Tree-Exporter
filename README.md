# Project Tree Exporter

A lightweight VS Code extension to create a readable directory tree for the current workspace.

## Features

- **Project Tree: Generate Preview** — opens the tree in a Markdown editor.
- **Project Tree: Copy to Clipboard** — copies the Markdown tree to the clipboard.
- **Project Tree: Export to Markdown** — saves the result as `PROJECT_TREE.md` or `.txt`.
- Commands are available through the Command Palette (`Ctrl+Shift+P`) and the Explorer context menu.
- Exclude noisy folders and set the maximum directory depth.

## Install from a VSIX

1. Open the repository's **Actions** tab on GitHub.
2. Select the latest successful **Build VSIX** run.
3. Download the `project-tree-exporter-vsix` artifact and unzip it.
4. In VS Code, open Extensions (`Ctrl+Shift+X`).
5. Select the `...` menu → **Install from VSIX...** and choose the `.vsix` file.

## Build locally

Requires Node.js and npm.

```powershell
npm install
npm run package
```

The `.vsix` file is generated in the project root.

## Settings

Search for **Project Tree Exporter** in VS Code Settings:

| Setting | Default | Description |
| --- | --- | --- |
| `projectTree.maxDepth` | `8` | Maximum folder depth |
| `projectTree.includeFiles` | `true` | Include files as well as folders |
| `projectTree.exclude` | Common generated folders | Names to skip; matching is by entry name |

The extension lists names only; it does not read file contents.

## Development

Open this repository in VS Code and press `F5` to launch an Extension Development Host.

## License

MIT
