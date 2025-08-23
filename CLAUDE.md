# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an Obsidian plugin called "External Codeblock Editor" that allows users to edit codeblocks within Obsidian notes using an external editor (configured for Neovim by default). The plugin extracts code from markdown codeblocks, opens it in a temporary file with the external editor, and syncs changes back to the original note.

## Commands
- **Development**: `npm run dev` - Starts esbuild in watch mode for development
- **Build**: `npm run build` - Runs TypeScript type checking and builds production bundle
- **Type Check**: `tsc -noEmit -skipLibCheck` - Type checking without emitting files
- **Version Bump**: `npm run version` - Updates version in manifest.json and versions.json

## Architecture
The plugin is built as a single TypeScript file (`main.ts`) that implements:

### Core Components
- **ExternalCodeblockPlugin**: Main plugin class extending Obsidian's Plugin
- **ExternalCodeblockSettingTab**: Settings UI for configuring terminal command
- **CodeblockInfo Interface**: Type definition for codeblock data (content, position, language)

### Key Functionality
- **Codeblock Detection**: `findCodeblockAtCursor()` - Searches up and down from cursor to find surrounding codeblock boundaries (``` markers)
- **External Editing**: `editCodeblockExternally()` - Creates temporary file, spawns external editor process, waits for completion, reads modified content back
- **Language Mapping**: `getFileExtension()` - Maps codeblock language identifiers to file extensions for proper syntax highlighting in external editor

### Settings System
- **terminalCommand**: Array of command and arguments to spawn external editor
- **Default**: Configured for Alacritty terminal with Neovim (`['/opt/homebrew/Caskroom/alacritty/...', '-e', 'zsh', '-c', 'nvim']`)
- Settings stored using Obsidian's built-in data persistence

### Build System
- **esbuild**: Bundles TypeScript to single JavaScript file (`main.js`)
- **External Dependencies**: Obsidian API, Electron, CodeMirror modules marked as external
- **Development**: Watch mode with inline sourcemaps
- **Production**: Minified bundle without sourcemaps

## Development Notes
- Plugin follows Obsidian's plugin structure with manifest.json defining metadata
- Uses Node.js child_process.spawn() for external editor integration
- Temporary files created in system temp directory with language-appropriate extensions
- Error handling includes cleanup of temporary files and user notifications via Obsidian's Notice system
- TypeScript configured for ES6 target with strict null checks