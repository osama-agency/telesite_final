#!/bin/bash

# 🚀 Development Server Manager
# Управление серверами разработки для Telesite

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Эмодзи
FIRE="🔥"
CHECK="✅"
CROSS="❌"
ROCKET="🚀"
STOP="⏹️"
INFO="ℹ️"

# Порты
FRONTEND_PORT=3001
BACKEND_PORT=3011

# Функция для логирования
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Функция для проверки процессов
check_process() {
    local port=$1
    local name=$2

    if lsof -i:$port -t >/dev/null 2>&1; then
        local pid=$(lsof -i:$port -t)
        echo -e "${GREEN}✅ $name${NC} работает на порту $port (PID: $pid)"
        return 0
    else
        echo -e "${RED}❌ $name${NC} не работает на порту $port"
        return 1
    fi
}

# Функция для убийства процессов
kill_process() {
    local port=$1
    local name=$2

    if lsof -i:$port -t >/dev/null 2>&1; then
        log "Останавливаем $name на порту $port..."
        lsof -i:$port -t | xargs kill -9 2>/dev/null || true
        sleep 2

        if lsof -i:$port -t >/dev/null 2>&1; then
            error "Не удалось остановить $name"
            return 1
        else
            success "$name остановлен"
            return 0
        fi
    else
        warning "$name уже остановлен"
        return 0
    fi
}

# Функция для убийства процессов по портам
kill_processes() {
    echo -e "${YELLOW}${STOP} Убиваем процессы на портах ${FRONTEND_PORT} и ${BACKEND_PORT}...${NC}"

    # Убиваем процессы на фронтенд порту
    if lsof -ti:${FRONTEND_PORT} >/dev/null 2>&1; then
        echo -e "${INFO} Найден процесс на порту ${FRONTEND_PORT}"
        kill -9 $(lsof -ti:${FRONTEND_PORT}) 2>/dev/null || true
    fi

    # Убиваем процессы на бэкенд порту
    if lsof -ti:${BACKEND_PORT} >/dev/null 2>&1; then
        echo -e "${INFO} Найден процесс на порту ${BACKEND_PORT}"
        kill -9 $(lsof -ti:${BACKEND_PORT}) 2>/dev/null || true
    fi

    # Убиваем все связанные процессы
    pkill -f "next dev" || true
    pkill -f "ts-node-dev.*server.ts" || true
    pkill -f "node.*3011" || true

    echo -e "${CHECK} Процессы остановлены"
    sleep 2
}

# Функция для проверки доступности портов
check_ports() {
    echo -e "${INFO} Проверяем доступность портов..."

    if lsof -ti:${FRONTEND_PORT} >/dev/null 2>&1; then
        echo -e "${CROSS} Порт ${FRONTEND_PORT} занят"
        return 1
    fi

    if lsof -ti:${BACKEND_PORT} >/dev/null 2>&1; then
        echo -e "${CROSS} Порт ${BACKEND_PORT} занят"
        return 1
    fi

    echo -e "${CHECK} Порты свободны"
    return 0
}

# Функция проверки здоровья серверов
health_check() {
    log "Проверка здоровья серверов..."

    # Проверка бэкенда
    if curl -s http://localhost:$BACKEND_PORT/health >/dev/null 2>&1; then
        success "🏥 Backend API здоров"
    else
        warning "🏥 Backend API не отвечает"
    fi

    # Проверка фронтенда
    if curl -s -I http://localhost:$FRONTEND_PORT >/dev/null 2>&1; then
        success "🌐 Frontend здоров"
    else
        warning "🌐 Frontend не отвечает"
    fi
}

# Функция запуска серверов
start_servers() {
    echo -e "${ROCKET} Запуск серверов разработки..."

    # Убиваем старые процессы
    kill_processes

    # Проверяем порты
    if ! check_ports; then
        echo -e "${CROSS} Не удалось освободить порты. Попробуйте еще раз."
        exit 1
    fi

    # Запуск backend сервера
    echo -e "${BLUE}${ROCKET} Запуск backend сервера на порту ${BACKEND_PORT}...${NC}"
    cd backend
    nohup ./node_modules/.bin/ts-node-dev --respawn --transpile-only src/server.ts > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..

    # Даем время backend серверу запуститься
    sleep 3

    # Проверяем что backend запустился
    if ! curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
        echo -e "${CROSS} Backend сервер не запустился"
        exit 1
    fi

    echo -e "${CHECK} Backend сервер запущен (PID: $BACKEND_PID)"

    # Запуск frontend сервера
    echo -e "${GREEN}${ROCKET} Запуск frontend сервера на порту ${FRONTEND_PORT}...${NC}"
    nohup ./node_modules/.bin/next dev --turbopack --port ${FRONTEND_PORT} > logs/frontend.log 2>&1 &
    FRONTEND_PID=$!

    # Даем время frontend серверу запуститься
    sleep 5

    echo -e "${CHECK} Frontend сервер запущен (PID: $FRONTEND_PID)"

    # Проверяем статус
    check_status
}

# Функция проверки статуса
check_status() {
    echo -e "${INFO} Проверка статуса серверов:"

    # Проверка backend
    if curl -s http://localhost:${BACKEND_PORT}/health > /dev/null; then
        echo -e "${CHECK} Backend (порт ${BACKEND_PORT}): ${GREEN}Работает${NC}"
    else
        echo -e "${CROSS} Backend (порт ${BACKEND_PORT}): ${RED}Не работает${NC}"
    fi

    # Проверка frontend
    if lsof -ti:${FRONTEND_PORT} >/dev/null 2>&1; then
        echo -e "${CHECK} Frontend (порт ${FRONTEND_PORT}): ${GREEN}Работает${NC}"
    else
        echo -e "${CROSS} Frontend (порт ${FRONTEND_PORT}): ${RED}Не работает${NC}"
    fi

    echo ""
    echo -e "${INFO} Доступные URL:"
    echo -e "  Frontend: ${BLUE}http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "  Backend API: ${BLUE}http://localhost:${BACKEND_PORT}/api${NC}"
}

# Функция остановки серверов
stop_servers() {
    echo -e "${STOP} Остановка серверов..."
    kill_processes
    echo -e "${CHECK} Серверы остановлены"
}

# Функция перезапуска
restart_servers() {
    echo -e "${FIRE} Перезапуск серверов..."
    stop_servers
    sleep 2
    start_servers
}

# Функция показа логов
show_logs() {
    echo -e "${INFO} Логи серверов:"
    echo -e "${BLUE}=== BACKEND LOGS ===${NC}"
    tail -n 20 logs/backend.log 2>/dev/null || echo "Нет логов backend"
    echo ""
    echo -e "${GREEN}=== FRONTEND LOGS ===${NC}"
    tail -n 20 logs/frontend.log 2>/dev/null || echo "Нет логов frontend"
}

# Создаем директорию для логов
mkdir -p logs

# Обработка аргументов
case "${1:-start}" in
    "start")
        start_servers
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        restart_servers
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Команды:"
        echo "  start   - Запустить серверы (по умолчанию)"
        echo "  stop    - Остановить серверы"
        echo "  restart - Перезапустить серверы"
        echo "  status  - Проверить статус серверов"
        echo "  logs    - Показать логи серверов"
        exit 1
        ;;
esac
