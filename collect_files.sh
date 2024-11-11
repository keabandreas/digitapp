#!/bin/bash

# Colors for better visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Clear screen and show header
clear
echo -e "${BLUE}==================================${NC}"
echo -e "${BLUE}      Project Files Collector      ${NC}"
echo -e "${BLUE}==================================${NC}"
echo

# Prompt for scope
echo -e "${YELLOW}Select scope to collect:${NC}"
echo "1) Full Project"
echo "2) Wiki Related"
echo "3) HostApps Related"
echo "4) Statistics Related"
echo
read -p "Enter choice (1-4): " scope_choice

# Set output file and scope check function based on choice
case $scope_choice in
    1)
        output_file="project_files.txt"
        scope_name="full project"
        is_scope_related() { return 0; }
        ;;
    2)
        output_file="wiki_files.txt"
        scope_name="wiki"
        is_scope_related() {
            local file="$1"
            [[ "$file" == *"/wiki/"* ]] && return 0
            [[ "$file" == *"wiki."* ]] && return 0
            grep -q "wiki" "$file" 2>/dev/null && return 0
            [[ "$file" == *"/ui/"* ]] && grep -q "wiki" "$file" 2>/dev/null && return 0
            return 1
        }
        ;;
    3)
        output_file="hostapps_files.txt"
        scope_name="hostapps"
        is_scope_related() {
            local file="$1"
            [[ "$file" == *"/hostapps/"* ]] && return 0
            [[ "$file" == *"hostapp"* ]] && return 0
            grep -q "hostapp" "$file" 2>/dev/null && return 0
            [[ "$file" == *"/ui/"* ]] && grep -q "hostapp" "$file" 2>/dev/null && return 0
            return 1
        }
        ;;
    4)
        output_file="statistics_files.txt"
        scope_name="statistics"
        is_scope_related() {
            local file="$1"
            [[ "$file" == *"/statistics/"* ]] && return 0
            [[ "$file" == *"statistics"* ]] && return 0
            grep -q "statistics" "$file" 2>/dev/null && return 0
            [[ "$file" == *"/ui/"* ]] && grep -q "statistics" "$file" 2>/dev/null && return 0
            return 1
        }
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

# Initialize output file
> "$output_file"

# Function to create a separator with file path
create_separator() {
    echo -e "\n=== FILE: $1 ===\n"
}

# Show progress spinner
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

echo
echo -e "${YELLOW}Collecting $scope_name files...${NC}"

# Find and process files
find . -type f \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/prisma/dev.db" \
    ! -path "*/prisma/migrations/*" \
    ! -path "*/.next/*" \
    ! -path "*/wiki.sqlite" \
    ! -path "*/project_files.txt" \
    ! -path "*/node_modules_list.txt" \
    ! -path "*/package-lock.json" \
    ! -name "*.old" \
    ! -name "*.old.old" \
    ! -name "*.bak" \
    ! -name "*.css" \
    \( -name "*.tsx" \
       -o -name "*.ts" \
       -o -name "*.js" \
       -o -name "*.json" \
       -o -name "*.prisma" \
       -o -name "Dockerfile" \
       -o -name "docker-compose.yml" \
       -o -name "*.txt" \
       -o -path "*/public/*" \
       -o -path "*/secret/*" \
    \) \
    -print0 | while IFS= read -r -d '' file; do
    # Only process files related to selected scope
    if is_scope_related "$file"; then
        create_separator "$file" >> "$output_file"
        cat "$file" >> "$output_file"
        echo -e "${GREEN}Added:${NC} $file"
    fi
done

echo
echo -e "${GREEN}Files have been compiled into ${BLUE}$output_file${NC}"

# Print summary
echo -e "\n${YELLOW}Summary of included files:${NC}"
grep "=== FILE:" "$output_file" | sed 's/=== FILE: //' | sed 's/ ===//'

# Ask if user wants to view the file
echo
echo -e "${YELLOW}Would you like to view the output file?${NC}"
echo "1) Yes"
echo "2) No"
echo
read -p "Enter choice (1-2): " view_choice

case $view_choice in
    1) 
        if command -v less >/dev/null 2>&1; then
            less "$output_file"
        else
            cat "$output_file"
        fi
        ;;
    2) exit 0 ;;
    *) echo -e "${RED}Invalid choice.${NC}" ;;
esac
