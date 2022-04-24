import React, { useState, useEffect, useContext } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Chip,
} from '@mui/material';
import axios from 'axios';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useSnackbar } from 'notistack';
import { Store } from 'utils/Store';

const Header = ({ onConnectWalletHandler, disconnectWallet }) => {
  const { state, dispatch } = useContext(Store);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { account, tokens, tradingTokens, selectedToken } = state;
  const [anchorEl, setAnchorEl] = useState();
  const onClickHandlerOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const getFaucet = async () => {
    enqueueSnackbar('Seeding your account', {
      variant: 'info',
    });
    try {
      await axios.get(`/api/faucet/${account}`);
      enqueueSnackbar('Your Account has been seeded!', {
        variant: 'success',
      });
    } catch (error) {
      console.log(error)
      enqueueSnackbar('Seeding your account failed!', {
        variant: 'error',
      });
    }
  };

  // SELECT SYMBOL
  const onClickHandlerClose = (event, symbol) => {
    dispatch({ type: 'UPDATE_SELECTED_TOKEN', payload: symbol });
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={onClickHandlerOpen}
          >
            <ArrowDropDownIcon />
          </IconButton>

          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {tokens.map((token) => (
              <MenuItem
                key={token.symbol}
                onClick={() => onClickHandlerClose(null, token.symbol)}
              >
                {token.symbol}
              </MenuItem>
            ))}
          </Menu>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Decentralized Exchange {selectedToken && `- ${selectedToken}`}
          </Typography>
          {account && (
            <Chip
              color="primary"
              style={{
                color: '#556cd6',
                borderColor: '#556cd6',
                background: 'white',
                marginRight: '1rem',
              }}
              variant="outlined"
              label="FAUCET"
              onClick={getFaucet}
            />
          )}

          {account ? (
            <Chip
              color="primary"
              style={{ color: 'white', borderColor: 'white' }}
              variant="outlined"
              label={account}
              onClick={disconnectWallet}
            />
          ) : (
            <Chip
              color="primary"
              variant="outlined"
              style={{ color: 'white', borderColor: 'white' }}
              onClick={onConnectWalletHandler}
              label="CONNECT WALLET"
            />
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
