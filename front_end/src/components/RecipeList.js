import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Tabs, Tab, Button } from "react-bootstrap";
import "../App.css";
import API from "../API";
import Search from './Search';

const RecipeList = (props) => {
  const [recipeData, setRecipeData] = useState(undefined);
  const [searchData, setSearchData] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [key, setKey] = useState(undefined);
  let li = null;

  useEffect(() => {
    async function fetchData() {
      if (searchTerm) {
        const { data } = await API.get("/recipes/search/" + searchTerm);
        setSearchData(data);
      } else {
        try {
          const { data } = await API.get("/recipes");
          setSearchData(data);
          setRecipeData(data);
        } catch (e) {
          console.log(e);
        }
      }
    }
    fetchData();
  }, [searchTerm]);

  const searchValue = async (value) => {
    setSearchTerm(value);
  };

  const buildListItem = (recipe) => {
    return (
      <li key={recipe._id}>
        <Link to={`/recipes/${recipe._id}`}>{recipe.title}</Link>
      </li>
    );
  };

  const sort = (event) => {
    let temp = recipeData;
    if (event.target.value == "alpha") {
      temp.sort((a, b) => {
        const ra = a.title.toUpperCase();
        const rb = b.title.toUpperCase();

        if (ra > rb) return 1;
        if (rb > ra) return -1;
        return 0;
      });
    } else if (event.target.value == "date") {
      temp.sort((a, b) => {
        const da = a.datePosted;
        const db = b.datePosted;

        if (da > db) return 1;
        if (db > da) return -1;
        return 0;
      });
    }
    setRecipeData(temp);
    console.log(recipeData);
  };

  if (searchTerm) {
    console.log(searchData);
    li =
      searchData &&
      searchData.map((recipe) => {
        // let { recipe } = recipes;
        // console.log(recipe);
        return buildListItem(recipe);
      });
  } else {
    li =
      recipeData &&
      recipeData.map((recipe) => {
        return buildListItem(recipe);
      });
  }

  const handleSelect = (newKey) => {
    setKey(newKey);
  }

  return (
    <Container>
      <Row>
        <Col>
          <Tabs defaultActiveKey="allRecipes" onSelect={handleSelect} activeKey={key} id="uncontrolled-tab-example" style={{ marginTop: '5%' }}>
            <Tab eventKey="allRecipes" title="All Recipes">
              <div className="recipe-index">
                <h2 className="recipe-list-header">Recipe Index</h2>
                <div>

                </div>
                <label>Sort By: &nbsp;</label>
                <select onChange={sort} defaultValue="date">
                  <option value="alpha">Title</option>
                  <option value="date">Date Posted</option>
                </select>
                <ul className="recipe-list">{li}</ul>
              </div>
            </Tab>
            <Tab eventKey="searchRecipes" title="Search Recipes">
              <Search searchValue={searchValue} />
              <ul className="recipe-list">{li}</ul>
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default RecipeList;
