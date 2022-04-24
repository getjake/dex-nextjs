import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Item } from 'src/theme';
import Moment from 'react-moment';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material/';
import {
  Inbox,
  Drafts,
  AccountBalanceWallet,
  ShowChart,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Store } from 'utils/Store';
import {
  daiAddress,
  batAddress,
  repAddress,
  zrxAddress,
  dexAddress,
  defaultProvider,
  defaultNetworkId,
  contractsRead,
  itemsNumberToShow,
} from 'utils/const';

const AllTrades = () => {
  const { state, dispatch } = useContext(Store);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {
    account,
    tokens,
    selectedToken,
    contracts,
    signer,
    balances,
    transferEvent,
    allOrders,
    tradeHistory,
  } = state;

  const [trades, setTrades] = useState([]);

  // Format Data
  useEffect(() => {
    const _trades = tradeHistory.map((trade) => ({
      tradeId: trade.args[0].toNumber(),
      date: new Date(trade.args[7].toNumber() * 1000),
      price: trade.args[6].toNumber(),
    }));
    setTrades(_trades);
  }, [tradeHistory]);

  return (
    <Box sx={{ marginTop: '5px', marginLeft: '5px' }}>
      <Item>
        <List>
          <ListItem>
            <ListItemIcon>
              <ShowChart />
            </ListItemIcon>
            <ListItemText primary={`All Trades`} />
          </ListItem>
          <Divider />
          {selectedToken === 'DAI' ? (
            <Typography>Please select the trading tokens!</Typography>
          ) : (
            <Grid container spacing={1}>
              {/* CHARTS */}

              {trades.length > 0 && (
                <Grid item xs={12}>
                  <ResponsiveContainer height={200}>
                    <LineChart width="100%" data={trades}>
                      <Line
                        strokeWidth="3"
                        type="monotone"
                        dataKey="price"
                        stroke="#556cd6"
                      />
                      <CartesianGrid stroke="#000000" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                        }}
                      />
                      <YAxis dataKey="price" />
                    </LineChart>
                  </ResponsiveContainer>
                </Grid>
              )}

              {/* TABLE */}
              <Grid item xs={12}>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 300 }}
                    size="small"
                    aria-label="all trades"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tradeHistory
                        .slice(-itemsNumberToShow)
                        .reverse()
                        .map((trade) => (
                          <TableRow
                            key={trade.args.tradeId.toNumber()}
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell align="right">
                              {ethers.utils.formatEther(trade.args[5])}
                            </TableCell>
                            <TableCell align="right">
                              {trade.args[6].toNumber()}
                            </TableCell>
                            <TableCell align="right">
                              <Moment fromNow>
                                {new Date(
                                  trade.args[7].toNumber() * 1000
                                ).toISOString()}
                              </Moment>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            </Grid>
          )}
        </List>
      </Item>
    </Box>
  );
};

export default AllTrades;
