FROM node:22-alpine

WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json ./

# Install production dependencies only (skip workspace dev dependencies)
RUN npm ci --omit=dev --ignore-scripts

# Copy application source
COPY server.js ./
COPY lib/ ./lib/
COPY middleware/ ./middleware/
COPY routes/ ./routes/
COPY public/ ./public/
COPY scripts/ ./scripts/

# Initialize data files
RUN node scripts/init-data.js

# Expose the server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Run as non-root user
RUN addgroup -S ckpm && adduser -S ckpm -G ckpm
RUN chown -R ckpm:ckpm /app
USER ckpm

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
