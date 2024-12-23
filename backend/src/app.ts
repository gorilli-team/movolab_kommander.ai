import express, { Request, Response, NextFunction } from 'express'; 
import bodyParser from 'body-parser';
import cors from 'cors';
import { chooseVehicleAudio, uploadAudio } from './controllers/saveAudioController';
import { getMessages, createMessage, chooseVehicleText} from './controllers/messageController';

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.post('/upload-audio', uploadAudio);

app.post('/choose_vehicle_audio', chooseVehicleAudio);


app.get('/messages', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getMessages(req, res);
  } catch (error) {
    next(error);
  }
});

app.post('/new_message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await createMessage(req, res); 
  } catch (error) {
    next(error);
  }
});


app.post('/choose_vehicle_message', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await chooseVehicleText(req, res); 
  } catch (error) {
    next(error);
  }
});


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); 
  res.status(500).json({ error: err.message || 'An unexpected error occurred' }); 
});

export default app;
