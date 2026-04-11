FROM node:22-alpine
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY shared/package.json ./shared/
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install deps (tsx is now a production dep)
RUN npm ci --omit=dev

# Copy source
COPY shared/ ./shared/
COPY server/ ./server/

EXPOSE 5000

CMD ["npx", "tsx", "server/src/index.ts"]
