import mongoose from 'mongoose';
import { ATLAS_URL, __DEV__ } from './env.js';

export default async function (connectedCallBack) {
    const MONGO_URL = __DEV__ ? 'mongodb://localhost:3000/Social' : ATLAS_URL;

    mongoose.set('debug', true);
    mongoose.set('strictQuery', false);
    mongoose.Promise = global.Promise;

    try {
        const c = await mongoose.connect(MONGO_URL);
        console.log(`Connected to ${c.connection.db.databaseName}`);
        connectedCallBack();
    } catch (err) {
        console.error(err);
    }
}
