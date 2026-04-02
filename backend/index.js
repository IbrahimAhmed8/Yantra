const express = require('express')
const app = express()
const port = 3000
import fileRoutes from './routes/file.routes';

app.use('/api/files', fileRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
