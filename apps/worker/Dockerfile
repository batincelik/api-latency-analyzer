FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ala/db exec prisma generate
RUN pnpm --filter @ala/worker build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY --from=build /app /app
WORKDIR /app
CMD ["node", "apps/worker/dist/index.js"]
