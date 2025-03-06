import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import BurnForm from "./components/BurnForm";
import { useEffect, useState } from "react";
import { PYUSD_MINT } from "./constants";
import TransferForm from "./components/TransferForm";
import { PublicKey } from "@solana/web3.js";

export default function App() {
  const { publicKey } = useUnifiedWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ata, setAta] = useState<PublicKey | null>(null);
  const [pyusdBal, setPyusdBal] = useState<number | null>(0);

  useEffect(() => {
    (async () => {
      if (publicKey) {
        setIsLoading(true);

        const tokenAddress = getAssociatedTokenAddressSync(
          PYUSD_MINT.address,
          publicKey,
          false,
          PYUSD_MINT.owner,
        );

        setAta(tokenAddress);

        const tokenBalance =
          await connection.getTokenAccountBalance(tokenAddress);
        setPyusdBal(tokenBalance.value.uiAmount);
      } else {
        setAta(null);
        setPyusdBal(0);
      }

      setIsLoading(false);
    })();
  }, [publicKey, connection]);

  return (
    <section className="flex flex-col gap-6">
      {!publicKey ? (
        <p>Connect your wallet</p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        pyusdBal !== null &&
        ata && (
          <>
            <TransferForm
              label="Transfer Tokens"
              submitText="Transfer"
              maxAmount={pyusdBal}
              ata={ata}
            />
            <BurnForm
              label="Burn Tokens"
              submitText="Burn"
              maxAmount={pyusdBal}
              ata={ata}
            />
          </>
        )
      )}
    </section>
  );
}
