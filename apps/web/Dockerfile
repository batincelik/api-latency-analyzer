FROM node:20-bookworm-slim AS build
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @ala/web build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/web/.next/standalone /app
COPY --from=build /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=build /app/apps/web/public /app/apps/web/public
WORKDIR /app/apps/web
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
