# SwissBroker OS backend (Express: AI proxy + integrations + calls + automation)
# Multi-stage: build TypeScript, then run a slim production image.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
# Cloud Run / Render inject PORT; the server reads process.env.PORT.
EXPOSE 3000
CMD ["node", "dist/server.js"]
