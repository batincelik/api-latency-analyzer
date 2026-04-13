import { createLogger } from '@ala/logger';
const log = createLogger({ name: 'worker-notify' });
export async function deliverNotifications(rule, event, endpoint) {
    log.warn({
        type: 'alert_console',
        ruleType: rule.type,
        endpointId: endpoint.id,
        eventId: event.id,
        message: event.message,
    }, 'alert_fired');
    if (rule.webhookUrl) {
        try {
            const res = await fetch(rule.webhookUrl, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    text: event.message,
                    rule: rule.type,
                    endpoint: { id: endpoint.id, url: endpoint.url, name: endpoint.name },
                    event: { id: event.id, firedAt: event.firedAt },
                }),
                signal: AbortSignal.timeout(10_000),
            });
            if (!res.ok) {
                log.error({ status: res.status, webhook: rule.webhookUrl }, 'webhook_failed');
            }
        }
        catch (err) {
            log.error({ err, webhook: rule.webhookUrl }, 'webhook_error');
        }
    }
}
//# sourceMappingURL=notify.js.map