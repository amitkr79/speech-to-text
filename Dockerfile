# Use Node LTS
FROM node:18

# Install ffmpeg (required for your audio conversion)
RUN apt-get update && apt-get install -y ffmpeg

# Create app directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Expose port Render will map
EXPOSE 3000

# Run your server
CMD ["node", "server.js"]
