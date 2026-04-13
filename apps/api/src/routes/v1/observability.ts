import type { FastifyPluginAsync } from 'fastify';

export const observabilityRoutes: FastifyPluginAsync = async (app) => {
  app.get('/metrics', async () => ({
    exporter: 'placeholder',
    prometheusScrapePath: 'not_configured',
    hints: ['Add prom-client registry', 'Or export OTLP from worker + API processes'],
  }));
};
