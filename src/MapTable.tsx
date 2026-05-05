import { useMemo, useState, type MouseEvent, type ReactElement } from "react";

import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import { visuallyHidden } from "@mui/utils";

import type { Data } from "./interfaces";

function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) return "N/A";
  const date = new Date(timestamp);
  return date.toLocaleString();
}

function formatPrice(price: number | undefined): string {
  if (!price) return "N/A";
  return new Intl.NumberFormat().format(price);
}

function getWikiLink(itemName: string): string {
  return `https://ffxiv.consolegameswiki.com/wiki/Timeworn_${itemName}_Map#Gathering`;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

function getComparator<Key extends PropertyKey>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
  id: keyof Data;
  label: string;
  numeric?: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: "name",
    label: "Map",
  },
  {
    id: "cheapest",
    numeric: true,
    label: "Lowest Listing",
  },
  {
    id: "recent",
    numeric: true,
    label: "Most Recent Purchase",
  },
  {
    id: "average",
    numeric: true,
    label: "Average Sale Price",
  },
  {
    id: "velocity",
    numeric: true,
    label: "Daily Sales",
  },
  {
    id: "exp",
    label: "Location",
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: MouseEvent<unknown>, property: keyof Data) => void;
  order: Order;
  orderBy: keyof Data;
}

function SortableTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property: keyof Data) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function MapTable({ data }: { data: Data[] }) {
  const rows: Data[] = data;
  const [order, setOrder] = useState<Order>("desc");
  const [orderBy, setOrderBy] = useState<keyof Data>("cheapest");

  const handleRequestSort = (event: MouseEvent<unknown>, property: keyof Data) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const visibleRows = useMemo(
    () => [...rows].sort(getComparator(order, orderBy)),
    [rows, order, orderBy],
  );

  return (
    <TableContainer component={Paper}>
      <Table aria-label="Map Price Table">
        <SortableTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {visibleRows.map((row) => {
            return (
              <TableRow hover key={row.id}>
                <TableCell>
                  <Link
                    href={`https://universalis.app/market/${row.id}`}
                    color="inherit"
                    aria-label={`View ${row.name} on Universalis`}
                  >
                    {row.name}
                  </Link>
                </TableCell>
                <TableCell align="right">{formatPrice(row.cheapest)}</TableCell>
                <TableCell align="right">
                  <Tooltip title={formatTimestamp(row.recentTimestamp)}>
                    {/* ReactElement type assertion because Tooltip expects a ReactNode */}
                    {formatPrice(row.recent) as unknown as ReactElement}
                  </Tooltip>
                </TableCell>
                <TableCell align="right">{formatPrice(row.average)}</TableCell>
                <TableCell align="right">{row.velocity}</TableCell>
                <TableCell>
                  {row.exp} (
                  <Link
                    href={getWikiLink(row.name)}
                    color="inherit"
                    aria-label={`${row.name} gathering location on the wiki`}
                  >
                    Wiki
                  </Link>
                  )
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
