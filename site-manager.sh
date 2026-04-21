#!/usr/bin/env bash
# ============================================================================
# COASTAL KEY SITE MANAGER
# Terminal tool for editing ceo.html from the command line
# Usage: ./site-manager.sh [command] [options]
# ============================================================================

set -euo pipefail

SITE_FILE="$(cd "$(dirname "$0")" && pwd)/ceo.html"
BACKUP_DIR="$(cd "$(dirname "$0")" && pwd)/.site-backups"

# Colors
GOLD='\033[38;2;201;168;76m'
NAVY='\033[38;2;11;29;58m'
WHITE='\033[1;37m'
DIM='\033[2m'
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
RESET='\033[0m'

# ── Helpers ──────────────────────────────────────────────────────────────────

banner() {
  echo ""
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "${WHITE}  COASTAL KEY SITE MANAGER${RESET}"
  echo -e "${DIM}  Terminal control for ceo.html${RESET}"
  echo -e "${GOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
}

backup() {
  mkdir -p "$BACKUP_DIR"
  local ts
  ts=$(date +%Y%m%d_%H%M%S)
  cp "$SITE_FILE" "$BACKUP_DIR/ceo_${ts}.html"
  echo -e "${DIM}Backup saved: .site-backups/ceo_${ts}.html${RESET}"
}

confirm() {
  read -rp "$(echo -e "${GOLD}Apply this change? [y/N]: ${RESET}")" yn
  case "$yn" in [yY]|[yY][eE][sS]) return 0 ;; *) echo "Cancelled."; return 1 ;; esac
}

# ── Commands ─────────────────────────────────────────────────────────────────

cmd_help() {
  banner
  echo -e "${WHITE}COMMANDS:${RESET}"
  echo ""
  echo -e "  ${CYAN}show${RESET}                          Show current editable content summary"
  echo -e "  ${CYAN}edit-name${RESET} <new name>          Change the hero name (h1)"
  echo -e "  ${CYAN}edit-title${RESET} <new title>        Change the hero title/subtitle"
  echo -e "  ${CYAN}edit-overline${RESET} <new text>      Change the hero overline text"
  echo -e "  ${CYAN}edit-statement${RESET} <new text>     Change the hero statement paragraph"
  echo -e "  ${CYAN}edit-phone${RESET} <new number>       Change the CTA phone number"
  echo -e "  ${CYAN}edit-cta-heading${RESET} <new text>   Change the CTA heading"
  echo -e "  ${CYAN}edit-cta-text${RESET} <new text>      Change the CTA description"
  echo -e "  ${CYAN}edit-metric${RESET} <index> <value>   Change a governance metric (1-5)"
  echo -e "  ${CYAN}edit-credential${RESET} <index> <val> Change a credential value (1-4)"
  echo -e "  ${CYAN}edit-section-heading${RESET} <id> <t> Change a section heading by keyword"
  echo -e "  ${CYAN}add-credential${RESET} <label> <val> <detail>  Add a new credential card"
  echo -e "  ${CYAN}remove-nav-link${RESET} <text>        Remove a nav link by its text"
  echo -e "  ${CYAN}add-nav-link${RESET} <text> <url>     Add a nav link"
  echo -e "  ${CYAN}replace${RESET} <old> <new>           Find and replace any text"
  echo -e "  ${CYAN}preview${RESET}                       Open in default browser"
  echo -e "  ${CYAN}diff${RESET}                          Show uncommitted changes"
  echo -e "  ${CYAN}restore${RESET}                       Restore from latest backup"
  echo -e "  ${CYAN}deploy${RESET}                        Git commit and push changes"
  echo -e "  ${CYAN}publish${RESET}                       Deploy live to Cloudflare Pages"
  echo -e "  ${CYAN}ship${RESET}                          Deploy + publish in one step"
  echo ""
  echo -e "${DIM}Examples:${RESET}"
  echo "  ./site-manager.sh edit-name \"David A. Hauer\""
  echo "  ./site-manager.sh edit-phone \"(772) 555-1234\""
  echo "  ./site-manager.sh edit-metric 1 \"35%+\""
  echo "  ./site-manager.sh replace \"Stuart, FL 34997\" \"Palm City, FL 34990\""
  echo "  ./site-manager.sh deploy \"Updated hero section\""
  echo "  ./site-manager.sh publish"
  echo "  ./site-manager.sh ship \"Updated CTA and metrics\""
  echo ""
}

