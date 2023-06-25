import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import compression from 'compression';
import { appRoutes } from './src/routes';

const app = express();
const port = process.env.PORT || 5000;

app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(
  express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
);

app.listen(port, () => {
  console.log('listening on port ' + port);
  appRoutes(app);
});
