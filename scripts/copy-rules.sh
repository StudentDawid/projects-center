#!/bin/bash

# Script to copy AI rules to different AI tools configuration folders
# Supported: Cursor, GitHub Copilot, Google Antigravity
# Automatically adds appropriate headers based on file location

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RULES_SOURCE="$PROJECT_ROOT/rules-ai/rules"
BACKUP_DIR="$PROJECT_ROOT/rules-ai/backups"

# Define destination paths
CURSOR_DEST="$PROJECT_ROOT/.cursor/rules"
COPILOT_DEST="$PROJECT_ROOT/.github/instructions/"
ANTIGRAVITY_DEST="$PROJECT_ROOT/.agent/rules"

# Define header files
CURSOR_HEADERS="$PROJECT_ROOT/rules-ai/cursor-headers.md"
GITHUB_HEADERS="$PROJECT_ROOT/rules-ai/github-headers.md"
ANTIGRAVITY_HEADERS="$PROJECT_ROOT/rules-ai/antigravity-headers.md"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to extract header by name from header file
extract_header() {
    local header_file="$1"
    local header_name="$2"
    
    awk -v name="$header_name" '
        /^---$/ { 
            in_header = !in_header
            if (in_header) { 
                buffer = "---\n"
                next 
            }
        }
        in_header { 
            buffer = buffer $0 "\n" 
        }
        !in_header && buffer != "" {
            if (buffer ~ "name: " name) {
                printf "%s---\n\n", buffer
                exit
            }
            buffer = ""
        }
    ' "$header_file"
}

