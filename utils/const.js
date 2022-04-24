import { ethers } from 'ethers';
import erc20Abi from 'utils/contracts/erc20Abi.json';
import dexAbi from 'utils/contracts/dexAbi.json';

const dexAddress = '0x7a43f8C2B547Db67800D979577F844F2064d9Ef5';
const daiAddress = '0x72fa8918e7dc1714Bd47425342603DA6De45c234';
const batAddress = '0x461c6284412B8d93c265C3204b527fc058450E90';
const repAddress = '0x8d2AE25Cafa99d7C18fF1A2247D3685B1600373E';
const zrxAddress = '0x4b450e3bD259b58f1F01c1f59b0966925961A11f'
// THE READONLY PROVIDER on BSC TESTNET

const bscRpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const defaultProvider = new ethers.providers.JsonRpcProvider(bscRpcUrl);
const defaultNetworkId = 97

const contractsRead = {
    DAI: new ethers.Contract(daiAddress, erc20Abi, defaultProvider),
    BAT: new ethers.Contract(batAddress, erc20Abi, defaultProvider),
    REP: new ethers.Contract(repAddress, erc20Abi, defaultProvider),
    ZRX: new ethers.Contract(zrxAddress, erc20Abi, defaultProvider),
    dex: new ethers.Contract(dexAddress, dexAbi, defaultProvider),
}

// Show History Item Number limits
const itemsNumberToShow = 5
export {
    dexAddress,
    daiAddress,
    batAddress,
    repAddress,
    zrxAddress,
    defaultProvider,
    defaultNetworkId,
    contractsRead,
    bscRpcUrl,
    itemsNumberToShow
}