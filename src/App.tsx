import { useEffect, useState } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import GitHubIcon from "@mui/icons-material/GitHub";
import IconButton from "@mui/material/IconButton";

import { ThemeToggle } from "./ThemeToggle";
import MapTable from "./MapTable";
import { worlds } from "./worlds";
import type { ApiResponse, Data, MapData } from "./interfaces";

const mapsMeta = {
  6688: { name: "Leather", exp: "ARR" },
  6689: { name: "Goatskin", exp: "ARR" },
  6690: { name: "Toadskin", exp: "ARR" },
  6691: { name: "Boarskin", exp: "ARR" },
  6692: { name: "Peisteskin", exp: "ARR" },

  12241: { name: "Archaeoskin", exp: "HW" },
  12242: { name: "Wyvernskin", exp: "HW" },
  12243: { name: "Dragonskin", exp: "HW" },

  17835: { name: "Gaganaskin", exp: "StB" },
  17836: { name: "Gazelleskin", exp: "StB" },

  26744: { name: "Gliderskin", exp: "ShB" },
  26745: { name: "Zonureskin", exp: "ShB" },

  36611: { name: "Saigaskin", exp: "EW" },
  36612: { name: "Kumbhiraskin", exp: "EW" },
  39591: { name: "Ophiotauroskin", exp: "EW" },

  43556: { name: "Loboskin", exp: "DT" },
  43557: { name: "Br'aaxskin", exp: "DT" },
  46185: { name: "Gargantuaskin", exp: "DT" },
};
const mapIds = Object.keys(mapsMeta).map(Number);

export function App() {
  const [server, setServer] = useState<string>("");
  const [debouncedServer, setDebouncedServer] = useState(server); // debouncer for server
  const { data, isLoading, error } = useQuery(getMapOptions(debouncedServer));

  // Wait a sec before updating the server and thus pulling from the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServer(server);
    }, 1000);
    return () => clearTimeout(timer);
  }, [server]);

  async function getMapData(server: string): Promise<ApiResponse> {
    const safeServer = server.replace(/\s/g, "-");
    const response = await fetch(
      `https://universalis.app/api/v2/aggregated/${safeServer}/${mapIds.join(",")}`,
    );
    return await response.json();
  }

  function getMapOptions(server: string) {
    return queryOptions({
      queryKey: ["maps", server],
      queryFn: () => getMapData(server),
      enabled: !!server && server.length > 0, // only fetch if server is not empty
    });
  }

  function processData(data: MapData[]): Data[] {
    return data.map((map) => {
      const meta = mapsMeta[map.itemId as keyof typeof mapsMeta];
      return {
        id: map.itemId,
        name: meta.name,
        exp: meta.exp,
        cheapest:
          map.nq.minListing.world?.price ||
          map.nq.minListing.dc?.price ||
          map.nq.minListing.region?.price ||
          0,
        recent:
          map.nq.recentPurchase.world?.price ||
          map.nq.recentPurchase.dc?.price ||
          map.nq.recentPurchase.region?.price ||
          0,
        recentTimestamp:
          map.nq.recentPurchase.world?.timestamp ||
          map.nq.recentPurchase.dc?.timestamp ||
          map.nq.recentPurchase.region?.timestamp ||
          0,
        average: Math.round(
          map.nq.averageSalePrice.world?.price ||
            map.nq.averageSalePrice.dc?.price ||
            map.nq.averageSalePrice.region?.price ||
            0,
        ),
        velocity:
          Math.round(
            (map.nq.dailySaleVelocity.world?.quantity ||
              map.nq.dailySaleVelocity.dc?.quantity ||
              map.nq.dailySaleVelocity.region?.quantity ||
              0) * 100,
          ) / 100,
      };
    });
  }

  function renderTable(data: ApiResponse | undefined) {
    if (!data) {
      return <Box>Enter a server to receive maps.</Box>;
    }
    if (data.status === 404) {
      return <Box>Unknown world/DC/region.</Box>;
    }
    if (data.results && data.results.length > 0) {
      return <MapTable data={processData(data.results ? data.results : [])} />;
    }
    return <Box>No data available for the selected server.</Box>;
  }

  if (error) {
    return <Box>Error fetching data. Please try again.</Box>;
  }

  return (
    <Container>
      <Box sx={{ p: { sm: 3 }, py: { xs: 3, sm: 5 } }}>
        <Stack spacing={2}>
          <Autocomplete
            options={worlds}
            renderInput={(params) => <TextField {...params} label="Server" />}
            value={server}
            onChange={(event, newValue) => setServer(newValue || "")}
          />
          {isLoading ? <Box>Loading...</Box> : renderTable(data)}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <ThemeToggle />
            <IconButton
              aria-label="View the repo on GitHub"
              href="https://github.com/Respheal/map-market"
            >
              <GitHubIcon />
            </IconButton>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}
