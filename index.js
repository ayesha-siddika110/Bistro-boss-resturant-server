const express = require('express');
const cors = require('cors');
const app = express()
const port = process.env.PORT || 3000


app.get('/',(req,res)=>{
    res.send('server is runing')
})
app.listen(port, ()=>{
    console.log(`server is runing in port ${port}`);
    
})