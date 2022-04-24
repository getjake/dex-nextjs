import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Item } from 'src/theme';
import Moment from 'react-moment';

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
} from 'utils/const';

const MyOrders = () => {
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
    refreshDataTimestamp,
  } = state;

  return (
    <Box sx={{ marginTop: '5px', marginLeft: '5px' }}>
      <Item>
        <List>
          <ListItem>
            <ListItemIcon>
              <ShowChart />
            </ListItemIcon>
            <ListItemText primary={`My Limit Orders`} />
          </ListItem>
          <Divider />
          {selectedToken === 'DAI' ? (
            <Typography>Please select the trading tokens!</Typography>
          ) : (
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography>BUY</Typography>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 300 }}
                    size="small"
                    aria-label="buy orders"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">Amount / Filled</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allOrders.buyOrders.filter(order => order[1].toLowerCase() === account.toLowerCase()).map((order) => (
                        <TableRow
                          key={order[0].toNumber()}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="right">
                            {ethers.utils.formatEther(order[4])} / {
                              ethers.utils.formatEther(order[5])}
                          </TableCell>
                          <TableCell align="right">
                            {order[6].toNumber()}
                          </TableCell>
                          <TableCell align="right">
                            <Moment fromNow>
                              {new Date(
                                order[7].toNumber() * 1000
                              ).toISOString()}
                            </Moment>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              <Grid item xs={6}>
                <Typography>SELL</Typography>
                <TableContainer component={Paper}>
                  <Table
                    sx={{ minWidth: 300 }}
                    size="small"
                    aria-label="sell orders"
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell align="right">Amount / Filled</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {allOrders.sellOrders.filter(order => order[1].toLowerCase() === account.toLowerCase()).map((order) => (
                        <TableRow
                          key={order[0].toNumber()}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                          }}
                        >
                          <TableCell align="right">
                            {ethers.utils.formatEther(order[4])} / {
                              ethers.utils.formatEther(order[5])}
                          </TableCell>
                          <TableCell align="right">
                            {order[6].toNumber()}
                          </TableCell>
                          <TableCell align="right">
                            <Moment fromNow>
                              {new Date(
                                order[7].toNumber() * 1000
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

export default MyOrders;
