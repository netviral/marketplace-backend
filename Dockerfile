# Use Node.js 20 LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript application
RUN npm run build

# Set default port
ENV PORT=4000
# Expose Port
EXPOSE 4000

# Start command
CMD ["node", "dist/app.js"]
