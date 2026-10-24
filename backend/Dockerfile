FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source
COPY . .

# Create upload dirs
RUN mkdir -p uploads/resumes uploads/avatars uploads/documents logs

EXPOSE 5000

CMD ["node", "src/server.js"]
