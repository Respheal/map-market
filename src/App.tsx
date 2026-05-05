import { Box, Flex, Input, Table, FormatNumber, Link, Span } from "@chakra-ui/react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const mapsMeta = {
  6689: "Goatskin",
  6690: "Toadskin",
  6691: "Boarskin",
  43556: "Loboskin",
  36611: "Saigaskin",
  6692: "Peisteskin",
  12242: "Wyvernskin",
  12243: "Dragonskin",
  17835: "Gaganaskin",
  26744: "Gliderskin",
  26745: "Zonureskin",
  43557: "Br'aaxskin",
  12241: "Archaeoskin",
  17836: "Gazelleskin",
  36612: "Kumbhiraskin",
  46185: "Gargantuaskin",
};
const mapIds = Object.keys(mapsMeta).map(Number);

interface ApiResponse {
  results: MapData[];
}

interface MapData {
  itemId: number;
  nq: {
    minListing: {
      world?: { price: number };
      dc?: { price: number; worldId: number };
      region?: { price: number; worldId: number };
    };
    recentPurchase: {
      world?: { price: number; timestamp: number };
      dc?: { price: number; timestamp: number; worldId: number };
      region?: { price: number; timestamp: number; worldId: number };
    };
    averageSalePrice: {
      world?: { price: number };
      dc?: { price: number };
      region?: { price: number };
    };
    dailySaleVelocity: {
      world?: { quantity: number };
      dc?: { quantity: number };
      region?: { quantity: number };
    };
  };
  worldUploadTimes: { worldId: number; timestamp: number }[];
}

export function App() {
  const [server, setServer] = useState<string>(""); // server input state
  const [debouncedServer, setDebouncedServer] = useState(server); // debouncer for server
  const { data, error } = useQuery(getMapOptions(debouncedServer));

  // Wait a sec before updating the server and thus pulling from the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedServer(server);
    }, 1000);
    return () => clearTimeout(timer);
  }, [server]);

  async function getMapData(server: string = ""): Promise<ApiResponse> {
    const response = await fetch(
      `https://universalis.app/api/v2/aggregated/${server}/${mapIds.join(",")}`,
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

  function formatTimestamp(timestamp: number | undefined): string {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleString();
  }

  function getWikiLink(itemName: string): string {
    return `https://ffxiv.consolegameswiki.com/wiki/Timeworn_${itemName}_Map#Gathering`;
  }

  function displayTable(maps: MapData[]) {
    console.log(maps);
    if (maps.length === 0) {
      return <Box>Enter a server to receive maps.</Box>;
    }
    return (
      <Table.Root size="sm" variant="outline">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Map Name</Table.ColumnHeader>
            <Table.ColumnHeader>Lowest Listing</Table.ColumnHeader>
            <Table.ColumnHeader>Most Recent Purchase</Table.ColumnHeader>
            <Table.ColumnHeader>Average Sale Price</Table.ColumnHeader>
            <Table.ColumnHeader>Daily Sale Velocity</Table.ColumnHeader>
            <Table.ColumnHeader>Gathering Location</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {maps.map((item) => (
            <Table.Row key={item.itemId}>
              {/* Name */}
              <Table.Cell>
                <Link
                  variant="underline"
                  href={`https://universalis.app/market/${item.itemId}`}
                >
                  {mapsMeta[item.itemId as keyof typeof mapsMeta]}
                </Link>
              </Table.Cell>
              {/* Lowest Listing */}
              <Table.Cell>
                <FormatNumber
                  value={
                    item.nq.minListing.world?.price ||
                    item.nq.minListing.dc?.price ||
                    item.nq.minListing.region?.price ||
                    0
                  }
                />
              </Table.Cell>
              {/* Most Recent Purchase */}
              <Table.Cell textAlign="end">
                <FormatNumber
                  value={
                    item.nq.recentPurchase.world?.price ||
                    item.nq.recentPurchase.dc?.price ||
                    item.nq.recentPurchase.region?.price ||
                    0
                  }
                />{" "}
                <Span color={"fg.muted"}>
                  (
                  {formatTimestamp(
                    item.nq.recentPurchase.world?.timestamp ||
                      item.nq.recentPurchase.dc?.timestamp ||
                      item.nq.recentPurchase.region?.timestamp,
                  )}
                  )
                </Span>
              </Table.Cell>
              {/* Average Sale Price */}
              <Table.Cell textAlign="end">
                <FormatNumber
                  value={
                    item.nq.averageSalePrice.world?.price ||
                    item.nq.averageSalePrice.dc?.price ||
                    item.nq.averageSalePrice.region?.price ||
                    0
                  }
                />
              </Table.Cell>
              {/* Daily Sale Velocity */}
              <Table.Cell textAlign="end">
                <FormatNumber
                  value={
                    item.nq.dailySaleVelocity.world?.quantity ||
                    item.nq.dailySaleVelocity.dc?.quantity ||
                    item.nq.dailySaleVelocity.region?.quantity ||
                    0
                  }
                />
              </Table.Cell>
              {/* Gathering Location */}
              <Table.Cell>
                <Link
                  variant="underline"
                  href={getWikiLink(mapsMeta[item.itemId as keyof typeof mapsMeta])}
                >
                  Wiki
                </Link>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    );
  }

  if (error) {
    return <Box>Error fetching data. Please try again.</Box>;
  }

  return (
    <Flex justifyContent={"center"}>
      <Box>
        <Input
          placeholder="Server"
          value={server}
          onChange={(e) => setServer(e.target.value)}
        />
        {displayTable(data?.results || [])}
      </Box>
    </Flex>
  );
}