cmd_show() {
  banner
  echo -e "${WHITE}CURRENT CONTENT:${RESET}"
  echo ""

  echo -e "${GOLD}Hero Overline:${RESET}"
  grep -oP '(?<=hero-overline">).*?(?=</div>)' "$SITE_FILE" | sed 's/&amp;/\&/g'
  echo ""

  echo -e "${GOLD}Hero Name:${RESET}"
  grep -oP '(?<=hero-name">).*?(?=</h1>)' "$SITE_FILE"
  echo ""

  echo -e "${GOLD}Hero Title:${RESET}"
  grep -oP '(?<=hero-title">).*?(?=</p>)' "$SITE_FILE"
  echo ""

  echo -e "${GOLD}Hero Statement:${RESET}"
  sed -n '/<p class="hero-statement">/,/<\/p>/p' "$SITE_FILE" | sed 's/<[^>]*>//g' | xargs
  echo ""

  echo -e "${GOLD}CTA Heading:${RESET}"
  grep -oP '(?<=cta-heading">).*?(?=</h2>)' "$SITE_FILE"
  echo ""

  echo -e "${GOLD}CTA Phone:${RESET}"
  grep -oP '(?<=tel:)[^"]+' "$SITE_FILE" | head -1
  echo ""

  echo -e "${GOLD}Governance Metrics:${RESET}"
  grep -oP '(?<=metric-number">).*?(?=</div>)' "$SITE_FILE" | nl -ba
  echo ""

  echo -e "${GOLD}Credentials:${RESET}"
  grep -oP '(?<=cred-value">).*?(?=</div>)' "$SITE_FILE" | nl -ba
  echo ""

  echo -e "${GOLD}Nav Links:${RESET}"
  grep -oP '<a href="[^"]+">([^<]+)' "$SITE_FILE" | sed 's/<a href="/  /;s/">/  ->  /' | grep -v "nav-logo\|cta-btn\|tel:" || true
  echo ""
}

cmd_edit_name() {
  local new_name="$*"
  [ -z "$new_name" ] && { echo -e "${RED}Usage: edit-name <new name>${RESET}"; exit 1; }
  local old_name
  old_name=$(grep -oP '(?<=hero-name">).*?(?=</h1>)' "$SITE_FILE")
  echo -e "Changing name: ${RED}${old_name}${RESET} -> ${GREEN}${new_name}${RESET}"
  confirm || return
  backup
  sed -i "s|<h1 class=\"hero-name\">.*</h1>|<h1 class=\"hero-name\">${new_name}</h1>|" "$SITE_FILE"
  echo -e "${GREEN}Done.${RESET}"
}

cmd_edit_title() {
  local new_title="$*"
  [ -z "$new_title" ] && { echo -e "${RED}Usage: edit-title <new title>${RESET}"; exit 1; }
  local old_title
  old_title=$(grep -oP '(?<=hero-title">).*?(?=</p>)' "$SITE_FILE")
  echo -e "Changing title: ${RED}${old_title}${RESET} -> ${GREEN}${new_title}${RESET}"
  confirm || return
  backup
  sed -i "s|<p class=\"hero-title\">.*</p>|<p class=\"hero-title\">${new_title}</p>|" "$SITE_FILE"
  echo -e "${GREEN}Done.${RESET}"
}

cmd_edit_overline() {
  local new_text="$*"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: edit-overline <new text>${RESET}"; exit 1; }
  backup
  sed -i "s|<div class=\"hero-overline\">.*</div>|<div class=\"hero-overline\">${new_text}</div>|" "$SITE_FILE"
  echo -e "${GREEN}Overline updated.${RESET}"
}

