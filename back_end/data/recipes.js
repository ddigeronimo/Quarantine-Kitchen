const mongoCollections = require("../config/mongoCollections");
const recipes = mongoCollections.recipes;
const uuid = require("uuid");

const addIndex = async () => {
  const recipeCollection = await recipes();
  const indexTest = recipeCollection.createIndex({ "$**": "text" }, (err) => {
    if (err)
      console.log(err);
    else
      console.log('create index successfully');
  });
  if (indexTest === null) throw "Error creating index";
}

addIndex();

module.exports = {
  async getAllRecipes() {
    const recipeCollection = await recipes();
    const allRecipes = await recipeCollection.find({}).toArray();
    return allRecipes;
  },

  async getRecipeById(id) {
    if (!id) throw "You must provide a recipe id to search for";
    const recipeCollection = await recipes();
    const recipe = await recipeCollection.findOne({ _id: id });
    if (recipe === null) throw "No recipe found with that id";
    return recipe;
  },
  async searchRecipe(searchTerm) {
    if (!searchTerm) throw "You must provide a search term to search for";
    const recipeCollection = await recipes();
    const recipe = await recipeCollection
      .find({ $text: { $search: searchTerm } })
      .toArray();
    if (recipe === null) throw "No recipe found with that searchTerm";
    return recipe;
  },

  async getRecipesByUser(author) {
    if (!author) throw "You must provide an author id";
    if (typeof author !== "string") throw "author id must be of type string";
    const recipeCollection = await recipes();
    const userRecipes = await recipeCollection
      .find({ author: author })
      .toArray();
    return userRecipes;
  },

  async addRecipe(
    title,
    author,
    datePosted,
    completionTime,
    ingredients,
    steps,
    recipe_yield
  ) {
    if (!title) throw "Must include a title for the recipe";
    if (!author) throw "Must include an author for the recipe";
    if (!datePosted) throw "Must include a post date for the recipe";
    if (!completionTime) throw "Must include completion time for the recipe";
    if (!ingredients) throw "Must include ingredients for the recipe";
    if (!steps) throw "Must include steps for the recipe";
    if (!recipe_yield) throw "Must include a yield for the recipe";

    if (typeof title !== "string") throw "Title must be of type string";
    if (typeof author !== "string") throw "Author must be of type string";
    if (typeof completionTime !== "number")
      throw "Completion time must be of type int";
    if (!Number.isInteger(completionTime))
      throw "Completion time must be of type int";
    if (completionTime < 1) throw "Completion time must be greater than 0";
    if (!Array.isArray(ingredients)) throw "Ingredients must be an array";
    if (!Array.isArray(steps)) throw "Steps must be an array";
    if (typeof recipe_yield !== "number")
      throw "Recipe yield must be of type int";
    if (!Number.isInteger(recipe_yield))
      throw "Recipe yield must be of type int";

    ingredients.forEach((i) => {
      if (!i.name) throw "Each ingredient must have a name";
      if (!i.measurement) throw "Each ingredient must have a measurement";
      if (!i.unit) throw "Each ingredient must have a unit";

      if (typeof i.name !== "string")
        throw "Ingredient name must be of type string";
      if (typeof i.measurement !== "string")
        throw "Ingredient measurement must be of type string";
      if (typeof i.unit !== "string")
        throw "Ingredient units must be of type string";
    });

    steps.forEach((s) => {
      if (typeof s !== "string") throw "All steps must be of type string";
    });

    let newRecipe = {
      title: title,
      author: author,
      datePosted: datePosted,
      completionTime: completionTime,
      ingredients: ingredients,
      steps: steps,
      recipe_yield: recipe_yield,
      _id: uuid.v4(),
    };

    const recipeCollection = await recipes();
    const insertInfo = await recipeCollection.insertOne(newRecipe);
    if (insertInfo.insertedCount === 0) throw "Could not add recipe";

    const newId = insertInfo.insertedId;
    const recipe = await this.getRecipeById(newId);
    return recipe;
  },

  async updateRecipe(
    id,
    title,
    author,
    datePosted,
    completionTime,
    ingredients,
    steps,
    recipe_yield
  ) {
    if (!id) throw "Must include a recipe id";

    let focus = await this.getRecipeById(id);

    if (!title) title = focus.title;
    if (!author) author = focus.author;
    if (!datePosted) datePosted = focus.datePosted;
    if (!completionTime) completionTime = focus.completionTime;
    if (!ingredients) ingredients = focus.ingredients;
    if (!steps) steps = focus.steps;
    if (!recipe_yield) recipe_yield = focus.recipe_yield;

    if (typeof title !== "string") throw "Title must be of type string";
    if (typeof author !== "string") throw "Author must be of type string";
    if (typeof completionTime !== "number")
      throw "Completion time must be of type int";
    if (!Number.isInteger(completionTime))
      throw "Completion time must be of type int";
    if (completionTime < 1) throw "Completion time must be greater than 0";
    if (!Array.isArray(ingredients)) throw "Ingredients must be an array";
    if (!Array.isArray(steps)) throw "Steps must be an array";
    if (typeof recipe_yield !== "number")
      throw "Recipe yield must be of type int";
    if (!Number.isInteger(recipe_yield))
      throw "Recipe yield must be of type int";

    ingredients.forEach((i) => {
      if (!i.name) throw "Each ingredient must have a name";
      if (!i.measurement) throw "Each ingredient must have a measurement";
      if (!i.unit) throw "Each ingredient must have a unit";

      if (typeof i.name !== "string")
        throw "Ingredient name must be of type string";
      if (typeof i.measurement !== "string")
        throw "Ingredient measurement must be of type string";
      if (typeof i.unit !== "string")
        throw "Ingredient units must be of type string";
    });

    steps.forEach((s) => {
      if (typeof s !== "string") throw "All steps must be of type string";
    });

    const recipeCollection = await recipes();
    const updatedRecipe = {
      title: title,
      author: author,
      datePosted: datePosted,
      completionTime: completionTime,
      ingredients: ingredients,
      steps: steps,
      recipe_yield: recipe_yield,
    };

    const updatedInfo = await recipeCollection.updateOne(
      { _id: id },
      { $set: updatedRecipe }
    );

    if (updatedInfo.modifiedCount === 0) {
      throw "Could not update recipe successfully";
    }
    return await this.getRecipeById(id);
  },

  async removeRecipe(id) {
    if (!id) throw "Must include a recipe id";

    const recipeCollection = await recipes();

    const deleteInfo = await recipeCollection.deleteOne({ _id: id });
    if (deleteInfo.deletedCount === 0) {
      throw "Could not delete recipe";
    }

    return { status: "Recipe successfully deleted" };
  },
};
