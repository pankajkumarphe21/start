import express from 'express';
import moment from 'moment-timezone';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/',(req,res)=>{
  const date = moment(); // current time

const indiaTime = date.tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
const usEasternTime = date.tz('America/New_York').format('YYYY-MM-DD HH:mm:ss');
const londonTime = date.tz('Europe/London').format('YYYY-MM-DD HH:mm:ss');

console.log('India Time:', indiaTime);
console.log('US Eastern Time:', usEasternTime);
console.log('London Time:', londonTime);

  res.send(JSON.stringify([indiaTime,usEasternTime,londonTime,new Date(Date.now()).toUTCString(),new Date(Date.now()).toISOString()]));
})

app.get('/test',(req,res)=>{
  const timestamp=JSON.stringify(new Date(Date.now()).toISOString());
  if (!timestamp) res.send(0);
  try {
    const istTime = new Date(timestamp).toLocaleString('en-US', { hour12: false });
    const [, timePart] = istTime.split(', ');
    const [hourStr] = timePart.split(':');
    const hour = parseInt(hourStr, 10);
    res.send( JSON.stringify([hour >= 9 && hour < 18 ? 1 : 2,timestamp,istTime]));
  } catch {
    console.warn('Failed to determine shift_id from timestamp');
  }
  res.send('Hi');
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
