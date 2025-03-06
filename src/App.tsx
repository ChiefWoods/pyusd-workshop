import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import BurnForm from "./components/BurnForm";
import TransferForm from "./components/TransferForm";
import { usePyusd } from "./components/usePyusd";

export default function App() {
  const { connected, connecting } = useUnifiedWallet();
  const { isLoading, ata, pyusdBal } = usePyusd();

  return (
    <section className="flex flex-col gap-6">
      {!connected ? (
        connecting ? (
          <p>Connecting...</p>
        ) : (
          <p>Connect your wallet</p>
        )
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
