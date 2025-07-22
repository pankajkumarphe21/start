import express from 'express';
import moment from 'moment-timezone';
import cors from 'cors';
import morgan from 'morgan'
import './logging/instrumentation'
import { trace, context, propagation, SpanStatusCode } from '@opentelemetry/api';
const tracer = trace.getTracer('express-backend', '1.0.0');


const app = express();
const PORT = 3000;

app.use(express.json());

app.use(morgan('dev'));

app.use((req, res, next) => {
  // Extract trace context from incoming headers
  const extractedContext = propagation.extract(context.active(), req.headers);
  
  // Get span context if available
  const spanContext = trace.getSpanContext(extractedContext);
  
  if (spanContext) {
    console.log(`🔗 Backend: Received request with Trace ID: ${spanContext.traceId}`);
    console.log(`🔗 Backend: Span ID: ${spanContext.spanId}`);
    console.log(`📥 Backend: Received headers:`, {
      traceparent: req.headers.traceparent,
      tracestate: req.headers.tracestate,
    });
  } else {
    console.log('❌ Backend: No trace context found in headers');
  }
  
  // Continue with the extracted context
  context.with(extractedContext, () => {
    next();
  });
});

app.use(cors());

app.get('/',(req,res)=>{
  const span = tracer.startSpan('get-data-endpoint', {
    attributes: {
      'http.method': 'GET',
      'http.route': '/',
      'operation.name': 'fetch-data',
    },
  });
  try {
    console.log('trace-id',span.spanContext().traceId);
    console.log('spanId',span.spanContext().spanId);
    const date = moment(); // current time
  
  const indiaTime = date.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
  const usEasternTime = date.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
  const londonTime = date.tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');
  
    res.send(JSON.stringify([indiaTime,usEasternTime,londonTime,new Date(Date.now()).toUTCString(),new Date(Date.now()).toISOString()]));
  } catch (error) {
    
  } finally{
    console.log('finished')
    span.end();
  }
  
});

app.get('/test',(req,res)=>{
  let timestamp=new Date().toISOString();
  const currentTime = new Date().toISOString();
  const date = new Date(currentTime).toISOString().split('T')[0];
  const rest = new Date(currentTime).toISOString().split('T')[1];
  console.log(new Date().toString());
  if (!timestamp) res.send(0);
  try {
    const istTime = new Date(timestamp).toLocaleString('en-US', { hour12: false });
    console.log(istTime);
    const [, timePart] = istTime.split(', ');
    const [hourStr] = timePart.split(':');
    const hour = parseInt(hourStr, 10);
    res.send( JSON.stringify([hour >= 9 && hour < 18 ? 1 : 2,timestamp,currentTime,date,rest]));
  } catch {
    console.warn('Failed to determine shift_id from timestamp');
    res.send('Hi');
  }
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
