# 🚀 Development Servers Management Guide

## Автоматизированная система управления серверами разработки

### 🎯 Цель
Эта система решает проблемы с портами раз и навсегда:
- ✅ Автоматическое освобождение занятых портов
- ✅ Одновременный запуск Frontend + Backend
- ✅ Мониторинг статуса серверов
- ✅ Централизованное управление логами

### 🛠 Доступные команды

#### Через NPM (рекомендуемый способ):
```bash
npm run dev:all          # Запустить все серверы
npm run servers:start    # Запустить все серверы
npm run servers:stop     # Остановить все серверы
npm run servers:restart  # Перезапустить все серверы
npm run servers:status   # Проверить статус серверов
npm run servers:logs     # Посмотреть логи всех серверов
```

#### Через скрипт напрямую:
```bash
./scripts/dev-servers.sh start    # Запустить все серверы
./scripts/dev-servers.sh stop     # Остановить все серверы
./scripts/dev-servers.sh restart  # Перезапустить все серверы
./scripts/dev-servers.sh status   # Проверить статус серверов
./scripts/dev-servers.sh logs     # Посмотреть логи всех серверов
./scripts/dev-servers.sh logs backend   # Логи только backend
./scripts/dev-servers.sh logs frontend  # Логи только frontend
```

### 🌐 Порты серверов
- **Frontend (Next.js)**: http://localhost:3001
- **Backend (API)**: http://localhost:3011

### 📋 Основные возможности

#### 1. Автоматическое управление портами
```bash
# Скрипт автоматически:
# - Убивает все процессы на портах 3001 и 3011
# - Принудительно освобождает порты через lsof
# - Запускает серверы в правильном порядке (сначала backend, потом frontend)
```

#### 2. Проверка здоровья серверов
```bash
npm run servers:status
# Покажет:
# Backend:  ✅ Running (http://localhost:3011)
# Frontend: ✅ Running (http://localhost:3001)
```

#### 3. Централизованные логи
```bash
# Все логи сохраняются в папке logs/
logs/
├── backend.log     # Логи backend сервера
├── frontend.log    # Логи frontend сервера
├── backend.pid     # PID процесса backend
└── frontend.pid    # PID процесса frontend
```

#### 4. Просмотр логов в реальном времени
```bash
npm run servers:logs               # Все логи
npm run servers:logs backend       # Только backend
npm run servers:logs frontend      # Только frontend
```

### 🔥 Быстрый старт

1. **Запустить все серверы:**
   ```bash
   npm run dev:all
   ```

2. **Открыть приложение:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3011/health

3. **При проблемах:**
   ```bash
   npm run servers:restart  # Перезапустить все
   npm run servers:logs     # Посмотреть логи
   ```

### 🚨 Решение проблем

#### Проблема: "Port already in use"
```bash
npm run servers:stop     # Останавливает все процессы
npm run servers:start    # Запускает заново
```

#### Проблема: Сервер не отвечает
```bash
npm run servers:status   # Проверить статус
npm run servers:restart  # Перезапустить если нужно
```

#### Проблема: Ошибки в логах
```bash
npm run servers:logs backend   # Логи backend
npm run servers:logs frontend  # Логи frontend
```

### 📦 Что включено в систему

1. **Автоматизированный скрипт** (`scripts/dev-servers.sh`)
   - Управление процессами
   - Освобождение портов
   - Проверка здоровья
   - Цветной вывод

2. **NPM команды** (добавлены в `package.json`)
   - Удобные алиасы
   - Интеграция с существующим workflow

3. **Система логирования**
   - Раздельные логи для frontend/backend
   - Сохранение PID процессов
   - Игнорирование в Git

### 🎉 Преимущества

- **Никаких проблем с портами** - автоматическое освобождение
- **Одна команда для запуска** - `npm run dev:all`
- **Простая отладка** - централизованные логи
- **Надежность** - проверка здоровья серверов
- **Удобство** - цветной вывод и статусы

### 🔧 Настройка

Все настройки находятся в файле `scripts/dev-servers.sh`:
- Порты серверов (3001, 3011)
- Время ожидания запуска
- Пути к логам
- Команды запуска серверов

---

**Теперь проблемы с портами решены раз и навсегда! 🎯** 
