FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

ENV AGENT_HOST=0.0.0.0
ENV AGENT_PORT=8766
ENV CHROMA_PERSIST_DIR=/app/data/chroma

EXPOSE 8766

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8766"]
