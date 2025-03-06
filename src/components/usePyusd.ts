import { PYUSD_MINT } from "@/constants";
import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import {
  AccountLayout,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export function usePyusd() {
  const { connection } = useConnection();
  const { publicKey } = useUnifiedWallet();
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

  useEffect(() => {
    if (ata) {
      const subscriptionId = connection.onAccountChange(ata, (info) => {
        const acc = AccountLayout.decode(info.data);
        setPyusdBal(Number(acc.amount) / 10 ** PYUSD_MINT.decimals);
      });

      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [ata, connection]);

  return { isLoading, ata, pyusdBal };
}