cmd_edit_statement() {
  local new_text="$*"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: edit-statement <new text>${RESET}"; exit 1; }
  echo -e "New statement: ${GREEN}${new_text}${RESET}"
  confirm || return
  backup
  # Replace multiline statement content
  python3 -c "
import re, sys
with open('$SITE_FILE', 'r') as f:
    content = f.read()
content = re.sub(
    r'(<p class=\"hero-statement\">\s*)\n.*?\n(\s*</p>)',
    r'\1\n        ${new_text}\n\2',
    content, flags=re.DOTALL)
with open('$SITE_FILE', 'w') as f:
    f.write(content)
"
  echo -e "${GREEN}Statement updated.${RESET}"
}

cmd_edit_phone() {
  local new_phone="$*"
  [ -z "$new_phone" ] && { echo -e "${RED}Usage: edit-phone <number>${RESET}"; exit 1; }
  local digits
  digits=$(echo "$new_phone" | tr -dc '0-9')
  backup
  # Update display number
  local old_display
  old_display=$(grep -oP '(?<=Or call directly: <a href="tel:\+1[0-9]+">).*?(?=</a>)' "$SITE_FILE")
  echo -e "Changing phone: ${RED}${old_display}${RESET} -> ${GREEN}${new_phone}${RESET}"
  confirm || return
  sed -i "s|tel:+1[0-9]*\"|tel:+1${digits}\"|" "$SITE_FILE"
  sed -i "s|>${old_display}</a>|>${new_phone}</a>|" "$SITE_FILE"
  echo -e "${GREEN}Phone updated.${RESET}"
}

cmd_edit_cta_heading() {
  local new_text="$*"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: edit-cta-heading <text>${RESET}"; exit 1; }
  backup
  sed -i "s|<h2 class=\"cta-heading\">.*</h2>|<h2 class=\"cta-heading\">${new_text}</h2>|" "$SITE_FILE"
  echo -e "${GREEN}CTA heading updated.${RESET}"
}

cmd_edit_cta_text() {
  local new_text="$*"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: edit-cta-text <text>${RESET}"; exit 1; }
  backup
  python3 -c "
import re
with open('$SITE_FILE', 'r') as f:
    content = f.read()
content = re.sub(
    r'(<p class=\"cta-sub\">\s*)\n.*?\n(\s*</p>)',
    r'\1\n      ${new_text}\n\2',
    content, flags=re.DOTALL)
with open('$SITE_FILE', 'w') as f:
    f.write(content)
"
  echo -e "${GREEN}CTA text updated.${RESET}"
}

cmd_edit_metric() {
  local index="$1"; shift
  local new_val="$*"
  [ -z "$new_val" ] && { echo -e "${RED}Usage: edit-metric <1-5> <value>${RESET}"; exit 1; }
  backup
  python3 -c "
import re
with open('$SITE_FILE', 'r') as f:
    content = f.read()
matches = list(re.finditer(r'<div class=\"metric-number\">(.*?)</div>', content))
idx = ${index} - 1
if idx < 0 or idx >= len(matches):
    print('Invalid metric index. Use 1-' + str(len(matches)))
    exit(1)
old = matches[idx].group(1)
start, end = matches[idx].start(), matches[idx].end()
content = content[:start] + '<div class=\"metric-number\">${new_val}</div>' + content[end:]
with open('$SITE_FILE', 'w') as f:
    f.write(content)
print(f'Metric {${index}} changed: {old} -> ${new_val}')
"
  echo -e "${GREEN}Done.${RESET}"
}

cmd_edit_credential() {
  local index="$1"; shift
  local new_val="$*"
  [ -z "$new_val" ] && { echo -e "${RED}Usage: edit-credential <1-4> <value>${RESET}"; exit 1; }
  backup
  python3 -c "
import re
with open('$SITE_FILE', 'r') as f:
    content = f.read()
matches = list(re.finditer(r'<div class=\"cred-value\">(.*?)</div>', content))
idx = ${index} - 1
if idx < 0 or idx >= len(matches):
    print('Invalid credential index. Use 1-' + str(len(matches)))
    exit(1)
old = matches[idx].group(1)
start, end = matches[idx].start(), matches[idx].end()
content = content[:start] + '<div class=\"cred-value\">${new_val}</div>' + content[end:]
with open('$SITE_FILE', 'w') as f:
    f.write(content)
print(f'Credential {${index}} changed: {old} -> ${new_val}')
"
  echo -e "${GREEN}Done.${RESET}"
}

