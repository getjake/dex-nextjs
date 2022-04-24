import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';
import {
  Box,
  Grid,
  Typography,
  Alert,
  Stack,
  Backdrop,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material/';
import { ShowChart } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import Header from 'components/Header';
import Wallet from 'components/Wallet';
import NewOrder from 'components/NewOrder';
import AllOrders from 'components/AllOrders';
import MyOrders from 'components/MyOrders';
import AllTrades from 'components/AllTrades';
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
import { Item } from 'src/theme';
import { Store } from 'utils/Store';

// contracts
import erc20Abi from 'utils/contracts/erc20Abi.json';
import dexAbi from 'utils/contracts/dexAbi.json';

const Home = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { state, dispatch } = useContext(Store);
  const [loaded, setLoaded] = useState(false);
  const [correctNetwork, setCorrectNetwork] = useState(true);
  const {
    account,
    selectedToken,
    provider,
    signer,
    network,
    contracts,
    tokens,
    tradingTokens,
    transferEvent,
    snackText,
    refreshDataTimestamp,
  } = state; // Read from state
  const [walletConnected, setWalletConnected] = useState(false);

  const web3Modal = new Web3Modal({
    network: 'mainnet',
    cacheProvider: true,
  });

  const resetState = () => {
    dispatch({ type: 'RESET_ACCOUNT' });
    dispatch({ type: 'RESET_PROVIDER' });
    dispatch({ type: 'RESET_SIGNER' });
    dispatch({ type: 'RESET_NETWORK' });
    console.log('RESET STATE..');
  };

  const disconnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    resetState();
    setWalletConnected(false);
    updateNetwork('disconnect');
  };

  const updateProvider = async () => {
    const connection = await web3Modal.connect();
    const _provider = new ethers.providers.Web3Provider(connection);
    dispatch({ type: 'UPDATE_PROVIDER', payload: _provider });
    return _provider;
  };

  const updateSigner = async () => {
    const connection = await web3Modal.connect();
    const _provider = new ethers.providers.Web3Provider(connection);
    const _signer = _provider.getSigner();
    dispatch({ type: 'UPDATE_SIGNER', payload: _signer });
    return _signer;
  };

  const updateAccount = async () => {
    const connection = await web3Modal.connect();
    const _provider = new ethers.providers.Web3Provider(connection);
    const accounts = await _provider.listAccounts();
    if (accounts) dispatch({ type: 'UPDATE_ACCOUNT', payload: accounts[0] });
    return accounts[0];
  };

  const updateNetwork = async (action) => {
    if (action === 'connect') {
      const connection = await web3Modal.connect();
      const _provider = new ethers.providers.Web3Provider(connection);
      const _network = await _provider.getNetwork();
      dispatch({ type: 'UPDATE_NETWORK', payload: _network });
      setWalletConnected(true);
      if (_network.chainId !== defaultNetworkId) {
        setCorrectNetwork(false);
        // switch network
        window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x61',
              rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
              chainName: 'BSC Testnet',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              blockExplorerUrls: ['https://testnet.bscscan.com/'],
            },
          ],
        });
      } else {
        setCorrectNetwork(true);
      }
      return _network;
    }

    if (action === 'disconnect') {
      setCorrectNetwork(true);
      return;
    }
  };

  const updateAllContracts = async () => {
    const connection = await web3Modal.connect();
    const _provider = new ethers.providers.Web3Provider(connection);
    const _signer = _provider.getSigner();
    // set Contracts
    const dexContractWrite = new ethers.Contract(dexAddress, dexAbi, _signer);
    const daiContractWrite = new ethers.Contract(daiAddress, erc20Abi, _signer);
    const batContractWrite = new ethers.Contract(batAddress, erc20Abi, _signer);
    const repContractWrite = new ethers.Contract(repAddress, erc20Abi, _signer);
    const zrxContractWrite = new ethers.Contract(zrxAddress, erc20Abi, _signer);
    dispatch({
      type: 'UPDATE_CONTRACT',
      payload: { name: 'dexContractWrite', instance: dexContractWrite },
    });
    dispatch({
      type: 'UPDATE_CONTRACT',
      payload: { name: 'daiContractWrite', instance: daiContractWrite },
    });
    dispatch({
      type: 'UPDATE_CONTRACT',
      payload: { name: 'batContractWrite', instance: batContractWrite },
    });
    dispatch({
      type: 'UPDATE_CONTRACT',
      payload: { name: 'repContractWrite', instance: repContractWrite },
    });
    dispatch({
      type: 'UPDATE_CONTRACT',
      payload: { name: 'zrxContractWrite', instance: zrxContractWrite },
    });
  };

  const connectWallet = async () => {
    try {
      await updateProvider();
      await updateSigner();
      await updateAccount();
      await updateNetwork('connect');
    } catch (error) {
      console.log('connect wallet error: ', error);
      setWalletConnected(false);
    }
  };

  const fetchTokens = async () => {
    const rawTokens = await contractsRead.dex.getTokens();
    const tokens = rawTokens.map((token) => ({
      ...token,
      ticker: ethers.utils.toUtf8Bytes(token.ticker),
    }));
    const tokensAddresses = tokens.map((token) => token[1]);
    const tokenSymbols = [];
    for (const tokenAddress of tokensAddresses) {
      const _contract = new ethers.Contract(
        tokenAddress,
        erc20Abi,
        defaultProvider
      );
      const symbol = await _contract.symbol();
      tokenSymbols.push(symbol);
    }

    const tokensArr = [];
    tokenSymbols.forEach((symbol, i) => {
      tokensArr.push({ symbol: symbol, address: tokensAddresses[i] });
    });
    const tradingTokens = tokensArr.filter((token) => token.symbol !== 'DAI');
    dispatch({ type: 'UPDATE_TOKENS', payload: tokensArr });
    dispatch({ type: 'UPDATE_TRADING_TOKENS', payload: tradingTokens });
    setLoaded(true);
  };

  const onConnectWalletHandler = () => {
    connectWallet();
  };

  useEffect(() => {
    if (transferEvent.timestamp > 0) {
      enqueueSnackbar(
        `${transferEvent.token} ${transferEvent.direction} successfully!`,
        { variant: 'success' }
      );
    } else {
      console.log('transfer event not show..');
      console.log(transferEvent);
    }
  }, [transferEvent]);

  useEffect(() => {
    if (snackText.timestamp > 0) {
      enqueueSnackbar(snackText.text, { variant: snackText.alert });
    } else {
      console.log('snackText not showing');
    }
  }, [snackText]);

  useEffect(() => {
    // unlock wallet
    const init = async () => {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      // connectWallet
      connectWallet();

      // Listen to network changes
      if (window.ethereum) {
        window.ethereum.on('chainChanged', () => {
          updateNetwork('connect');
        });
        window.ethereum.on('accountsChanged', (account) => {
          connectWallet();
        });
      }
    };
    init();
  }, []);

  // Fetch tokens at the beginning
  useEffect(() => {
    fetchTokens();
  }, []);

  // Update all contracts
  useEffect(() => {
    if (walletConnected) {
      updateAllContracts();
    }
  }, [walletConnected]);

  useEffect(() => {
    const myFilter = contractsRead.dex.filters.NewTrade(
      null,
      null,
      ethers.utils.formatBytes32String(selectedToken),
      null,
      null,
      null,
      null,
      null
    );

    if (selectedToken !== 'DAI') {
      // get history trades
      const getTradeHistory = async () => {
        const startBlock = 18700000;
        const step = 4990;
        const latestBlock = await defaultProvider.getBlockNumber();
        const _tradeHistory = [];
        let _startBlock = startBlock;
        let _endBlock;
        while (true) {
          _endBlock = _startBlock + step;
          const tmpTradeHistory = await contractsRead.dex.queryFilter(
            myFilter,
            _startBlock,
            _endBlock
          );
          _tradeHistory.push(...tmpTradeHistory);
          if (_endBlock > latestBlock) {
            break;
          } else {
            _startBlock = _endBlock + 1;
          }
        }
        dispatch({ type: 'UPDATE_TRADE_HISTORY', payload: _tradeHistory });
      };
      getTradeHistory();
    }
  }, [selectedToken, refreshDataTimestamp]);

  // Add Contract Listeners
  useEffect(() => {
    contractsRead.dex.on(
      'NewTrade',
      (tradeId, orderId, ticker, trader1, trader2, amount, price, date) => {
        dispatch({
          type: 'REFRESH_DATA',
        });

        if (trader2 === account) {
          dispatch({
            type: 'UPDATE_SNACK_INFO',
            payload: { text: 'Market Order Filled', alert: 'success' },
          });
        }
      }
    );
    contractsRead.DAI.on('Transfer', (from, to, value) => {
      if (from === account && to === dexAddress) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'DAI',
            direction: 'Deposit',
            timestamp: +new Date(),
          },
        });
      }

      if (from === dexAddress && to === account) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'DAI',
            direction: 'Withdraw',
            timestamp: +new Date(),
          },
        });
      }
    });
    contractsRead.BAT.on('Transfer', (from, to, value) => {
      if (from === account && to === dexAddress) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'BAT',
            direction: 'Deposit',
            timestamp: +new Date(),
          },
        });
      }
      if (from === dexAddress && to === account) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'BAT',
            direction: 'Withdraw',
            timestamp: +new Date(),
          },
        });
      }
    });
    contractsRead.REP.on('Transfer', (from, to, value) => {
      if (from === account && to === dexAddress) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'REP',
            direction: 'Deposit',
            timestamp: +new Date(),
          },
        });
      }
      if (from === dexAddress && to === account) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'REP',
            direction: 'Withdraw',
            timestamp: +new Date(),
          },
        });
      }
    });
    contractsRead.ZRX.on('Transfer', (from, to, value) => {
      if (from === account && to === dexAddress) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'ZRX',
            direction: 'Deposit',
            timestamp: +new Date(),
          },
        });
      }
      if (from === dexAddress && to === account) {
        dispatch({
          type: 'UPDATE_TRANSFER_EVENT',
          payload: {
            token: 'ZRX',
            direction: 'Withdraw',
            timestamp: +new Date(),
          },
        });
      }
    });
  }, [account]);

  return (
    <>
      <Header
        account={account}
        onConnectWalletHandler={onConnectWalletHandler}
        disconnectWallet={disconnectWallet}
        tradingTokens={tradingTokens}
      />

      {/* WRONG NETWORK ID ALERT */}
      {!correctNetwork && (
        <Stack sx={{ width: '100%' }} spacing={2}>
          <Alert severity="error">
            You are connected to a wrong network, Please switch to BSC Testnet!
          </Alert>
        </Stack>
      )}

      {/* LOADING SCREEN */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={!loaded}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <Grid container spacing={2}>
        <Grid item style={{ minWidth: 240 }}>
          <Wallet />
          <NewOrder />
        </Grid>
        <Grid item xs={7} style={{ minWidth: 800 }}>
          <AllTrades />
          <AllOrders />
          <MyOrders />
        </Grid>
      </Grid>
    </>
  );
};

export default dynamic(() => Promise.resolve(Home), { ssr: false });
