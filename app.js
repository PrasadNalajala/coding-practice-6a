const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");

let db = null;
const dbPath = path.join(__dirname, "covid19India.db");

app.use(express.json());

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at 3000");
    });
  } catch (e) {
    console.log("Got an Error in initialization");
  }
};
initializeDb();

//GET

app.get("/states", async (request, response) => {
  const query = `
    SELECT state_id as stateId , state_name as stateName  , population 
    FROM
    state`;
  const states = await db.all(query);
  // console.log(states);
  response.send(states);
});

//GET

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `
    SELECT state_id as stateId , state_name as stateName  , population 
    FROM
    state
    WHERE
    state_id=${stateId}`;
  const state = await db.get(query);
  response.send(state);
});

//POST

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, active, cured, deaths } = request.body;
  try {
    const query = `
      INSERT INTO district(district_name, state_id, cases, cured, active, deaths)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const dist = await db.run(query, [
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    ]);
    response.send("District Successfully Added");
  } catch (e) {
    console.log("ERROR In", e);
  }
});

app.get("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const query = `
    SELECT district_id as districtId , district_name as districtName , state_id as stateId , cases , cured,active,deaths
     FROM district WHERE district_id=${districtId}`;
    const district = await db.get(query);
    response.send(district);
  } catch (e) {
    console.log(e);
  }
});

app.delete("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const query = `
    DELETE  FROM district WHERE district_id=${districtId}`;
    const district = await db.run(query);
    response.send("District Removed");
  } catch (e) {
    console.log(e);
  }
});

app.put("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const districtData = request.body;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = districtData;

    const query = `
        UPDATE district 
        SET
        district_name = ?,
        state_id = ?,
        cases = ?,
        cured = ?,
        active = ?,
        deaths = ?
        WHERE district_id = ?
    `;

    await db.run(query, [
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
      districtId, // include districtId in the parameters
    ]);

    response.send("District Details Updated");
  } catch (e) {
    console.log(e);
    response.status(500).send("Error updating district details");
  }
});

app.get("/states/:stateId/stats/", async (request, response) => {
  try {
    const { stateId } = request.params;
    const query = `
    SELECT SUM(cases) as totalCases, SUM(cured) as totalCured, SUM(active) as totalActive, SUM(deaths) as totalDeaths
    FROM state
    INNER JOIN district ON district.state_id = state.state_id
    WHERE state.state_id = ${stateId}`;
    const data = await db.get(query);
    console.log(stateId);
    response.send(data);
  } catch (e) {
    console.log(e);
    response.status(500).send("Internal Server Error");
  }
});

app.get("/districts/:districtId/details/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const query = `
    SELECT
    state_name
    FROM 
    state
    INNER JOIN district ON district.state_id=state.state_id
    WHERE
    district.state_id=${districtId}
    `;
    const state = await db.get(query);
    const convertDbObjectToResponseObject = (state) => {
      return {
        stateName: state.state_name,
      };
    };
    response.send(convertDbObjectToResponseObject(state));
  } catch (e) {
    console.log(e);
  }
});

module.exports = app;
