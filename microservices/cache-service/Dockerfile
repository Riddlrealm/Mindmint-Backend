FROM node:20-alpine
WORKDIR /usr/src/app

# Install deps
COPY package.json package.json
RUN npm install --production=false

# Build
COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main.js"]

# Healthcheck: NestJS typically exposes /health. Container probe will
# declare unhealthy if 3 consecutive requests fail or timeout.
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
