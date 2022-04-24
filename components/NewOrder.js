import React, { useState, useEffect, useContext } from 'react';
import { ethers } from 'ethers';
import { Item } from 'src/theme';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,

} from '@mui/material/';
import {
  AddShoppingCart,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { Store } from 'utils/Store';


const ORDER_TYPE = {
  LIMIT: 'LIMIT',
  MARKET: 'MARKET',
};

const ORDER_SIDE = {
  BUY: 'BUY',
  SELL: 'SIDE',
};
const NewOrder = () => {
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
  } = state;

  const [orderType, setOrderType] = useState(ORDER_TYPE.LIMIT);
  const [orderSide, setOrderSide] = useState(ORDER_SIDE.BUY);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const orderTypeChangeHandler = (e, newType) => {
    setOrderType(newType);
  };
  const orderSideChangeHandler = (e, newSide) => {
    setOrderSide(newSide);
  };
  const onAmountChangeHandler = (event) => {
    const _amount = event.target.value.replace(/[^(\d+)\.(\d+)]/g, '');
    setAmount(_amount);
  };
  const onPriceChangeHandler = (event) => {
    const _price = event.target.value.replace(/[^(\d+)\.(\d+)]/g, '');
    setPrice(_price);
  };

  const orderInputValidater = () => {
    if (!orderSide || !orderType) {
      enqueueSnackbar('You must select TYPE and SIDE', {
        variant: 'error',
      });
      return false;
    }

    if (selectedToken === 'DAI') {
      enqueueSnackbar('You cannot trade DAI', {
        variant: 'error',
      });
      return false;
    }
    const userBalanceToken = balances[account][selectedToken].dex;
    const userBalanceDai = balances[account]['DAI'].dex;
    if (orderType === ORDER_TYPE.LIMIT && (!amount || !price)) {
      enqueueSnackbar('Invalid Order Input', {
        variant: 'error',
      });
      return false;
    }
    if (orderType === ORDER_TYPE.MARKET && !amount) {
      enqueueSnackbar('Invalid Order Input', {
        variant: 'error',
      });
      return false;
    }
    if (orderSide === ORDER_SIDE.BUY && orderType === ORDER_TYPE.LIMIT) {
      const requiredBalanceDaiDex = parseFloat(amount) * parseFloat(price);
      if (parseFloat(userBalanceDai) < requiredBalanceDaiDex) {
        enqueueSnackbar('Insuccifient DAI', {
          variant: 'error',
        });

        return false;
      }
    }

    if (orderSide === ORDER_SIDE.SELL) {
      if (parseFloat(userBalanceToken) < amount) {
        enqueueSnackbar(`Insuccifient ${selectedToken} to Sell`, {
          variant: 'error',
        });
        return false;
      }
    }

    return true;
  };

  const placeOrderHandler = async () => {
    // transaction params
    const validated = orderInputValidater();
    if (!validated) return;
    const _ticker = ethers.utils.formatBytes32String(selectedToken);
    const _amount = ethers.utils.parseEther(amount);
    const _side = orderSide === ORDER_SIDE.BUY ? 0 : 1;

    if (orderType === ORDER_TYPE.LIMIT) {
      const _price = price.toString();
      await contracts.dexContractWrite.createLimitOrder(
        _ticker,
        _amount,
        _price,
        _side
      );
    }
    if (orderType === ORDER_TYPE.MARKET) {
      await contracts.dexContractWrite.createMarketOrder(
        _ticker,
        _amount,
        _side
      );
    }

    dispatch({type: 'UPDATE_SNACK_INFO', payload: {text: 'New Order Submitted to Blockchain', alert: 'info'}})
  };

  return (
    <Box sx={{ width: 250, marginTop: '20px', marginLeft: '5px' }}>
      <Item>
        <List>
          <ListItem>
            <ListItemIcon>
              <AddShoppingCart />
            </ListItemIcon>
            <ListItemText primary="New Order" />
          </ListItem>
          <Divider />

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
                fullWidth
                value={orderType}
                exclusive
                onChange={orderTypeChangeHandler}
                aria-label="text order type"
              >
                <ToggleButton value="LIMIT" aria-label="LIMIT">
                  {ORDER_TYPE.LIMIT}
                </ToggleButton>
                <ToggleButton value="MARKET" aria-label="MARKET">
                  {ORDER_TYPE.MARKET}
                </ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                fullWidth
                value={orderSide}
                exclusive
                onChange={orderSideChangeHandler}
                aria-label="text order type"
              >
                <ToggleButton value={ORDER_SIDE.BUY} aria-label="BUY">
                  BUY
                </ToggleButton>
                <ToggleButton value={ORDER_SIDE.SELL} aria-label="SELL">
                  SELL
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
              {orderType === ORDER_TYPE.LIMIT && (
                <TextField
                  id="outlined-basic"
                  label="PRICE"
                  variant="outlined"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  onChange={onPriceChangeHandler}
                  value={price}
                  fullWidth
                />
              )}

              <Button
                disabled={!signer}
                variant="contained"
                fullWidth
                onClick={placeOrderHandler}
              >
                PLACE ORDER
              </Button>
            </Box>
          </ListItem>
        </List>
      </Item>
    </Box>
  );
};

export default NewOrder;
