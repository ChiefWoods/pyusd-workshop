import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import {
	getMint,
	getOrCreateAssociatedTokenAccount,
	getTokenMetadata,
	TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Home() {
	const { publicKey, connected } = useUnifiedWallet();
	const [mint, setMint] = useState();
	const [amount, setAmount] = useState();
	const [symbol, setSymbol] = useState();
	const [tokenImage, setTokenImage] = useState();

	const mintAddress = "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM";
	const mintPubKey = new PublicKey(mintAddress);

	const connection = new Connection(
		`https://devnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API}`,
		"confirmed"
	);
	const walletKeypair = new Keypair(
		new Uint8Array(JSON.parse(import.meta.env.VITE_PYUSD_WALLET))
	);

	useEffect(() => {
		async function fetchData() {
			const mint = await getMint(
				connection,
				mintPubKey,
				"confirmed",
				TOKEN_2022_PROGRAM_ID
			);
			setMint(mint);

			const { symbol, uri } = await getTokenMetadata(
				connection,
				mintPubKey,
				"confirmed",
				TOKEN_2022_PROGRAM_ID
			);
			setSymbol(symbol);

			const { image } = await fetch(uri).then((res) => res.json());
			setTokenImage(image);
		}

		fetchData();
	}, []);

	useEffect(() => {
		async function fetchData() {
			const { amount } = await getOrCreateAssociatedTokenAccount(
				connection,
				walletKeypair,
				mintPubKey,
				publicKey,
				false,
				"confirmed",
				null,
				TOKEN_2022_PROGRAM_ID
			);

			setAmount(Number(amount) / 10 ** mint.decimals);
		}

		if (mint && publicKey) {
      fetchData();
    } else {
      setAmount(null);
    }
	}, [publicKey]);

	return (
		<main>
			{connected ? (
				<section>
					<div className="flex gap-2 items-center">
						<p className="text-2xl">
							{symbol} in Wallet: {amount}
						</p>
						<img src={tokenImage} alt="Paypal USD" className="size-6" />
					</div>
				</section>
			) : (
				<p className="text-2xl">Wallet Not Connected</p>
			)}
		</main>
	);
}
