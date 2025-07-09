#!/bin/bash

# Cursor Extensions Installation Script for theyaz.io project
echo "🚀 Installing Cursor extensions for theyaz.io project..."

# Theme & Visual Extensions
echo "📦 Installing theme and visual extensions..."
cursor --install-extension zhuangtongfa.Material-theme
cursor --install-extension PKief.material-icon-theme

# React/TypeScript Extensions
echo "⚛️ Installing React/TypeScript extensions..."
cursor --install-extension dsznajder.es7-react-js-snippets
cursor --install-extension pmneo.tsimporter
cursor --install-extension formulahendry.auto-rename-tag

# Tailwind CSS Extensions
echo "🎨 Installing Tailwind CSS extensions..."
cursor --install-extension bradlc.vscode-tailwindcss
cursor --install-extension tailwindcss.vscode-tailwindcss

# Testing Extensions
echo "🧪 Installing testing extensions..."
cursor --install-extension ZixuanChen.vitest-explorer
cursor --install-extension ryanluker.vscode-coverage-gutters

# Database & Backend Extensions
echo "🗄️ Installing database extensions..."
cursor --install-extension supabase.supabase
cursor --install-extension mtxr.sqltools

# Fun & Productivity Extensions
echo "🎪 Installing fun and productivity extensions..."
cursor --install-extension 2gua.rainbow-brackets
cursor --install-extension oderwat.indent-rainbow
cursor --install-extension usernamehw.errorlens
cursor --install-extension eamodio.gitlens
cursor --install-extension hoovercj.vscode-power-mode
cursor --install-extension naumovs.color-highlight

# Learning & Documentation Extensions
echo "📚 Installing learning and documentation extensions..."
cursor --install-extension yzhang.markdown-all-in-one
cursor --install-extension shd101wyy.markdown-preview-enhanced
cursor --install-extension vsls-contrib.codetour
cursor --install-extension WallabyJs.quokka-vscode

# API Testing & Development Extensions
echo "🔌 Installing API testing and development extensions..."
cursor --install-extension humao.rest-client
cursor --install-extension ms-azuretools.vscode-docker

# Fun & Visual Extensions
echo "🎨 Installing fun and visual extensions..."
cursor --install-extension johnpapa.vscode-peacock

echo "✅ All extensions installed successfully!"
echo "🔄 Please restart Cursor to activate all extensions."
echo ""
echo "🎯 Your theyaz.io development environment is now supercharged!" 