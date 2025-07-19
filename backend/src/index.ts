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

  res.send(JSON.stringify([indiaTime,usEasternTime,londonTime]));
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
