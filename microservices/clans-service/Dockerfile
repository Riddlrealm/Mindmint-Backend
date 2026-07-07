FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm ci --production=false || true
RUN npm run build || true
EXPOSE 3002
CMD ["node", "dist/main.js"]

# Healthcheck: NestJS typically exposes /health. Container probe will
# declare unhealthy if 3 consecutive requests fail or timeout.
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
