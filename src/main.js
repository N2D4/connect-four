import express from 'express';
import path from 'path';



const app = express()
const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => res.sendFile(path.resolve(process.cwd(), 'src/client.html')));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))