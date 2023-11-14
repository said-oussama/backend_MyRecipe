import { config } from 'dotenv';

config();

export const __DEV__ = process.env.NODE_ENV === 'dev';

export const PORT = Number.parseInt(`${process.env.PORT}`);

export const ATLAS_URL = `${process.env.ATLAS_URL}`;
