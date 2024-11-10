import { Aptos, Account, AptosConfig, Network, InputViewFunctionData, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";

export const moduleAddress = "0a9b9a08f54d21e5662694c9fa036b4f6907255f3b8ac552c84b2d374f5945b1";
export const token = '0xcc12552de21078ebce251c0a09193eb7ea799316c77142165990cd96ea815b34';

const config = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(config);


const privateKey = new Ed25519PrivateKey(
    "0x55d8417da962242250e890c71ab846749022efa349b93e8486991173928da295"
  );
export const admin = Account.fromPrivateKey({ privateKey });

export const getFaBalance = async (
  ownerAddress: string,
  assetType: string
): Promise<number> => {
  try {
    const data = await aptos.getCurrentFungibleAssetBalances({
      options: {
        where: {
          owner_address: { _eq: ownerAddress },
          asset_type: { _eq: assetType },
        },
      },
    });
    if (data.length === 0) return 0;
    return Number(data[0]?.amount) || 0;
  } catch (error) {
    console.error('Error fetching balance:', error);
    return 0;
  }
};

export const mintCoin = async (admin: Account, receiver: string, amount: number): Promise<string> => {
  const transaction = await aptos.transaction.build.simple({
    sender: admin.accountAddress,
    data: {
      function: `${moduleAddress}::devx_token::mint`,
      functionArguments: [receiver, amount],
    },
  });

  const senderAuthenticator = aptos.transaction.sign({ signer: admin, transaction });
  const pendingTxn = await aptos.transaction.submit.simple({ transaction, senderAuthenticator });

  return pendingTxn.hash;
}; 