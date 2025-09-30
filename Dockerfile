FROM node:20-alpine
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy semua kode repo
COPY . .

# Build step (opsional)
RUN npm run build

# Jalankan aplikasi
CMD ["node", "dist/main.js"]
EXPOSE 3001