export const observabilityRoutes = async (app) => {
    app.get('/metrics', async () => ({
        exporter: 'placeholder',
        prometheusScrapePath: 'not_configured',
        hints: ['Add prom-client registry', 'Or export OTLP from worker + API processes'],
    }));
};
//# sourceMappingURL=observability.js.map