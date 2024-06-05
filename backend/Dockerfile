# Используйте официальный базовый образ Python
FROM python:3.12

# Установите рабочую директорию в контейнере
WORKDIR /app

# Скопируйте файл requirements.txt в контейнер
COPY requirements.txt .

# Установите зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Скопируйте содержимое текущей директории в контейнер
COPY . .

# Откройте порт 8000 для uvicorn
EXPOSE 8000

# Выполните команды после запуска контейнера
CMD ["sh", "-c", "uvicorn main:app --reload & python admin.py"]
