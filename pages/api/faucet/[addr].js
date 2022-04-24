import nc from 'next-connect';
import { ethers } from 'ethers';
import {
  bscRpcUrl,
  daiAddress,
  batAddress,
  repAddress,
  zrxAddress,
} from 'utils/const';
import erc20Abi from 'utils/contracts/erc20Abi.json';

const handler = nc();

const provider = new ethers.providers.JsonRpcProvider(bscRpcUrl);
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const daiContract = new ethers.Contract(daiAddress, erc20Abi, signer);
const batContract = new ethers.Contract(batAddress, erc20Abi, signer);
const repContract = new ethers.Contract(repAddress, erc20Abi, signer);
const zrxContract = new ethers.Contract(zrxAddress, erc20Abi, signer);

handler.get(async (req, res) => {
  try {
    const _addr = req.query.addr;
    const _amount = '1000000000000000000000'; // 1000 eth eqv.
    await daiContract.faucet(_addr, _amount);
    await batContract.faucet(_addr, _amount);
    await repContract.faucet(_addr, _amount);
    await zrxContract.faucet(_addr, _amount);
    res.status(200).send({ result: 'successfully seeded the account wallet' });
  } catch (error) {

    res.status(500).send({ result: error.toString() });
    
  }
});
export default handler;