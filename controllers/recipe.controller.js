
import {
    create,
    getAll,
    getById,
    deleteRecipeById,
    editById,
    setPhoto,
} from '../services/recipe.service.js';

import { deleteReviewByRecipe } from '../services/review.service.js';

import { deleteImage } from '../utils/image-utils.js';

export async function createRecipe(req, res) {
    try {
        console.log('Start createRecipe function');

        // Vérifier si req.user est défini
        if (!req.user) {
            console.error('Error: req.user is undefined');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const user = req.user._id;
        console.log('User ID:', user);

        const { name, description, calories, cookingTime, ingredients } = req.body;
        console.log('Received request with data:', req.body);

        const recipeData = await create(
            user,
            name,
            description,
            calories,
            cookingTime,
            ingredients,
            
        );

        console.log('Recipe created successfully');

        return res.status(201).json({ message: 'Created Recipe!', id: recipeData._id });
    } catch (error) {
        console.error('Error in createRecipe:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

export async function getRecipes(req, res) {
    return res.send(await getAll());
}

export async function getRecipeById(req, res) {
    const found = await getById(req.params.id);

    if (!found) {
        return res.status(404).json({ error: 'Recipe not found!' });
    }

    return res.send(found);
}

export async function editRecipe(req, res) {
    const { name, description, calories, cookingTime, ingredients } = req.body;

    const updatedRecipe = await editById(
        req.params.id,
        name,
        description,
        calories,
        cookingTime,
        ingredients
    );
    if (!updatedRecipe.modifiedCount) {
        return res.status(404).json({ error: 'Recipe not updated!' });
    }
    return res.send({ message: 'Success.' });
}

export async function updateRecipePhoto(req, res) {
    const recipe = await getById(req.params.id);

    if (!recipe) return res.status(404).json({ error: 'Recipe not found !' });

    const filename = recipe?.photo;

    if (filename) {
        deleteImage(filename, (err) => {
            if (err) {
                console.error(err);
                return res
                    .status(500)
                    .json({ error: 'Error updating recipe photo.' });
            }
        });
    }
    return await updatePhoto(req, res, 200);
}

/**
 *
 * @param {any} req
 * @param {any} res
 * @param {Number} statusCode
 */
async function updatePhoto(req, res, statusCode) {
    if (!req.file) {
        return res.status(500).json({ error: 'No image found!' });
    }

    const updateResult = await setPhoto(req.params.id, `${req.file.filename}`);

    if (!updateResult.modifiedCount)
        return res
            .status(400)
            .json({ error: 'Error updating your recipe photo.' });

    return res.status(statusCode).json({ message: `${req.file.filename}` });
}

export async function delRecipe(req, res) {
    const recipe = await getById(req.params.id);

    if (!recipe) {
        return res.status(404).json({ error: 'Not found!' });
    }

    const filename = recipe.photo;

    deleteImage(filename, (err) => {
        if (err) {
            console.error(err);
            return res
                .status(500)
                .json({ error: 'Error updating recipe photo.' });
        }
    });

    const result = await deleteReviewByRecipe(recipe);
    if (!result.deletedCount) {
        return res.status(404).json({ error: 'Error updating review' });
    }

    const deletedData = await deleteRecipeById(req.params.id);

    if (!deletedData.deletedCount) {
        return res.status(404).json({ error: 'Not found!' });
    }

    return res.json({ message: 'Recipe deleted.' });
}
