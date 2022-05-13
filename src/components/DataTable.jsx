import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import axios from "axios";

export default function DataTable() {
  const [accessToken, setAccessToken] = useState();
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [rows, setRows] = useState([]);
  const competition_uuid = "2f70259b-5609-47c9-92d4-008f9ef940f1";

  const columns = [
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
    },
    { field: "c60", headerName: "c60", flex: 1 },
    { field: "sogc_pct", headerName: "sogc_pct", flex: 1 },
  ];

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

  const getCompetitionData = async () => {
    const url = `http://logiq.statistics.datasport.cz/api/v1/individual/${competition_uuid}`;
    const headers = { Authorization: `Bearer ${accessToken}` };
    const body = {
      gameState: "5:5",
      timeOnIce: 600,
      metrics: ["xg60", "c60", "sogc_pct"],
    };
    const fetchedRows = [];
    setButtonDisabled(true);

    try {
      const response = await axios.post(url, body, { headers });
      console.log(response.data);
      setButtonDisabled(false);
      response.data.forEach((team) => {
        team.players.forEach((player) => {
          fetchedRows.push({
            id: `${team.team}_${player.player}`,
            team: team.team,
            player: player.player,
            toi: player.stats.toi,
            gp: player.stats.gp,
            xg60: player.stats.xg60,
            c60: player.stats.c60,
            sogc_pct: player.stats.sogc_pct,
          });
        });
      });
      setRows(fetchedRows);
    } catch (e) {
      console.error(e);
      setButtonDisabled(false);
    }
  };

  return (
    <div style={{ height: 700, width: "100%" }}>
      <Stack spacing={2} direction="row">
        <Button
          variant="contained"
          onClick={getCompetitionData}
          disabled={buttonDisabled}
        >
          Contained
        </Button>
      </Stack>

      <DataGrid
        rows={rows}
        columns={columns}
        responsive="scrollFullHeight"
        // pageSize={10}
        // rowsPerPageOptions={[5]}
        // checkboxSelection
      />
    </div>
  );
}
