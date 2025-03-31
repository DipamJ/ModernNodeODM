# Use the official QGIS image as the base
FROM qgis/qgis

# Install netcat-openbsd so that the 'nc' command is available
RUN apt-get update && apt-get install -y netcat-openbsd && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set environment variables for QGIS to run headless
ENV QGIS_PREFIX_PATH=/usr
ENV QT_QPA_PLATFORM=offscreen
ENV XDG_RUNTIME_DIR=/tmp/runtime-root
# ENV PYTHONPATH=/usr/share/qgis/python:/usr/share/qgis/python/plugins:/usr/lib/python3/dist-packages

# Set the working directory in the container
WORKDIR /app

# Copy the entire backend source code into /app
COPY . /app

# Copy requirements.txt separately (ensures it’s available in /app)
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt --break-system-packages --ignore-installed

# Expose the backend port
EXPOSE 5000

# Command to run the Flask application
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]