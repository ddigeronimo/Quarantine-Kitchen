const express = require("express");
const router = express.Router();
const data = require("../data");
const userData = data.users;
const recipeData = data.recipes;

router.get("/", async (req, res) => {
    try {
      const userList = await userData.getAllUsers();
      res.json(userList);
    } catch (e) {
      res.status(500).json({error: e});
    }
  });
  
  router.get("/:id", async (req, res) => {
    try {
      const user = await userData.getUserById(req.params.id);
      res.status(200).json(user);
    } catch (e) {
      res.status(404).json({ error: e });
    }
  });
  
  router.post("/", async (req, res) => {
    const userInfo = req.body;
    try {
      if(!userInfo.id) {
        throw "You must provide an id";
      }
      if (!userInfo.email) {
        throw "You must provide an email";
      }
      if(!userInfo.displayName){
        throw "You must provide a first name";
      }
      if(!userInfo.birthday && userInfo.birthday!=""){
        throw "You must provide a birthday";
      }
      const newuser = await userData.createUser(
        userInfo.id,
        userInfo.email,
        userInfo.displayName,
        userInfo.birthday
      );
      res.status(200).json(newuser);
    } catch (e) {
      console.log(e);
      res.status(400).json({error: e});
    }
  });

  router.patch("/:id", async (req, res) => {
    const userInfo = req.body;
    try {
      const updatedUser = await userData.updateUser(req.params.id, userInfo);
      res.status(200).json(updatedUser);
    } catch (e) {
      res.status(400).json({error: e.message});
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const user = await userData.getUserById(req.params.id);
      await userData.removeUser(req.params.id);
      const recipeList = await recipeData.getAllRecipes();
      for(let p = 0; p<recipeList.length; p++){
        if(recipeList[p].author==user._id){
          await recipeData.removeRecipe(recipeList[p]._id);
        }
      }
      res.json(user);
    } catch (e) {
      res.status(404).json({error: e});
      return;
    }
  });
  
  module.exports = router;
