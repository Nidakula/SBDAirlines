# SBDAirlines

A Node.js application for airline management and booking.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Docker Setup](#docker-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

SBDAirlines is a Node.js application that provides services for airline management including flight information, booking, passenger data, and more.

## Prerequisites

- Node.js 18 or later
- MongoDB database
- Docker (optional, for containerized deployment)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd SBDAirlines

# Install dependencies
npm install
```

## Docker Setup

### Build the Docker Image

```bash
docker build -t sbd-airlines .
```

### Run the Container

```bash
docker run -p 3000:3000 --env-file .env -d --name sbd-airlines-container sbd-airlines
```

### Using Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

Run with:

```bash
docker-compose up -d
```

## Environment Configuration

The application requires the following environment variables in a `.env` file:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
PORT=3000
```

## Running the Application

### Without Docker

```bash
# Start the application
npm start

# Development mode with auto-reload (if configured)
npm run dev
```

### With Docker

```bash
# Build and run using Docker
docker build -t sbd-airlines .
docker run -p 3000:3000 --env-file .env -d sbd-airlines
```

## API Documentation

The application exposes the following endpoints:

- `/api/flights` - Flight information
- `/api/bookings` - Booking management
- `/api/passengers` - Passenger data
- `/api/airlines` - Airline information

Detailed API documentation can be found in the `/docs` directory.

## Development

```bash
# Run in development mode
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Troubleshooting

### Common Issues

- **Connection Error**: Ensure MongoDB URI is correct in your `.env` file
- **Port Already in Use**: Change the PORT value in `.env` or stop the service using port 3000

### Docker Specific

```bash
# View logs
docker logs sbd-airlines-container

# Access container shell
docker exec -it sbd-airlines-container bash

# Stop container
docker stop sbd-airlines-container

# Remove container
docker rm sbd-airlines-container
```