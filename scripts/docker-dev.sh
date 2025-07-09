#!/bin/bash

# Docker Development Script for theyaz.io
# This script helps manage the Docker development environment

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Function to check if Docker Compose is available
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install it and try again."
        exit 1
    fi
}

# Function to start the development environment
start_dev() {
    print_status "Starting development environment..."
    
    # Build and start services
    docker-compose up --build -d
    
    print_success "Development environment started!"
    print_status "Services available at:"
    echo "  - Frontend: http://localhost:5173"
    echo "  - Supabase Studio: http://localhost:54322"
    echo "  - Supabase API: http://localhost:54321"
    echo "  - Mailhog: http://localhost:8025"
    echo "  - Redis: localhost:6379"
}

# Function to stop the development environment
stop_dev() {
    print_status "Stopping development environment..."
    docker-compose down
    print_success "Development environment stopped!"
}

# Function to restart the development environment
restart_dev() {
    print_status "Restarting development environment..."
    docker-compose down
    docker-compose up --build -d
    print_success "Development environment restarted!"
}

# Function to view logs
view_logs() {
    if [ -z "$1" ]; then
        print_status "Showing logs for all services..."
        docker-compose logs -f
    else
        print_status "Showing logs for service: $1"
        docker-compose logs -f "$1"
    fi
}

# Function to reset the environment
reset_dev() {
    print_warning "This will remove all data and start fresh. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting development environment..."
        docker-compose down -v
        docker-compose up --build -d
        print_success "Development environment reset!"
    else
        print_status "Reset cancelled."
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for Supabase to be ready
    print_status "Waiting for Supabase to be ready..."
    sleep 10
    
    # Run migrations using Supabase CLI
    if command -v supabase &> /dev/null; then
        print_status "Running migrations with Supabase CLI..."
        supabase db reset --linked
    else
        print_warning "Supabase CLI not found. Please install it to run migrations automatically."
        print_status "You can run migrations manually in Supabase Studio at http://localhost:54322"
    fi
}

# Function to show status
show_status() {
    print_status "Development environment status:"
    docker-compose ps
    
    echo ""
    print_status "Service URLs:"
    echo "  - Frontend: http://localhost:5173"
    echo "  - Supabase Studio: http://localhost:54322"
    echo "  - Supabase API: http://localhost:54321"
    echo "  - Mailhog: http://localhost:8025"
    echo "  - Redis: localhost:6379"
}

# Function to show help
show_help() {
    echo "Docker Development Script for theyaz.io"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the development environment"
    echo "  stop      Stop the development environment"
    echo "  restart   Restart the development environment"
    echo "  logs      View logs (optional: specify service name)"
    echo "  reset     Reset the environment (removes all data)"
    echo "  migrate   Run database migrations"
    echo "  status    Show current status"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  $0 logs frontend"
    echo "  $0 reset"
}

# Main script logic
main() {
    # Check prerequisites
    check_docker
    check_docker_compose
    
    case "${1:-help}" in
        start)
            start_dev
            ;;
        stop)
            stop_dev
            ;;
        restart)
            restart_dev
            ;;
        logs)
            view_logs "$2"
            ;;
        reset)
            reset_dev
            ;;
        migrate)
            run_migrations
            ;;
        status)
            show_status
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