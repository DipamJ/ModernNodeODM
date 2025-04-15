# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Install OS-level dependencies needed for GDAL and building Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        gnupg \
        debian-archive-keyring \
        netcat-openbsd \
        gdal-bin \
        libgdal-dev \
        build-essential \
        gcc && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set environment variables so that GDAL finds its headers
ENV GDAL_CONFIG=/usr/bin/gdal-config
ENV C_INCLUDE_PATH=/usr/include/gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV CXXFLAGS="-std=c++11"

# Upgrade pip and install wheel and setuptools (at least version 67)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir wheel 'setuptools>=67'

# Install numpy first so that GDAL builds with numpy support
RUN pip install --no-cache-dir numpy==1.24.2

# Force-reinstall a known good version of GDAL with numpy support.
# (Remove GDAL from your requirements.txt to avoid conflicts.)
RUN pip install --no-cache-dir --force-reinstall "GDAL[numpy]==3.6.2"

# Now install the remaining dependencies.
# (Make sure your requirements.txt does NOT list GDAL)
RUN pip install --no-cache-dir -r requirements.txt

# Set PYTHONPATH for our application
ENV PYTHONPATH=/app
ENV LD_LIBRARY_PATH=/usr/lib:$LD_LIBRARY_PATH

# Expose the backend port
EXPOSE 5000

# Command to run the Flask application
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]