DROP INDEX "webhook_delivery_logs_webhook_id_idx";--> statement-breakpoint
DROP INDEX "webhook_delivery_logs_event_idx";--> statement-breakpoint
CREATE INDEX "webhook_delivery_logs_webhook_id_created_idx" ON "webhook_delivery_logs" USING btree ("webhook_id","created_at");