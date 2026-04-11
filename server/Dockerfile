FROM node:20-alpine

WORKDIR /app

# Copy root package files for workspaces
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY shared/package.json shared/
COPY server/package.json server/
COPY client/package.json client/

RUN npm install

# Copy source code
COPY shared/ shared/
COPY server/ server/

EXPOSE 5000

CMD ["npm", "run", "dev:server"]
