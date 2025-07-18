import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/',(req,res)=>{
  const date=new Date(Date.now());
  res.send(JSON.stringify([date]));
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
