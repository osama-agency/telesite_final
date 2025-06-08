#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Запуск TypeScript Backend сервера...${NC}"

# Проверяем, установлены ли зависимости
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Установка зависимостей...${NC}"
    npm install
fi

# Компилируем TypeScript
echo -e "${YELLOW}🔨 Компиляция TypeScript...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Ошибка компиляции!${NC}"
    exit 1
fi

# Останавливаем старый процесс на порту 3011
OLD_PID=$(lsof -ti:3011)
if [ ! -z "$OLD_PID" ]; then
    echo -e "${YELLOW}🛑 Останавливаем старый процесс (PID: $OLD_PID)...${NC}"
    kill $OLD_PID
    sleep 2
fi

# Запускаем сервер
echo -e "${GREEN}✅ Запуск сервера на порту 3011...${NC}"
PORT=3011 node dist/server.js

# Если сервер остановился, показываем сообщение
echo -e "${RED}❌ Сервер остановлен${NC}"
