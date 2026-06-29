FROM python:3.14-slim

WORKDIR /server 

RUN apt-get update && apt-get install -y \
    gcc \
    build-essential \
    python3-dev

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]