# Function to determine which header to use based on file path
get_header_name() {
    local file_path="$1"
    
    # Extract relative path from rules directory
    local rel_path="${file_path#$RULES_SOURCE/}"
    
    # Determine header based on path
    if [[ "$rel_path" == "general.md" ]] || [[ "$rel_path" == general-rules/* ]]; then
        echo "Global components Rule"
    elif [[ "$rel_path" == react/* ]]; then
        echo "React Components Rule"
    elif [[ "$rel_path" == vue/* ]]; then
        echo "Vue Components Rule"
    elif [[ "$rel_path" == tests/* ]]; then
        echo "Tests Rule"
    else
        echo ""
    fi
}

# Function to copy file with header
copy_file_with_header() {
    local source_file="$1"
    local dest_file="$2"
    local header_file="$3"
    local tool_folder="$4"
    
    # Get header name based on source file path
    local header_name=$(get_header_name "$source_file")
    
    # Create destination directory
    mkdir -p "$(dirname "$dest_file")"
    
    # Prepare new content in temp file
    local temp_file=$(mktemp)
    
    if [[ -n "$header_name" ]] && [[ -f "$header_file" ]]; then
        # Extract and prepend header
        local header=$(extract_header "$header_file" "$header_name")
        if [[ -n "$header" ]]; then
            echo "$header" > "$temp_file"
            cat "$source_file" >> "$temp_file"
        else
            # No header found, copy content as-is
            cat "$source_file" > "$temp_file"
        fi
    else
        # No header needed or header file doesn't exist
        cat "$source_file" > "$temp_file"
    fi
    
    # Check if destination file exists and is different
    if [[ -f "$dest_file" ]]; then
        if ! cmp -s "$temp_file" "$dest_file"; then
            # Files are different - create backup
            mkdir -p "$BACKUP_DIR"
            
            # Extract relative path and create backup name
            local rel_path="${source_file#$RULES_SOURCE/}"
            local rel_dir=$(dirname "$rel_path")
            local filename=$(basename "$rel_path")
            
            # Replace slashes with dashes for flat backup structure
            local backup_name="${tool_folder}-${rel_dir//\//-}-${filename}-$(date +%Y%m%d-%H%M%S)"
            local backup_file="$BACKUP_DIR/$backup_name"
            
            cp "$dest_file" "$backup_file"
            echo -e "${YELLOW}    📦 Backup: $backup_name${NC}"
            
            # Copy new version
            mv "$temp_file" "$dest_file"
            
            if [[ -n "$header_name" ]] && [[ -n "$header" ]]; then
                echo -e "${CYAN}    ✓ Updated with header: $header_name${NC}"
            else
                echo -e "${CYAN}    ✓ Updated${NC}"
            fi
        else
            # Files are identical - skip
            rm "$temp_file"
            echo -e "${GREEN}    ⏭️  No changes needed${NC}"
        fi
    else
        # New file - just copy
        mv "$temp_file" "$dest_file"
        if [[ -n "$header_name" ]] && [[ -n "$header" ]]; then
            echo -e "${CYAN}    ✓ Added header: $header_name${NC}"
        else
            echo -e "${CYAN}    ✓ Created${NC}"
        fi
    fi
}

# Function to copy rules to destination
copy_rules() {
    local dest="$1"
    local tool_name="$2"
    local header_file="$3"
    
    echo -e "${BLUE}📋 Copying rules to $tool_name...${NC}"
    
    # Check if header file exists
    if [[ ! -f "$header_file" ]]; then
        echo -e "${YELLOW}⚠️  Warning: Header file not found: $header_file${NC}"
        echo -e "${YELLOW}    Files will be copied without headers${NC}"
    fi
    
    # Create destination directory if it doesn't exist
    mkdir -p "$dest"
    
    # Find all markdown files and copy them with headers
    local file_count=0
    while IFS= read -r -d '' source_file; do
        # Calculate relative path and destination
        local rel_path="${source_file#$RULES_SOURCE/}"
        local dest_file="$dest/$rel_path"
        
        echo -e "${CYAN}  Copying: $rel_path${NC}"
        
        # Copy file with appropriate header
        copy_file_with_header "$source_file" "$dest_file" "$header_file" "$tool_name"
        
        ((file_count++))
    done < <(find "$RULES_SOURCE" -type f -name "*.md" -print0)
    
    # Copy any non-markdown files as-is (if any)
    while IFS= read -r -d '' source_file; do
        local rel_path="${source_file#$RULES_SOURCE/}"
        local dest_file="$dest/$rel_path"
        mkdir -p "$(dirname "$dest_file")"
        cp "$source_file" "$dest_file"
        ((file_count++))
    done < <(find "$RULES_SOURCE" -type f ! -name "*.md" -print0)
    
    echo -e "${GREEN}✅ Copied $file_count file(s) to $dest${NC}"
    echo ""
}

# Main execution
echo -e "${BLUE}🚀 AI Rules Sync Script with Headers${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if rules source exists
if [ ! -d "$RULES_SOURCE" ]; then
    echo -e "${YELLOW}❌ Error: Rules source not found at $RULES_SOURCE${NC}"
    exit 1
fi

echo -e "${BLUE}Source: $RULES_SOURCE${NC}"
echo ""

# Determine which destinations to copy to
if [ $# -eq 0 ]; then
    # No arguments: copy to all
    TARGETS=("all")
else
    # User specified targets
    TARGETS=("$@")
fi

# Process targets
for target in "${TARGETS[@]}"; do
    case "$target" in
        cursor|c)
            copy_rules "$CURSOR_DEST" "Cursor" "$CURSOR_HEADERS"
            ;;
        copilot|gh)
            copy_rules "$COPILOT_DEST" "GitHub Copilot" "$GITHUB_HEADERS"
            ;;
        antigravity|ga|google)
            copy_rules "$ANTIGRAVITY_DEST" "Google Antigravity" "$ANTIGRAVITY_HEADERS"
            ;;
        all)
            copy_rules "$CURSOR_DEST" "Cursor" "$CURSOR_HEADERS"
            copy_rules "$COPILOT_DEST" "GitHub Copilot" "$GITHUB_HEADERS"
            copy_rules "$ANTIGRAVITY_DEST" "Google Antigravity" "$ANTIGRAVITY_HEADERS"
            ;;
        *)
            echo -e "${YELLOW}⚠️  Unknown target: $target${NC}"
            echo "Usage: $0 [cursor|copilot|antigravity|all]"
            echo ""
            echo "Examples:"
            echo "  $0              # Copy to all"
            echo "  $0 cursor       # Copy to Cursor only"
            echo "  $0 copilot ga   # Copy to Copilot and Antigravity"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ All rules successfully synced!${NC}"
echo ""
echo "📂 Destinations:"
echo "  • Cursor:              $CURSOR_DEST"
echo "  • GitHub Copilot:      $COPILOT_DEST"
echo "  • Google Antigravity:  $ANTIGRAVITY_DEST"
echo ""
echo -e "${CYAN}📋 Header mapping:${NC}"
echo "  • general.md + general-rules/* → Global components Rule"
echo "  • react/*                      → React Components Rule"
echo "  • vue/*                        → Vue Components Rule"
echo "  • tests/*                      → Tests Rule"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "  1. Configure your AI tools to use the rules from these directories"
echo "  2. For Cursor: Check .cursor/rules/"
echo "  3. For Copilot: Check .github/instructions/"
echo "  4. For Antigravity: Check .agent/rules/"
