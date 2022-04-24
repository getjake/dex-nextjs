import Cookies from 'js-cookie';
import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
  account: '',
  provider: null,
  signer: null,
  network: null,
  contracts: {},
  tokens: [],
  tradingTokens: [],
  selectedToken: Cookies.get('selectedToken')
    ? Cookies.get('selectedToken')
    : 'DAI',
  balances: {},
  transferEvent: {token:'', direction: '', timestamp: 0},
  allOrders: { buyOrders: [], sellOrders: [] },
  refreshDataTimestamp: 0,
  tradeHistory: [],
  snackText: {text: '', timestamp: 0}
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_ACCOUNT':
      const account = action.payload;
      return { ...state, account };
    case 'UPDATE_PROVIDER':
      const provider = action.payload;
      return { ...state, provider };
    case 'UPDATE_SIGNER':
      const signer = action.payload;
      return { ...state, signer };
    case 'UPDATE_NETWORK':
      const network = action.payload;
      return { ...state, network };
    case 'UPDATE_CONTRACT':
      const contract = action.payload;
      const name = contract.name;
      const instance = contract.instance;
      const _contracts = state.contracts;
      _contracts[name] = instance;
      return { ...state, contracts: { ..._contracts } };
    case 'UPDATE_TOKENS':
      const tokens = action.payload;
      return { ...state, tokens };
    case 'UPDATE_TRADING_TOKENS':
      const tradingTokens = action.payload;
      return { ...state, tradingTokens };
    case 'UPDATE_SELECTED_TOKEN':
      const selectedToken = action.payload;
      Cookies.set('selectedToken', selectedToken);
      return { ...state, selectedToken };
    case 'UPDATE_USER_BALANCES':
      const userBalances = action.payload;
      const existingBalances = state.balances;
      const user = userBalances.account;
      const existingUserTokens = existingBalances[user];
      const token = userBalances.token;
      const balances = userBalances.balance;
      const balanceObj = {
        [user]: {
          ...existingUserTokens,
          [token]: balances,
        },
      };

      return { ...state, balances: { ...existingBalances, ...balanceObj } };
    case 'UPDATE_SNACK_INFO':
      const snackText = {text: action.payload.text, alert: action.payload.alert ? action.payload.alert : 'info', timestamp: +new Date()};
      return {...state, snackText}
    case 'UPDATE_TRANSFER_EVENT':
      const transferEvent = action.payload;
      return { ...state, transferEvent };
    case 'UPDATE_ALL_ORDERS':
      const allOrders = action.payload;
      return { ...state, allOrders };
    case 'UPDATE_TRADE_HISTORY':
      const tradeHistory = action.payload;
      return {...state, tradeHistory}
    case 'REFRESH_DATA':
      const refreshDataTimestamp = +new Date();
      return { ...state, refreshDataTimestamp };
    case 'RESET_ACCOUNT':
      return { ...state, account: '' };
    case 'RESET_PROVIDER':
      return { ...state, provider: null };
    case 'RESET_SIGNER':
      return { ...state, signer: null };
    case 'RESET_NETWORK':
      return { ...state, network: null };
    case 'RESET_ALL':
      return initialState;
    default:
      return state;
  }
};

export const StoreProvider = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children}</Store.Provider>;
};
