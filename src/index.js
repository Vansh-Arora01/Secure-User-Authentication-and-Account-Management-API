import dotenv from 'dotenv';
import connectDb from './Db/index.js';
// IMPORT EXPRESS AS OUR MODULE STYLE
import app from './app.js';
dotenv.config({
    path: './.env'
});

const port = process.env.PORT || 3000


connectDb()
  .then(()=>{
  app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
  })
  })
  .catch((err)=>{
    console.error("MongoDb Connection Error",err)
    process.exit(1);
  })








