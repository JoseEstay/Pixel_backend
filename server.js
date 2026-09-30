import express from 'express'
const app = express();

app.get ('/', (req, res) => {
  res.send('Solo hay res por request');
})

app.listen(3000, () => {
    console.log('Servidor arriba')
})  