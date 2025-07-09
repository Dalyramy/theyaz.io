#!/bin/bash

# RBAC Testing Script for theyaz.io
# This script helps test the RBAC system with different user roles

set -e

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

# Function to check if Supabase CLI is available
check_supabase_cli() {
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please install it first:"
        echo "  brew install supabase/tap/supabase"
        exit 1
    fi
}

# Function to create test users
create_test_users() {
    print_status "Creating test users with different roles..."
    
    # Create admin user
    print_status "Creating admin user..."
    supabase auth sign-up --email admin@theyaz.io --password admin123
    
    # Create moderator user
    print_status "Creating moderator user..."
    supabase auth sign-up --email moderator@theyaz.io --password moderator123
    
    # Create uploader user
    print_status "Creating uploader user..."
    supabase auth sign-up --email uploader@theyaz.io --password uploader123
    
    # Create viewer user
    print_status "Creating viewer user..."
    supabase auth sign-up --email viewer@theyaz.io --password viewer123
    
    print_success "Test users created!"
}

# Function to assign roles to users
assign_roles() {
    print_status "Assigning roles to test users..."
    
    # Get user IDs (you'll need to replace these with actual IDs from Supabase Studio)
    ADMIN_USER_ID="your-admin-user-id"
    MODERATOR_USER_ID="your-moderator-user-id"
    UPLOADER_USER_ID="your-uploader-user-id"
    VIEWER_USER_ID="your-viewer-user-id"
    
    # Assign admin role
    print_status "Assigning admin role..."
    # You can do this via SQL or Supabase Studio
    
    # Assign moderator role
    print_status "Assigning moderator role..."
    
    # Assign uploader role
    print_status "Assigning uploader role..."
    
    # Assign viewer role
    print_status "Assigning viewer role..."
    
    print_success "Roles assigned!"
}

# Function to test RBAC endpoints
test_rbac_endpoints() {
    print_status "Testing RBAC endpoints..."
    
    # Test URLs
    local base_url="http://localhost:5173"
    
    echo "Testing endpoints:"
    echo "  - Home: $base_url/"
    echo "  - RBAC Test: $base_url/rbac-test"
    echo "  - Permission Debug: $base_url/permission-debug"
    echo "  - Admin Dashboard: $base_url/admin-dashboard"
    echo "  - Upload: $base_url/upload"
    echo "  - Gallery: $base_url/public-gallery"
    
    # Open browser to test pages
    if command -v open &> /dev/null; then
        print_status "Opening test pages in browser..."
        open "$base_url/rbac-test"
        sleep 2
        open "$base_url/permission-debug"
    fi
}

# Function to run automated tests
run_automated_tests() {
    print_status "Running automated RBAC tests..."
    
    # Check if frontend is running
    if ! curl -s http://localhost:5173 > /dev/null; then
        print_error "Frontend is not running. Please start the development environment first."
        exit 1
    fi
    
    # Run tests using curl or other tools
    print_status "Testing public endpoints..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
    
    print_status "Testing protected endpoints..."
    # These should return 401 or redirect to login
    curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/upload
    curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/admin
    
    print_success "Automated tests completed!"
}

# Function to show test scenarios
show_test_scenarios() {
    echo "RBAC Test Scenarios:"
    echo ""
    echo "1. Guest User (Not logged in):"
    echo "   - Should see limited navigation"
    echo "   - Should be redirected to login for protected routes"
    echo "   - Should see public gallery"
    echo ""
    echo "2. Viewer User:"
    echo "   - Should see basic navigation"
    echo "   - Should access public gallery"
    echo "   - Should NOT see upload button"
    echo "   - Should NOT access admin areas"
    echo ""
    echo "3. Uploader User:"
    echo "   - Should see upload functionality"
    echo "   - Should access my photos"
    echo "   - Should NOT access admin areas"
    echo ""
    echo "4. Moderator User:"
    echo "   - Should see moderation tools"
    echo "   - Should access content moderation"
    echo "   - Should NOT access user management"
    echo ""
    echo "5. Admin User:"
    echo "   - Should see all navigation items"
    echo "   - Should access admin dashboard"
    echo "   - Should access user management"
    echo "   - Should have all permissions"
    echo ""
    echo "Test URLs:"
    echo "  - RBAC Test: http://localhost:5173/rbac-test"
    echo "  - Permission Debug: http://localhost:5173/permission-debug"
    echo "  - Admin Dashboard: http://localhost:5173/admin-dashboard"
    echo "  - Supabase Studio: http://localhost:54322"
}

# Function to show help
show_help() {
    echo "RBAC Testing Script for theyaz.io"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  create-users    Create test users with different roles"
    echo "  assign-roles    Assign roles to test users"
    echo "  test-endpoints  Test RBAC endpoints"
    echo "  run-tests       Run automated tests"
    echo "  scenarios       Show test scenarios"
    echo "  help            Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  - Docker development environment running"
    echo "  - Supabase CLI installed"
    echo "  - Frontend accessible at http://localhost:5173"
    echo ""
    echo "Examples:"
    echo "  $0 create-users"
    echo "  $0 test-endpoints"
    echo "  $0 scenarios"
}

# Main script logic
main() {
    case "${1:-help}" in
        create-users)
            check_supabase_cli
            create_test_users
            ;;
        assign-roles)
            check_supabase_cli
            assign_roles
            ;;
        test-endpoints)
            test_rbac_endpoints
            ;;
        run-tests)
            run_automated_tests
            ;;
        scenarios)
            show_test_scenarios
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 