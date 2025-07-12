FROM node:22-slim

RUN apt update && apt install -y \
    ffmpeg \
    && apt clean

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Run the bot
CMD ["node", "index.js"]
