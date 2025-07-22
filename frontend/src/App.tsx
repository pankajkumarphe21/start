import { useEffect, useState } from "react";
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { W3CTraceContextPropagator } from '@opentelemetry/core';

// Initialize OpenTelemetry
const provider = new WebTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(new ConsoleSpanExporter())],
});

// Add ConsoleSpanProcessor for debugging

// Register the provider
provider.register({
  propagator: new W3CTraceContextPropagator(),
});

// Register auto-instrumentations for fetch, etc.
registerInstrumentations({
  instrumentations: [getWebAutoInstrumentations()],
});

const tracer = trace.getTracer('react-frontend', '1.0.0');

function App() {
  const [response, setResponse]:any = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentTraceId, setCurrentTraceId] = useState("");

  const makeApiCall = async () => {
    setLoading(true);
    setResponse(null);
    
    // Create a parent span for the entire operation
    const span = tracer.startSpan('user-button-click', {
      attributes: {
        'user.action': 'api-call-button',
        'frontend.component': 'TracingExample',
      },
    });

    try {
      // Get the current trace ID
      const traceId = span.spanContext().traceId;
      setCurrentTraceId(traceId);
      
      console.log(`🚀 Frontend: Starting operation with Trace ID: ${traceId}`);

      // Create context with the current span
      const ctx = trace.setSpan(context.active(), span);
      
      // Make API call within the span context
      await context.with(ctx, async () => {
        // Create a child span for the API call
        const apiSpan = tracer.startSpan('api-call', {
          attributes: {
            'http.method': 'GET',
            'http.url': 'http://localhost:3000',
            'operation.type': 'http-request',
          },
        });

        try {
          // Inject trace context into headers
          const headers = {};
          propagation.inject(context.active(), headers);
          
          console.log('📤 Frontend: Injected headers:', headers);

          const response = await fetch('http://localhost:3000', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...headers, // This includes the traceparent header
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          
          apiSpan.setAttributes({
            'http.status_code': response.status,
            'response.received': true,
          });
          
          apiSpan.setStatus({ code: SpanStatusCode.OK });
          setResponse(data);
          
          console.log('✅ Frontend: Received response:', data);
          
        } catch (error:any) {
          apiSpan.setAttributes({
            'error.occurred': true,
            'error.message': error.message,
          });
          apiSpan.setStatus({ 
            code: SpanStatusCode.ERROR, 
            message: error.message 
          });
          setResponse({ error: error.message });
          console.error('❌ Frontend: Error:', error);
        } finally {
          apiSpan.end();
        }
      });

      span.setStatus({ code: SpanStatusCode.OK });
      
    } catch (error:any) {
      span.setAttributes({
        'error.occurred': true,
        'error.message': error.message,
      });
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error.message 
      });
      console.error('❌ Frontend: Outer error:', error);
    } finally {
      span.end();
      setLoading(false);
    }
  };
  return (
    <>
      <h1>Hello World</h1>
      <div className="">{loading ? "Loading..." : "Loaded"}</div>
      <div>{response}</div>
      <button onClick={makeApiCall}>Make API Call</button>
    </>
  );
}

export default App;
