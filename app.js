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

app.get("/states", async (request, response) => {
  const query = `
    SELECT * 
    FROM
    state`;
  const states = await db.all(query);
  // console.log(states);
  response.send(states);
});

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const query = `
    SELECT * 
    FROM
    state
    WHERE
    state_id=${stateId}`;
  const state = await db.get(query);
  response.send(state);
});

app.post("/districts/", async (request, response) => {
  // console.log(request);
  const { districtName, stateId, cases, active, cured, deaths } = request.body;
  // console.log("Parsed values", request.body);
  const query = `
              INSERT INTO
              district(district_name,state_id,cases,cured,active,deaths)
              VALUES
              ${districtName},
              ${stateId},
              ${cases},
              ${cured}
              ${active},
              ${deaths}
              `;
  const dist = await db.run(query);
  response.send("dist");
});

module.exports = app;
