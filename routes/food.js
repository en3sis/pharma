var express = require('express');
var router = express.Router();
const fetch = require('node-fetch')
require('dotenv').config()


/* ==========================================================================
  APIS
  ========================================================================== */
const FOOD_URL = 'https://trackapi.nutritionix.com/v2/natural/nutrients/'
const EXERCISE_URL = 'https://trackapi.nutritionix.com/v2/natural/exercise/'

/* ==========================================================================
  FOOD AND EXERCISE API HERE
  ========================================================================== */
  router.get('/food', function(req, res, next) {
    const food_type = req.query.food
    const exercise = req.query.exercise
    console.log(exercise)

    fetch(FOOD_URL, {
    method: 'POST',
    body: JSON.stringify({"query":food_type}),
    headers: {
      "Content-Type": "application/json",
      "x-app-id": process.env.FOOD_ID,
      "x-app-key": process.env.FOOD_KEY
    }
  })
  .then(function(response){
    var json_obj = response.json()
    return json_obj
  })
  .then(function(json){
        //var food_name = json_obj[0][0][0]
        //console.log(json.foods)
    var calories = json.foods[0].nf_calories;
    var calories_string = `${calories} calories ${exercise}` 

    var test = fetch(EXERCISE_URL, {
      method: 'POST',
      body: JSON.stringify(
      {
        "query":calories_string
       }),
      headers: {
        "Content-Type": "application/json",
        "x-app-id": process.env.FOOD_ID,
        "x-app-key": process.env.FOOD_KEY
      }
    });
    return test
  })
  .then(function(result){
    var json_obj = result.json()
    return json_obj

  })
  .then(function(json){
    var duration_min = json.exercises[0].duration_min;
    res.send({duration_min})
  })
})

module.exports = router;
