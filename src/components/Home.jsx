import { useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { getExplorerLink } from "@solana-developers/helpers";
import {
	burnChecked,
	getMint,
	getOrCreateAssociatedTokenAccount,
	getTokenMetadata,
	TOKEN_2022_PROGRAM_ID,
	transferChecked,
} from "@solana/spl-token";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Home() {
	const { publicKey, connected } = useUnifiedWallet();
	const [mint, setMint] = useState();
	const [tokenAmount, setTokenAmount] = useState();
	const [symbol, setSymbol] = useState();
	const [tokenImage, setTokenImage] = useState();
	const [recipientAddress, setRecipientAddress] = useState();
	const [amountToSend, setAmountToSend] = useState();

	const mintAddress = "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM";
	const mintPubKey = new PublicKey(mintAddress);

	const connection = new Connection(
		`https://devnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API}`,
		"confirmed"
	);
	const walletKeypair = new Keypair(
		new Uint8Array(JSON.parse(import.meta.env.VITE_PYUSD_WALLET))
	);

	async function transferTokens(
		e,
		senderAddress,
		recipientAddress,
		amountToSend
	) {
		e.preventDefault();

		const senderATA = await getOrCreateAssociatedTokenAccount(
			connection,
			walletKeypair,
			mintPubKey,
			senderAddress,
			false,
			"confirmed",
			null,
			TOKEN_2022_PROGRAM_ID
		);

		const recipientATA = await getOrCreateAssociatedTokenAccount(
			connection,
			walletKeypair,
			mintPubKey,
			recipientAddress,
			false,
			"confirmed",
			null,
			TOKEN_2022_PROGRAM_ID
		);

		const sig = await transferChecked(
			connection,
			walletKeypair,
			senderATA.publicKey,
			mintPubKey,
			recipientATA.publicKey,
			senderAddress,
			amountToSend * 10 ** mint.decimals,
			mint.decimals,
			[],
			null,
			TOKEN_2022_PROGRAM_ID
		);

		console.log(
			`Tokens transferred: ${getExplorerLink("transaction", sig, "devnet")}`
		);
	}

	async function burnTokens(e, burnerAddress, amountToBurn) {
		e.preventDefault();

		const burnerATA = await getOrCreateAssociatedTokenAccount(
			connection,
			walletKeypair,
			mintPubKey,
			burnerAddress,
			false,
			"confirmed",
			null,
			TOKEN_2022_PROGRAM_ID
		);

		const sig = await burnChecked(
			connection,
			walletKeypair,
			burnerATA.publicKey,
			mintPubKey,
			burnerAddress,
			amountToBurn * 10 ** mint.decimals,
			mint.decimals,
			[],
			null,
			TOKEN_2022_PROGRAM_ID
		);

		console.log(
			`Tokens burned: ${getExplorerLink("transaction", sig, "devnet")}`
		);
	}

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

			setTokenAmount(Number(amount) / 10 ** mint.decimals);
		}

		if (mint && publicKey) {
			fetchData();
		} else {
			setTokenAmount(null);
		}
	}, [publicKey]);

	return (
		<main>
			{connected ? (
				<>
					<section>
						<div className="flex gap-2 items-center">
							<h2 className="text-2xl">
								{symbol} in Wallet: {tokenAmount}
							</h2>
							<img src={tokenImage} alt="Paypal USD" className="size-6" />
						</div>
					</section>
					<form
						className="flex flex-col"
						onSubmit={(e) =>
							transferTokens(e, publicKey, recipientAddress, amountToSend)
						}
					>
						<h2 className="text-xl">Transfer to Another Wallet</h2>
						<label htmlFor="recipientAddress">Recipient Address</label>
						<input
							type="text"
							id="recipientAddress"
							value={recipientAddress}
							onChange={(e) => setRecipientAddress(e.target.value)}
							className="border-2 border-black w-[300px]"
						/>
						<label htmlFor="amountSend">Amount to Send</label>
						<input
							type="number"
							id="amountSend"
							min={0.000001}
							max={tokenAmount}
							value={amountToSend}
							onChange={(e) => setAmountToSend(e.target.value)}
							className="border-2 border-black w-[300px]"
						/>
						<button type="submit" className="w-fit border-2">
							Send
						</button>
					</form>
					<form
						className="flex flex-col"
						onSubmit={(e) => burnTokens(e, publicKey, amountToBurn)}
					>
						<h2 className="text-xl">Burn Tokens</h2>
						<label htmlFor="amountBurn">Amount to Burn</label>
						<input
							type="number"
							id="amountBurn"
							min={0.000001}
							max={tokenAmount}
							value={amountToSend}
							onChange={(e) => setAmountToSend(e.target.value)}
							className="border-2 border-black w-[300px]"
						/>
						<button type="submit" className="w-fit border-2">
							Burn
						</button>
					</form>
				</>
			) : (
				<p className="text-2xl">Wallet Not Connected</p>
			)}
		</main>
	);
}
