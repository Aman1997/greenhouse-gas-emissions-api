const express = require("express");
const util = require("util");
const url = require("url");
var path = require('path');
const connectToDB = require("./utils/connectToDB");
const caching = require("./utils/caching");
const checkQueryString = require("./utils/checkQueryString");
const app = express();

let cacheObj = {};

// database connection
const db = connectToDB();
db.all = util.promisify(db.all);

// serving static file
app.use(express.static("public"))

console.log(__dirname)

// API spec file
app.get("/", async (req, res) => {
    res.sendFile(path.join(__dirname, '/public/apiSpec.html'))
});

// return all the countries from database
app.get("/countries", async (req, res) => {
  const cacheVal = caching(cacheObj, "/countries");

  // checking for data in cache
  if (cacheVal) {
    return res.status(200).send(cacheVal);
  }

  try {
    const sql = `SELECT id, country_or_area AS country, MIN(year) AS startYear, MAX(year) AS endYear FROM gas_emissions GROUP BY country_or_area`;
    const result = await db.all(sql);
    cacheObj["/countries"] = result;
    res.send(result);
  } catch (err) {
    return console.error(err.message);
  }
});

//http://localhost:3000/countries/id?queries=StartYear|EndYear&params=CO2,NO2
// return values as per parameters
app.get("/countries/id", async (req, res) => {
  const queryData = url.parse(req.url, true).query;

  if (!checkQueryString(queryData)) return res.status(400).send("Invalid query parameters")

  // checking for data in cache
  const cacheVal = caching(
    cacheObj,
    "/countries/id",
    queryData.queries,
    queryData.params
  );
  if (cacheVal) {
    return res.status(200).send(cacheVal);
  }

  const startYear = queryData.queries.split("|")[0];
  const endYear = queryData.queries.split("|")[1];
  const params = queryData.params.split(",");

  try {
    const sql = `SELECT id, country_or_area AS country, year, value, category FROM gas_emissions WHERE year BETWEEN ? and ?`;
    const result = await db.all(sql, [startYear, endYear]);

    let finalResult = [];
    params.forEach(
      (value) =>
        (finalResult = [
          ...finalResult,
          ...result.filter((record) =>
            record.category.includes(value.toLowerCase())
          ),
        ])
    );

    cacheObj["/countries/id"] = {
      params: { temporal: queryData.queries, parameters: queryData.params },
      value: finalResult,
    };

    res.send(finalResult);
  } catch (err) {
    return console.error(err.message);
  }

  res.status(200);
});

// server liostening on port 3000
app.listen(process.env.PORT || 3000, () => console.log("Server is running!"));
