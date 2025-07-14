#!/bin/bash

# Supabase Database Backup Script
# This script backs up the theyaz_io_db database with proper error handling

# Configuration
PROJECT_REF="bkbqkpfzrqykrzzvzyrg"
BACKUP_FILE="backup_20250714.sql"
DATABASE_URL="postgresql://postgres.${PROJECT_REF}@aws-0-us-west-1.pooler.supabase.com:6543/postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if file exists
file_exists() {
    [ -f "$1" ]
}

# Function to get database password
get_database_password() {
    # Try environment variable first
    if [ -n "$SUPABASE_DB_PASSWORD" ]; then
        echo "$SUPABASE_DB_PASSWORD"
        return 0
    fi
    
    # Try .env file
    if file_exists ".env"; then
        local password=$(grep "^SUPABASE_DB_PASSWORD=" .env | cut -d'=' -f2-)
        if [ -n "$password" ]; then
            echo "$password"
            return 0
        fi
    fi
    
    # Try .env.local file
    if file_exists ".env.local"; then
        local password=$(grep "^SUPABASE_DB_PASSWORD=" .env.local | cut -d'=' -f2-)
        if [ -n "$password" ]; then
            echo "$password"
            return 0
        fi
    fi
    
    return 1
}

# Main backup function
backup_database() {
    local password="$1"
    
    print_status "Starting database backup..."
    print_status "Project: $PROJECT_REF"
    print_status "Backup file: $BACKUP_FILE"
    
    # Check if backup file already exists
    if file_exists "$BACKUP_FILE"; then
        print_warning "Backup file $BACKUP_FILE already exists!"
        read -p "Do you want to overwrite it? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Backup cancelled by user"
            exit 0
        fi
        print_status "Overwriting existing backup file..."
    fi
    
    # Create backup using pg_dump
    print_status "Creating database backup..."
    
    if PGPASSWORD="$password" pg_dump "$DATABASE_URL" > "$BACKUP_FILE" 2>/dev/null; then
        print_success "Database backup completed successfully!"
        
        # Get file size
        local file_size=$(du -h "$BACKUP_FILE" | cut -f1)
        print_status "Backup file size: $file_size"
        
        # Verify backup file
        if file_exists "$BACKUP_FILE" && [ -s "$BACKUP_FILE" ]; then
            print_success "Backup file verified successfully"
            
            # Show backup file info
            print_status "Backup file details:"
            echo "  File: $BACKUP_FILE"
            echo "  Size: $file_size"
            echo "  Created: $(date -r "$BACKUP_FILE")"
            
        else
            print_error "Backup file verification failed!"
            exit 1
        fi
        
    else
        print_error "Database backup failed!"
        print_error "Please check your database credentials and connection"
        exit 1
    fi
}

# Function to use Supabase CLI for backup
backup_with_supabase_cli() {
    print_status "Using Supabase CLI for backup..."
    
    if command_exists "supabase"; then
        print_status "Supabase CLI found, attempting backup..."
        
        if supabase db dump --linked > "$BACKUP_FILE" 2>/dev/null; then
            print_success "Database backup completed successfully using Supabase CLI!"
            
            # Get file size
            local file_size=$(du -h "$BACKUP_FILE" | cut -f1)
            print_status "Backup file size: $file_size"
            
        else
            print_error "Supabase CLI backup failed!"
            print_error "Falling back to pg_dump method..."
            return 1
        fi
        
    else
        print_error "Supabase CLI not found!"
        return 1
    fi
}

# Main script execution
main() {
    print_status "Supabase Database Backup Script"
    print_status "=================================="
    
    # Check if pg_dump is available
    if ! command_exists "pg_dump"; then
        print_error "pg_dump is not installed!"
        print_error "Please install PostgreSQL client tools"
        exit 1
    fi
    
    # Try Supabase CLI first
    if backup_with_supabase_cli; then
        exit 0
    fi
    
    # Fallback to pg_dump with password
    print_status "Using pg_dump with password authentication..."
    
    # Get database password
    local password
    if password=$(get_database_password); then
        print_status "Database password found in environment"
        backup_database "$password"
    else
        print_error "Database password not found!"
        print_error "Please set SUPABASE_DB_PASSWORD environment variable"
        print_error "or add it to your .env file"
        echo
        print_status "You can set the password with:"
        echo "  export SUPABASE_DB_PASSWORD='your_password_here'"
        echo "  or add SUPABASE_DB_PASSWORD=your_password_here to .env file"
        exit 1
    fi
}

# Run main function
main "$@" 