cmd_add_credential() {
  local label="$1"
  local value="$2"
  local detail="$3"
  [ -z "$detail" ] && { echo -e "${RED}Usage: add-credential <label> <value> <detail>${RESET}"; exit 1; }
  backup
  local card="        <div class=\"cred-card\">\n          <div class=\"cred-label\">${label}<\/div>\n          <div class=\"cred-value\">${value}<\/div>\n          <div class=\"cred-detail\">${detail}<\/div>\n        <\/div>"
  sed -i "/<\/div><!-- end cred-grid -->/i\\${card}" "$SITE_FILE" 2>/dev/null || \
  python3 -c "
with open('$SITE_FILE', 'r') as f:
    content = f.read()
insert_point = content.rfind('</div>', 0, content.find('<!-- PHILOSOPHY -->'))
# Find last cred-card closing div
import re
cards = list(re.finditer(r'</div>\s*</div>\s*</div>\s*</div>\s*<!-- PHILOSOPHY', content))
if not cards:
    cards = list(re.finditer(r'(</div>\s*){2}</div>\s*</div>', content))
# Just insert before the closing of cred-grid
last_card_end = content.rfind('</div>', 0, content.find('<!-- PHILOSOPHY'))
new_card = '''        <div class=\"cred-card\">
          <div class=\"cred-label\">${label}</div>
          <div class=\"cred-value\">${value}</div>
          <div class=\"cred-detail\">${detail}</div>
        </div>
'''
# Find the last </div> of the last cred-card
pattern = r'(</div>\s*</div>\s*</div>\s*</div>\s*</div>\s*</div>)'
# Simpler: insert before closing of the cred-grid parent
content = content.replace('</div>\n    </div>\n  </div>\n\n  <!-- PHILOSOPHY', new_card + '      </div>\n    </div>\n  </div>\n\n  <!-- PHILOSOPHY')
with open('$SITE_FILE', 'w') as f:
    f.write(content)
"
  echo -e "${GREEN}Credential card added.${RESET}"
}

cmd_replace() {
  local old_text="$1"
  local new_text="$2"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: replace <old text> <new text>${RESET}"; exit 1; }
  local count
  count=$(grep -c "$old_text" "$SITE_FILE" 2>/dev/null || echo 0)
  echo -e "Found ${WHITE}${count}${RESET} occurrence(s) of: ${RED}${old_text}${RESET}"
  [ "$count" -eq 0 ] && { echo "Nothing to replace."; exit 0; }
  echo -e "Replacing with: ${GREEN}${new_text}${RESET}"
  confirm || return
  backup
  sed -i "s|${old_text}|${new_text}|g" "$SITE_FILE"
  echo -e "${GREEN}Replaced ${count} occurrence(s).${RESET}"
}

cmd_add_nav_link() {
  local text="$1"
  local url="$2"
  [ -z "$url" ] && { echo -e "${RED}Usage: add-nav-link <text> <url>${RESET}"; exit 1; }
  backup
  sed -i "/<\/ul>/i\\      <li><a href=\"${url}\">${text}</a></li>" "$SITE_FILE"
  echo -e "${GREEN}Nav link added: ${text} -> ${url}${RESET}"
}

cmd_remove_nav_link() {
  local text="$*"
  [ -z "$text" ] && { echo -e "${RED}Usage: remove-nav-link <link text>${RESET}"; exit 1; }
  backup
  sed -i "/<li><a href=\"[^\"]*\">${text}<\/a><\/li>/d" "$SITE_FILE"
  echo -e "${GREEN}Nav link '${text}' removed.${RESET}"
}

