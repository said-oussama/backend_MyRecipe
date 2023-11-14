import { Schema, model } from 'mongoose';

export default model(
    'Comment',
    new Schema(
        {
            name: {
                type: String,
                required: true,
                trim: true,
            },
            review: {
                type: String,
                required: true,
                trim: true,
            },
            // recipe: {
            //     type: Schema.Types.ObjectId,
            //     ref: 'Recipe',
            //     required: true,
            // },
        },
        {
            timestamps: true,
        }
    )
);
