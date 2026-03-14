FROM node:24-alpine AS development
WORKDIR /app
COPY --chown=node:node package*.json pnpm-lock.yaml* ./

# Ensure Corepack and pnpm are enabled
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure non-interactive mode
ENV CI=true

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
  pnpm install --frozen-lockfile || pnpm install --no-frozen-lockfile; \
  else \
  pnpm install --no-frozen-lockfile; \
  fi

# Copy all files *except* node_modules (since it's already installed)
COPY --chown=node:node . .

EXPOSE 8080
ENTRYPOINT ["./docker/dev/entrypoint"]

FROM node:24-alpine AS build
WORKDIR /app
COPY --chown=node:node package*.json ./

# Copy only node_modules from development
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node . .

# Enable Corepack again in this stage
RUN corepack enable && corepack prepare pnpm@latest --activate

# Ensure non-interactive mode
ENV CI=true

RUN chmod -R a+x ./node_modules
RUN pnpm run build
# Ensure mailer EJS templates exist in dist (path matches compiled mailer.service.js __dirname)
# Support both dist/src/mailer and dist/mailer output structures
COPY src/mailer/templates dist/src/mailer/templates
COPY src/mailer/templates dist/mailer/templates
ENV NODE_ENV="production"
RUN if [ -f pnpm-lock.yaml ]; then \
  pnpm install --frozen-lockfile --prod || pnpm install --no-frozen-lockfile --prod; \
  else \
  pnpm install --no-frozen-lockfile --prod; \
  fi
USER node

FROM node:24-alpine AS production
WORKDIR /app

# Enable Corepack and pnpm in production stage
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY --chown=node:node docker/prod ./docker/prod
COPY --chown=node:node package.json ./
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist

# Make entrypoint script executable
RUN chmod +x ./docker/prod/entrypoint

EXPOSE 8080
ENTRYPOINT ["./docker/prod/entrypoint"]
