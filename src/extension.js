'use strict';

const vscode = require('vscode');
const fs = require('node:fs/promises');
const path = require('node:path');

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('projectTree.generate', async () => {
      const result = await buildTree();
      if (!result) return;

      const document = await vscode.workspace.openTextDocument({
        language: 'markdown',
        content: result.markdown
      });
      await vscode.window.showTextDocument(document, { preview: false });
    }),

    vscode.commands.registerCommand('projectTree.copy', async () => {
      const result = await buildTree();
      if (!result) return;

      await vscode.env.clipboard.writeText(result.markdown);
      vscode.window.showInformationMessage('Project tree copied to clipboard.');
    }),

    vscode.commands.registerCommand('projectTree.export', async () => {
      const result = await buildTree();
      if (!result) return;

      const defaultUri = vscode.Uri.file(path.join(result.root, 'PROJECT_TREE.md'));
      const uri = await vscode.window.showSaveDialog({
        defaultUri,
        saveLabel: 'Export Project Tree',
        filters: {
          Markdown: ['md'],
          Text: ['txt']
        }
      });
      if (!uri) return;

      const content = uri.fsPath.toLowerCase().endsWith('.txt')
        ? result.tree
        : result.markdown;

      await fs.writeFile(uri.fsPath, content, 'utf8');
      vscode.window.showInformationMessage(
        `Project tree exported: ${path.basename(uri.fsPath)}`
      );
    })
  );
}

async function buildTree() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage('Open a folder or workspace in VS Code first.');
    return null;
  }

  const activeFile = vscode.window.activeTextEditor?.document.uri.fsPath;
  const activeWorkspace = activeFile
    ? workspaceFolders.find(folder => {
        const root = folder.uri.fsPath;
        return activeFile === root || activeFile.startsWith(root + path.sep);
      })
    : undefined;

  const root = (activeWorkspace || workspaceFolders[0]).uri.fsPath;
  const rootName = path.basename(root) || root;
  const config = vscode.workspace.getConfiguration('projectTree');
  const maxDepth = config.get('maxDepth', 8);
  const includeFiles = config.get('includeFiles', true);
  const excludedNames = new Set(config.get('exclude', []));
  const lines = [`${rootName}/`];

  async function walk(directory, prefix, depth) {
    if (depth >= maxDepth) return;

    let entries;
    try {
      entries = await fs.readdir(directory, { withFileTypes: true });
    } catch (error) {
      vscode.window.showWarningMessage(
        `Could not read folder "${directory}": ${error.message}`
      );
      return;
    }

    entries = entries
      .filter(entry => !excludedNames.has(entry.name))
      .filter(entry => includeFiles || entry.isDirectory())
      .sort((a, b) => {
        if (a.isDirectory() !== b.isDirectory()) {
          return a.isDirectory() ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      });

    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index];
      const isLast = index === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const suffix = entry.isDirectory() ? '/' : '';
      lines.push(`${prefix}${connector}${entry.name}${suffix}`);

      // Avoid following symbolic links to prevent cycles and unexpected traversal.
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        const childPrefix = prefix + (isLast ? '    ' : '│   ');
        await walk(path.join(directory, entry.name), childPrefix, depth + 1);
      }
    }
  }

  await walk(root, '', 0);
  const tree = lines.join('\\n');\n  const markdown = '# Project Tree: ' + rootName + '\\n\\n```text\\n' + tree + '\\n```\\n';\n  return { root, tree, markdown };
}

function deactivate() {}

module.exports = { activate, deactivate };
