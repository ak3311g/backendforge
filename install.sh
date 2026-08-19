#!/usr/bin/env bash
set -e

# ==============================================================================
# BackendForge Installer for Linux & macOS
# Usage: curl -fsSL https://raw.githubusercontent.com/ak3311g/backendforge/main/install.sh | bash
# ==============================================================================

OWNER="ak3311g"        # Replace with your GitHub username / org
REPO="backendforge"         # Replace with your repository name
EXE_NAME="backendforge"
INSTALL_DIR="$HOME/.backendforge/bin"

# Styling & Colors
RESET="\033[0m"
BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
YELLOW="\033[33m"
RED="\033[31m"

log_info() { echo -e "${CYAN}⚡ [BackendForge]${RESET} $1"; }
log_success() { echo -e "${GREEN}✓ [Success]${RESET} $1"; }
log_warn() { echo -e "${YELLOW}! [Notice]${RESET} $1"; }
log_error() { echo -e "${RED}✗ [Error]${RESET} $1" >&2; exit 1; }

# 1. Detect OS and Architecture
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS" in
  linux)
    PLATFORM="linux"
    ;;
  darwin)
    PLATFORM="darwin"
    ;;
  *)
    log_error "Unsupported Operating System: $OS"
    ;;
esac

case "$ARCH" in
  x86_64|amd64)
    TARGET_ARCH="x64"
    ;;
  arm64|aarch64)
    TARGET_ARCH="arm64"
    ;;
  *)
    log_error "Unsupported CPU Architecture: $ARCH"
    ;;
esac

TARGET_NAME="backendforge-${PLATFORM}-${TARGET_ARCH}.tar.gz"

log_info "Detected target: ${BOLD}${PLATFORM}-${TARGET_ARCH}${RESET}"

# 2. Get latest release tag from GitHub API
log_info "Fetching latest release information..."
LATEST_RELEASE=$(curl -fsSL "https://api.github.com/repos/${OWNER}/${REPO}/releases/latest" 2>/dev/null || true)

if [ -z "$LATEST_RELEASE" ]; then
  # Fallback to direct release URL tag if GitHub API is rate-limited
  DOWNLOAD_URL="https://github.com/${OWNER}/${REPO}/releases/latest/download/${TARGET_NAME}"
else
  DOWNLOAD_URL=$(echo "$LATEST_RELEASE" | grep "browser_download_url" | grep "$TARGET_NAME" | cut -d '"' -f 4)
fi

if [ -z "$DOWNLOAD_URL" ]; then
  DOWNLOAD_URL="https://github.com/${OWNER}/${REPO}/releases/latest/download/${TARGET_NAME}"
fi

# 3. Download & Extract Archive
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

log_info "Downloading ${TARGET_NAME}..."
curl -fSL --progress-bar "$DOWNLOAD_URL" -o "${TMP_DIR}/${TARGET_NAME}" || log_error "Failed to download asset from $DOWNLOAD_URL"

mkdir -p "$INSTALL_DIR"
tar -xzf "${TMP_DIR}/${TARGET_NAME}" -C "$TMP_DIR"

if [ ! -f "${TMP_DIR}/${EXE_NAME}" ]; then
  log_error "Binary not found in archive"
fi

cp -r "${TMP_DIR}/." "${INSTALL_DIR}/"
chmod +x "${INSTALL_DIR}/${EXE_NAME}"

log_success "BackendForge installed to ${BOLD}${INSTALL_DIR}/${EXE_NAME}${RESET}"

# 4. Configure Shell PATH
add_to_path() {
  local config_file="$1"
  local line="export PATH=\"$INSTALL_DIR:\$PATH\""

  if [ -f "$config_file" ]; then
    if ! grep -q "$INSTALL_DIR" "$config_file"; then
      echo -e "\n# BackendForge" >> "$config_file"
      echo "$line" >> "$config_file"
      log_success "Added BackendForge to ${BOLD}$config_file${RESET}"
    fi
  fi
}

CURRENT_SHELL=$(basename "$SHELL")
case "$CURRENT_SHELL" in
  zsh)
    add_to_path "$HOME/.zshrc"
    ;;
  bash)
    if [ -f "$HOME/.bashrc" ]; then
      add_to_path "$HOME/.bashrc"
    elif [ -f "$HOME/.bash_profile" ]; then
      add_to_path "$HOME/.bash_profile"
    fi
    ;;
  fish)
    FISH_CONF="$HOME/.config/fish/config.fish"
    if [ -f "$FISH_CONF" ] && ! grep -q "$INSTALL_DIR" "$FISH_CONF"; then
      echo -e "\n# BackendForge" >> "$FISH_CONF"
      echo "fish_add_path $INSTALL_DIR" >> "$FISH_CONF"
      log_success "Added BackendForge to ${BOLD}$FISH_CONF${RESET}"
    fi
    ;;
  *)
    log_warn "Could not auto-detect shell config. Add this to your environment:"
    echo -e "  ${BOLD}export PATH=\"$INSTALL_DIR:\$PATH\"${RESET}"
    ;;
esac

echo ""
log_info "Run ${BOLD}backendforge${RESET} or open a new terminal session to get started! 🚀"