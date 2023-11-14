import RecipeModel from '../models/recipe.js';

/**
 * @param {object} user
 * @param {String} name
 * @param {String} description
 * @param {Number} calories
 * @param {Number} cookingTime
 * @param {[any]} ingredients
 */
export async function create(
    user,
    name,
    description,
    calories,
    cookingTime,
    ingredients
) {
    return await RecipeModel.create({
        user:user,
        name: name,
        calories: calories,
        createdAt: new Date(),
        ingredients: ingredients,
        cookingTime: cookingTime,
        description: description,
    });
}

export async function getAll() {
    return await RecipeModel.find({});
}

/**
 * @param {any} id
 */
export async function getById(id) {
    return await RecipeModel.findOne({ _id: id });
}

/**
 * @param {any} id
 * @param {String} name
 * @param {String} description
 * @param {Number} calories
 * @param {Number} cookingTime
 * @param {[any]} ingredients
 */
export async function editById(
    id,
    name,
    description,
    calories,
    cookingTime,
    ingredients
) {
    return await RecipeModel.updateOne(
        {
            _id: id,
        },
        {
            $set: {
                name: name,
                calories: calories,
                updatedAt: new Date(),
                ingredients: ingredients,
                cookingTime: cookingTime,
                description: description,
            },
        },
        {
            upsert: false,
        }
    );
}

/**
 * @param {any} id
 * @param {String} photo
 */
export async function setPhoto(id, photo) {
    return await RecipeModel.updateOne(
        {
            _id: id,
        },
        {
            $set: {
                photo: photo,
                updatedAt: new Date(),
            },
        },
        {
            upsert: false,
        }
    );
}

/**
 * @param {any} id
 */
export async function deleteRecipeById(id) {
    return await RecipeModel.deleteOne({ _id: id });
}
