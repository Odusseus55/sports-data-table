import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import axios from "axios";
import { Formik, Field, Form } from "formik";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";

export default function DataTable() {
  const [accessToken, setAccessToken] = useState();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [rows, setRows] = useState([]);
  const [alert, setAlert] = useState(false);

  const competition_uuid = "2f70259b-5609-47c9-92d4-008f9ef940f1";

  const initialColumns = [
    { field: "team", headerName: "Team", minWidth: 300, flex: 1 },
    { field: "player", headerName: "Player", minWidth: 300, flex: 1 },
    { field: "toi", headerName: "toi", flex: 1 },
    {
      field: "gp",
      headerName: "gp",
      flex: 1,
    },
    {
      field: "xg60",
      headerName: "xg60",
      flex: 1,
      hide: false,
    },
    { field: "c60", headerName: "c60", flex: 1, hide: false },
    { field: "sogc_pct", headerName: "sogc_pct", flex: 1, hide: false },
  ];

  const [columns, setColumns] = useState(initialColumns);

  useEffect(() => {
    //   declare async function
    const getAccessToken = async () => {
      const url = "http://logiq.statistics.datasport.cz/api/v1/token";
      const credentials = {
        grant_type: "client_credentials",
        client_id: "john",
        client_secret: "doe",
      };
      try {
        const response = await axios.post(url, credentials);
        setAccessToken(response.data.access_token);
        setButtonDisabled(false);
      } catch (e) {
        console.error(e);
      }
    };

    // function call
    getAccessToken();
  }, []);

  const getCompetitionData = async (params) => {
    const url = `http://logiq.statistics.datasport.cz/api/v1/individual/${competition_uuid}`;
    const headers = { Authorization: `Bearer ${accessToken}` };

    const setMetrics = [];
    if (params["xg60"]) {
      setMetrics.push("xg60");
    }
    if (params["c60"]) {
      setMetrics.push("c60");
    }
    if (params["sogc_pct"]) {
      setMetrics.push("sogc_pct");
    }
    const body = {
      gameState: "5:5",
      timeOnIce: 600,
      metrics: setMetrics,
    };

    const fetchedRows = [];
    setButtonDisabled(true);

    const newColumns = [];

    columns.forEach((column) => {
      if (column.field === "xg60") {
        column.hide = !params["xg60"];
      }
      if (column.field === "c60") {
        column.hide = !params["c60"];
      }
      if (column.field === "sogc_pct") {
        column.hide = !params["sogc_pct"];
      }
      newColumns.push(column);
    });

    try {
      const response = await axios.post(url, body, { headers });
      setButtonDisabled(false);
      response.data.forEach((team) => {
        team.players.forEach((player) => {
          let formattedToi = null;
          formattedToi = `${Math.round(player.stats.toi / 60)}:${Math.round(
            player.stats.toi % 60
          )}`;

          fetchedRows.push({
            id: `${team.team}_${player.player}`,
            team: team.team,
            player: player.player,
            toi: formattedToi,
            gp: player.stats.gp,
            xg60: player.stats.xg60,
            c60: player.stats.c60,
            sogc_pct: player.stats.sogc_pct,
          });
        });
      });
      setRows(fetchedRows);
      setColumns(newColumns);
    } catch (e) {
      console.error(e);
      setButtonDisabled(false);
    }
  };

  return (
    <div style={{ height: 700, width: "100%" }}>
      <Formik
        initialValues={{ xg60: true, c60: true, sogc_pct: true }}
        onSubmit={(values) => {
          if (!values["xg60"] && !values["c60"] && !values["sogc_pct"]) {
            setAlert(true);
          } else {
            setAlert(false);
            getCompetitionData(values);
          }
        }}
      >
        {() => (
          <Form>
            <Stack spacing={5} direction="row">
              <Button
                variant="contained"
                disabled={buttonDisabled}
                type="submit"
              >
                Get Data
              </Button>
              <Field
                as={FormControlLabel}
                type="checkbox"
                name="xg60"
                control={<Checkbox />}
                label="xg60"
              />
              <Field
                as={FormControlLabel}
                type="checkbox"
                name="c60"
                control={<Checkbox />}
                label="c60"
              />
              <Field
                as={FormControlLabel}
                type="checkbox"
                name="sogc_pct"
                control={<Checkbox />}
                label="sogc_pct"
              />
            </Stack>
          </Form>
        )}
      </Formik>

      {alert && (
        <Alert severity="warning" sx={{ marginTop: 2 }}>
          This is a warning alert — check it out!
        </Alert>
      )}

      <DataGrid
        rows={rows}
        columns={columns}
        responsive="scrollFullHeight"
        sx={{ marginTop: 3 }}
        // pageSize={10}
        // rowsPerPageOptions={[5]}
        // checkboxSelection
      />
    </div>
  );
}
