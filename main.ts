import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

interface ExternalCodeblockSettings {
  terminalCommand: string[];
}

const DEFAULT_SETTINGS: ExternalCodeblockSettings = {
  terminalCommand: ['/opt/homebrew/bin/alacritty', '-e', 'zsh', '-c', 'nvim']
}

interface CodeblockInfo {
  content: string;
  startLine: number;
  endLine: number;
  language: string;
}

export default class ExternalCodeblockPlugin extends Plugin {
  settings: ExternalCodeblockSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'edit-codeblock-externally',
      name: 'Edit codeblock in external editor',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        this.editCodeblockExternally(editor);
      }
    });

    this.addSettingTab(new ExternalCodeblockSettingTab(this.app, this));
  }

  private findCodeblockAtCursor(editor: Editor): CodeblockInfo | null {
    const cursor = editor.getCursor();
    const content = editor.getValue();
    const lines = content.split('\n');

    let startLine = -1;
    let endLine = -1;
    let language = '';

    for (let i = cursor.line; i >= 0; i--) {
      const line = lines[i];
      const codeblockMatch = line.match(/```(\w*)/);
      if (codeblockMatch) {
        startLine = i;
        language = codeblockMatch[1] || '';
        break;
      }
    }

    if (startLine === -1) return null;

    for (let i = cursor.line + 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('```') && !line.match(/```\w/)) {
        endLine = i;
        break;
      }
    }

    if (endLine === -1) return null;

    const codeContent = lines.slice(startLine + 1, endLine).join('\n');

    return {
      content: codeContent,
      startLine,
      endLine,
      language
    };
  }

  private async editCodeblockExternally(editor: Editor) {
    const codeblock = this.findCodeblockAtCursor(editor);

    if (!codeblock) {
      new Notice('No codeblock found at cursor position');
      return;
    }

    const tempFileName = `obsidian-codeblock-${Date.now()}.${this.getFileExtension(codeblock.language)}`;
    const tempFilePath = join(tmpdir(), tempFileName);

    try {
      writeFileSync(tempFilePath, codeblock.content, 'utf8');

      await new Promise<void>((resolve, reject) => {
        const [command, ...args] = this.settings.terminalCommand;

        // Check if this looks like a shell command (contains -c flag)
        const isShellCommand = args.includes('-c');

        let finalArgs;
        if (isShellCommand) {
          // For shell commands, append file path to the editor command
          const modifiedArgs = [...args];
          const lastArgIndex = modifiedArgs.length - 1;
          modifiedArgs[lastArgIndex] = `${modifiedArgs[lastArgIndex]} "${tempFilePath}"`;
          finalArgs = modifiedArgs;
        } else {
          // For direct editor commands, just append the file path as a separate argument
          finalArgs = [...args, tempFilePath];
        }

        const nvim = spawn(command, finalArgs, {
          detached: true,
          env: { ...process.env, PATH: process.env.PATH }
        });

        nvim.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`External editor exited with code ${code}`));
          }
        });

        nvim.on('error', (error) => {
          reject(error);
        });
      });

      const editedContent = readFileSync(tempFilePath, 'utf8').replace(/\n$/, '');

      const cursor = editor.getCursor();
      
      const lines = editor.getValue().split('\n');
      const newLines = [
        ...lines.slice(0, codeblock.startLine + 1),
        ...editedContent.split('\n'),
        ...lines.slice(codeblock.endLine)
      ];

      editor.setValue(newLines.join('\n'));
      
      editor.setCursor(cursor);

      new Notice('Codeblock updated successfully');

    } catch (error) {
      new Notice(`Error editing with external editor: ${error.message}`);
    } finally {
      try {
        unlinkSync(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  private getFileExtension(language: string): string {
    const extensions: { [key: string]: string } = {
      'javascript': 'js',
      'js': 'js',
      'typescript': 'ts',
      'ts': 'ts',
      'python': 'py',
      'py': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'rust': 'rs',
      'rs': 'rs',
      'go': 'go',
      'golang': 'go',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'json': 'json',
      'yaml': 'yml',
      'yml': 'yml',
      'xml': 'xml',
      'sql': 'sql',
      'bash': 'sh',
      'shell': 'sh',
      'sh': 'sh',
      'zsh': 'sh',
      'fish': 'fish',
      'php': 'php',
      'ruby': 'rb',
      'rb': 'rb',
      'swift': 'swift',
      'kotlin': 'kt',
      'scala': 'scala',
      'clojure': 'clj',
      'haskell': 'hs',
      'lua': 'lua',
      'perl': 'pl',
      'r': 'r',
      'matlab': 'm',
      'vue': 'vue',
      'svelte': 'svelte',
      'jsx': 'jsx',
      'tsx': 'tsx',
      'markdown': 'md',
      'md': 'md'
    };

    return extensions[language.toLowerCase()] || 'txt';
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class ExternalCodeblockSettingTab extends PluginSettingTab {
  plugin: ExternalCodeblockPlugin;

  constructor(app: App, plugin: ExternalCodeblockPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const {containerEl} = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Terminal Command')
      .setDesc('Full terminal command as JSON array including editor. See README for examples.')
      .addTextArea(text => text
        .setPlaceholder('["/opt/homebrew/bin/alacritty", "-e", "zsh", "-c", "nvim"]')
        .setValue(JSON.stringify(this.plugin.settings.terminalCommand))
        .onChange(async (value) => {
          try {
            this.plugin.settings.terminalCommand = JSON.parse(value);
            await this.plugin.saveSettings();
          } catch (e) {
            // Invalid JSON, ignore
          }
        }));
  }
}