cmd_edit_section_heading() {
  local keyword="$1"; shift
  local new_text="$*"
  [ -z "$new_text" ] && { echo -e "${RED}Usage: edit-section-heading <keyword> <new heading>${RESET}"; exit 1; }
  backup
  python3 -c "
import re
with open('$SITE_FILE', 'r') as f:
    content = f.read()
matches = list(re.finditer(r'<h2 class=\"section-heading\">(.*?)</h2>', content))
for m in matches:
    if '${keyword}'.lower() in m.group(1).lower():
        old = m.group(1)
        content = content[:m.start()] + '<h2 class=\"section-heading\">${new_text}</h2>' + content[m.end():]
        print(f'Changed: {old} -> ${new_text}')
        break
else:
    print('No section heading containing \"${keyword}\" found.')
    exit(1)
with open('$SITE_FILE', 'w') as f:
    f.write(content)
"
  echo -e "${GREEN}Done.${RESET}"
}

cmd_preview() {
  if command -v xdg-open &>/dev/null; then
    xdg-open "$SITE_FILE"
  elif command -v open &>/dev/null; then
    open "$SITE_FILE"
  else
    echo -e "Open in browser: ${CYAN}file://${SITE_FILE}${RESET}"
  fi
}

cmd_diff() {
  cd "$(dirname "$SITE_FILE")"
  git diff -- ceo.html
}

cmd_restore() {
  local latest
  latest=$(ls -t "$BACKUP_DIR"/ceo_*.html 2>/dev/null | head -1)
  [ -z "$latest" ] && { echo -e "${RED}No backups found.${RESET}"; exit 1; }
  echo -e "Restoring from: ${CYAN}${latest}${RESET}"
  confirm || return
  cp "$latest" "$SITE_FILE"
  echo -e "${GREEN}Restored.${RESET}"
}

cmd_deploy() {
  local msg="${*:-Update ceo.html via site-manager}"
  cd "$(dirname "$SITE_FILE")"
  echo -e "${GOLD}Committing and pushing...${RESET}"
  git add ceo.html
  git commit -m "$msg"
  local branch
  branch=$(git branch --show-current)
  git push -u origin "$branch"
  echo -e "${GREEN}Deployed to ${branch}.${RESET}"
}

cmd_publish() {
  local project_dir
  project_dir="$(dirname "$SITE_FILE")"
  cd "$project_dir"
  if ! command -v wrangler &>/dev/null; then
    echo -e "${RED}wrangler not found. Install: npm install -g wrangler${RESET}"
    exit 1
  fi
  echo -e "${GOLD}Publishing to Cloudflare Pages...${RESET}"
  wrangler pages deploy . --project-name=coastalkey-pm
  echo -e "${GREEN}Live on coastalkey-pm.pages.dev${RESET}"
}

cmd_ship() {
  local msg="${*:-Update ceo.html via site-manager}"
  cmd_deploy "$msg"
  cmd_publish
}

# ── Router ───────────────────────────────────────────────────────────────────

case "${1:-help}" in
  help|--help|-h)       cmd_help ;;
  show)                 cmd_show ;;
  edit-name)            shift; cmd_edit_name "$@" ;;
  edit-title)           shift; cmd_edit_title "$@" ;;
  edit-overline)        shift; cmd_edit_overline "$@" ;;
  edit-statement)       shift; cmd_edit_statement "$@" ;;
  edit-phone)           shift; cmd_edit_phone "$@" ;;
  edit-cta-heading)     shift; cmd_edit_cta_heading "$@" ;;
  edit-cta-text)        shift; cmd_edit_cta_text "$@" ;;
  edit-metric)          shift; cmd_edit_metric "$@" ;;
  edit-credential)      shift; cmd_edit_credential "$@" ;;
  add-credential)       shift; cmd_add_credential "$@" ;;
  edit-section-heading) shift; cmd_edit_section_heading "$@" ;;
  add-nav-link)         shift; cmd_add_nav_link "$@" ;;
  remove-nav-link)      shift; cmd_remove_nav_link "$@" ;;
  replace)              shift; cmd_replace "$@" ;;
  preview)              cmd_preview ;;
  diff)                 cmd_diff ;;
  restore)              cmd_restore ;;
  deploy)               shift; cmd_deploy "$@" ;;
  publish)              cmd_publish ;;
  ship)                 shift; cmd_ship "$@" ;;
  *)                    echo -e "${RED}Unknown command: $1${RESET}"; cmd_help ;;
esac
