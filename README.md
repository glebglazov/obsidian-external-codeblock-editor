# External Codeblock Editor

## Why

From time to time I need to add a snippet of the code to the document I'm working on. For simple one-liners Obsidian out-of-the box expedience is feasible. For multi-line scripts though I prefer having autocompletion engine, auto-indent, LSP capabilities. All of that I have in my editor of choice - Neovim. So idea I came up with was to send snippet from the codeblock to Neovim and on exit synchronise it back to Obsidian. That is exactly what Claude Code have implemented for me while I was having my morning coffee.

## Features

- **External Editor Integration**: Open any codeblock in your preferred external editor
- **Language Detection**: Automatically detects codeblock language and creates temporary files with appropriate extensions
- **Seamless Sync**: Changes made in the external editor are automatically synced back to your Obsidian note
- **Configurable Terminal Command**: Customize the terminal and editor command to match your setup
- **Wide Language Support**: Supports 30+ programming languages with proper file extensions

## Installation

### Manual Installation
1. Download the latest release files (`main.js`, `manifest.json`, `styles.css`)
2. Create a folder named `external-codeblock-editor` in your vault's `.obsidian/plugins/` directory
3. Place the downloaded files in this folder
4. Reload Obsidian and enable the plugin in Settings → Community Plugins

### Development Installation
1. Clone this repository into your vault's `.obsidian/plugins/` directory
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile the plugin
4. Reload Obsidian and enable the plugin

## Usage

1. Place your cursor anywhere inside a codeblock in your Obsidian note
2. Use the command palette (Ctrl/Cmd + P) and search for "Edit codeblock in external editor"
3. Your external editor will open with the codeblock content in a temporary file
4. Make your changes and save/close the editor
5. The changes will automatically sync back to your Obsidian note

## Configuration

Go to Settings → External Codeblock Editor to configure your terminal command.

The terminal command should be provided as a JSON array. For example:

### Common Configurations on MacOS

**Alacritty + Neovim:**
```json
["/opt/homebrew/bin/alacritty", "-e", "zsh", "-c", "nvim"]
```

**Ghostty + Nano:**
```json
["/Applications/Ghostty.app/Contents/MacOS/ghostty", "-e", "zsh", "-c", "nano"]
```

**iTerm2 + Neovim:**
```json
["/Applications/iTerm.app/Contents/MacOS/iTerm2", "-e", "nvim"]
```

**Terminal + Vim:**
```json
["/System/Applications/Utilities/Terminal.app/Contents/MacOS/Terminal", "-e", "vim"]
```

**VS Code (direct, no terminal):**
```json
["code", "--wait"]
```

**Sublime Text (direct, no terminal):**
```json
["subl", "--wait"]
```

## Supported Languages

The plugin automatically detects file extensions for:

JavaScript, TypeScript, Python, Java, C/C++, Rust, Go, HTML, CSS, SCSS, JSON, YAML, XML, SQL, Bash, Shell, PHP, Ruby, Swift, Kotlin, Scala, Clojure, Haskell, Lua, Perl, R, MATLAB, Vue, Svelte, JSX, TSX, Markdown, and more.

## Development

### Prerequisites
- Node.js (v16+)
- npm

### Commands
- `npm run dev` - Start development mode with file watching
- `npm run build` - Build for production
- `npm run version` - Bump version and update manifests

### Project Structure
- `main.ts` - Main plugin code
- `manifest.json` - Plugin manifest
- `esbuild.config.mjs` - Build configuration

## License

MIT License - see LICENSE file for details.

## Contributing

Issues and pull requests welcome! This is a simple plugin that could benefit from community improvements.
