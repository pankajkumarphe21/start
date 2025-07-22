import { NodeSDK } from '@opentelemetry/sdk-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME,SEMRESATTRS_SERVICE_VERSION  } from '@opentelemetry/semantic-conventions';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';

// Initialize OpenTelemetry before importing other modules
const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: 'express-backend',
    [SEMRESATTRS_SERVICE_VERSION]: '1.0.0',
  }),
  spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()),
  textMapPropagator: new W3CTraceContextPropagator(),
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start();
console.log('🎯 OpenTelemetry started successfully');