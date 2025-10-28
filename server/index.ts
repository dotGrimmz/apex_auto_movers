import express from 'express';
import cors from 'cors';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import quoteRouter from './routes/quote';
import quotesRouter from './routes/quotes';
import newsletterRouter from './routes/newsletter';
import profileRouter from './routes/profile';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/quote', quoteRouter);
app.use('/api/quotes', quotesRouter);
app.use('/api/newsletter', newsletterRouter);
app.use('/api/profile', profileRouter);

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export default app;

