FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml .
COPY uv.lock .

# Install Python dependencies and set up virtual environment
RUN pip install --no-cache-dir uv && \
    uv venv && \
    . .venv/bin/activate && \
    uv pip install --no-cache-dir -e . && \
    ln -s /app/.venv/bin/uvicorn /usr/local/bin/uvicorn

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 