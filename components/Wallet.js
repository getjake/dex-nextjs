import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Item } from 'src/theme';
import {
  Paper,
  Box,
  Grid,
  Typography,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  Snackbar,
  Alert,
  Stack,
  Backdrop,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  OutlinedInput,
  InputAdornment,
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
  contractsRead,
} from 'utils/const';

const DIRECTION = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
};

const Wallet = () => {
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
    refreshDataTimestamp
  } = state;

  const [tokenBalances, setTokenBalances] = useState({});
  const [direction, setDirection] = useState(DIRECTION.DEPOSIT);

  const directionHandler = (event, newDirection) => {
    setDirection(newDirection);
  };

  const [amount, setAmount] = useState("");
  const onAmountChangeHandler = (event) => {
    const _amount = event.target.value.replace(/[^(\d+)\.(\d+)]/g, '');
    setAmount(_amount);
  };

  const submitHandler = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      enqueueSnackbar('Invalid amount!', {
        variant: 'error',
      });
      return;
    }

    const amountWei = ethers.utils.parseEther(amount.toString());
    if (direction === DIRECTION.DEPOSIT) {
      try {
        // check enough balance
        const availableBalance = parseFloat(tokenBalances.wallet);
        const toDeposit = parseFloat(amount);
        if (toDeposit > availableBalance) {
          enqueueSnackbar('Insufficient funds to deposit', {
            variant: 'error',
          });
          return;
        }

        // check allowance
        const allowance = await contractsRead[selectedToken].allowance(
          account,
          dexAddress
        );
        if (!allowance.gt(amountWei)) {
          await contracts[
            `${selectedToken.toLowerCase()}ContractWrite`
          ].approve(dexAddress, '100000000000000000000000000');
        }

        await contracts.dexContractWrite.deposit(
          amountWei,
          ethers.utils.formatBytes32String(selectedToken)
        );
        dispatch({type: 'UPDATE_SNACK_INFO', payload: {text: 'Deposit Request Submitted to Blockchain', alert: 'info'}})
      } catch (error) {
        enqueueSnackbar('Deposit failed. Please try again.', {
          variant: 'error',
        });
      }
    }

    if (direction === DIRECTION.WITHDRAW) {
      try {
        // check enough balance
        const availableBalance = parseFloat(tokenBalances.dex);
        const toWithdraw = parseFloat(amount);
        if (toWithdraw > availableBalance) {
          enqueueSnackbar('Insufficient funds to withdraw', {
            variant: 'error',
          });
          return;
        }

        await contracts.dexContractWrite.withdraw(
          amountWei,
          ethers.utils.formatBytes32String(selectedToken)
        );
        dispatch({type: 'UPDATE_SNACK_INFO', payload: 'Withdraw Request Submitted to Blockchain'})

      } catch (error) {
        enqueueSnackbar('Withdraw failed. Please try again.', {
          variant: 'error',
        });
      }
    }
  };

  // Update Balance on Interface
  useEffect(() => {
    try {
      const userTokenBalances = balances[account][selectedToken];
      setTokenBalances({
        ...userTokenBalances,
      });
    } catch (error) {}
  }, [balances, account]);

  useEffect(() => {
    if (!contracts || !selectedToken || !account) return;

 
    // Upate Balances - TOKEM
    const getBalanceWallet = async (token) => {
      const _tokenContractRead = contractsRead[token];
      let balanceWallet = await _tokenContractRead.balanceOf(account);
      balanceWallet = ethers.utils.formatEther(balanceWallet.toString()); // normal float
      return balanceWallet;
    };

    const getBalanceDex = async (token) => {
      let balance = await contractsRead.dex.traderBalances(
        account,
        ethers.utils.formatBytes32String(token.toUpperCase())
      );
      balance = ethers.utils.formatEther(balance.toString());
      return balance;
    };

    const fetchBalances = async (token) => {
      const walletBalance = await getBalanceWallet(token);
      const dexBalance = await getBalanceDex(token);
      const userBalance = {
        account: account,
        token: token,
        balance: {
          wallet: walletBalance,
          dex: dexBalance,
        },
      };

      dispatch({ type: 'UPDATE_USER_BALANCES', payload: userBalance });
    };
    fetchBalances(selectedToken);
    fetchBalances('DAI');
  }, [contracts, selectedToken, account, transferEvent, refreshDataTimestamp]);

  return (
    <Box sx={{ width: 250, marginTop: '5px', marginLeft: '5px' }}>
      <Item>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccountBalanceWallet />
            </ListItemIcon>
            <ListItemText
              primary={selectedToken ? `Wallet - ${selectedToken}` : 'Wallet'}
            />
          </ListItem>
          <Divider />
          <Grid container style={{ marginTop: '10px' }}>
            <Grid item xs={4}>
              <Typography style={{ textAlign: 'center', color: 'black' }}>
                Wallet
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography style={{ textAlign: 'right', color: 'black' }}>
                {tokenBalances ? tokenBalances.wallet : '0'}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography style={{ textAlign: 'center', color: 'black' }}>
                DEX
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'right', color: 'black' }}>
              <Typography>{tokenBalances ? tokenBalances.dex : '0'}</Typography>
            </Grid>
          </Grid>
          <ListItem>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '20ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <ToggleButtonGroup
                value={direction}
                exclusive
                onChange={directionHandler}
                aria-label="text direction"
              >
                <ToggleButton value="DEPOSIT" aria-label="deposit">
                  DEPOSIT
                </ToggleButton>
                <ToggleButton value="WITHDRAW" aria-label="withdraw">
                  WITHDRAW
                </ToggleButton>
              </ToggleButtonGroup>
              <TextField
                id="outlined-basic"
                label="AMOUNT"
                variant="outlined"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                onChange={onAmountChangeHandler}
                value={amount}
                fullWidth
              />
              <Button
                disabled={!signer}
                variant="contained"
                fullWidth
                onClick={submitHandler}
              >
                SUBMIT
              </Button>
            </Box>
          </ListItem>
        </List>
      </Item>
    </Box>
  );
};

export default Wallet;
