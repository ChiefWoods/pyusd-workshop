import { useConnection, useUnifiedWallet } from "@jup-ag/wallet-adapter";
import { getExplorerLink } from "@solana-developers/helpers";
import {
	createAssociatedTokenAccountInstruction,
	createBurnCheckedInstruction,
	createTransferCheckedInstruction,
	getAssociatedTokenAddress,
	getMint,
	getOrCreateAssociatedTokenAccount,
	getTokenMetadata,
	TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import NotConnected from "./NotConnected";

export default function Home() {
	const { publicKey, connected, sendTransaction } = useUnifiedWallet();
	const { connection } = useConnection();
	const [mint, setMint] = useState(null);
	const [tokenAmount, setTokenAmount] = useState("");
	const [symbol, setSymbol] = useState("");
	const [tokenImage, setTokenImage] = useState("");
	const [recipientAddress, setRecipientAddress] = useState("");
	const [amountToSend, setAmountToSend] = useState("");
	const [amountToBurn, setAmountToBurn] = useState("");

	const mintAddress = "CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM"; // PYUSD devnet address
	const mintPubKey = new PublicKey(mintAddress);

	const walletKeypair = new Keypair(
		new Uint8Array(JSON.parse(import.meta.env.VITE_PYUSD_WALLET))
	); // Used for creating associated token accounts

	async function transferTokens(e, recipientAddress, amountToSend) {
		e.preventDefault();

		try {
			if (!publicKey) throw new Error("Please connect your wallet.");
			if (!recipientAddress) throw new Error("Recipient address is required.");
			if (!amountToSend) throw new Error("Amount to send is required.");

			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

			let tx = new Transaction({
				feePayer: publicKey,
				blockhash,
				lastValidBlockHeight,
			});

			const senderATA = await getAssociatedTokenAddress(
				mintPubKey,
				publicKey,
				false,
				TOKEN_2022_PROGRAM_ID
			);

			const recipientATA = await getAssociatedTokenAddress(
				mintPubKey,
				recipientAddress,
				false,
				TOKEN_2022_PROGRAM_ID
			);

			const recipientAccountInfo = await connection.getAccountInfo(
				recipientATA
			);
			if (!recipientAccountInfo) {
				tx.add(
					createAssociatedTokenAccountInstruction(
						publicKey,
						recipientATA,
						recipientAddress,
						mintPubKey,
						TOKEN_2022_PROGRAM_ID
					)
				);
			}

			tx.add(
				createTransferCheckedInstruction(
					senderATA,
					mintPubKey,
					recipientATA,
					publicKey,
					amountToSend * 10 ** mint.decimals,
					mint.decimals,
					[],
					TOKEN_2022_PROGRAM_ID
				)
			);

			const sig = await sendTransaction(tx, connection);

			setTokenAmount((prev) => prev - amountToSend);

			const link = getExplorerLink("tx", sig, "devnet");

			toast.success(
				<div className="flex flex-col bg-green-100 w-full p-4">
					<span className="font-semibold">Tokens Transferred</span>
					<span>
						<a
							target="_blank"
							rel="noopener noreferrer"
							className="underline font-bold"
							href={link}
						>
							{link}
						</a>
					</span>
				</div>,
				{
					style: {
						padding: 0,
						margin: 0,
					},
				}
			);
		} catch (err) {
			toast.error(
				<div className="flex flex-col bg-red-100 w-full p-4">
					<span className="font-semibold">Transaction Failed</span>
					<span>{err.message}</span>
				</div>,
				{
					style: {
						padding: 0,
						margin: 0,
					},
				}
			);
		}
	}

	async function burnTokens(e, amountToBurn) {
		e.preventDefault();

		try {
			if (!publicKey) throw new Error("Please connect your wallet.");
			if (!amountToBurn) throw new Error("Amount to burn is required.");

			const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

			const tx = new Transaction({
				feePayer: publicKey,
				blockhash,
				lastValidBlockHeight,
			});

			const burnerATA = await getAssociatedTokenAddress(
				mintPubKey,
				publicKey,
				false,
				TOKEN_2022_PROGRAM_ID
			);

			tx.add(
				createBurnCheckedInstruction(
					burnerATA,
					mintPubKey,
					publicKey,
					BigInt(Math.round(amountToBurn * 10 ** mint.decimals)),
					mint.decimals,
					[],
					TOKEN_2022_PROGRAM_ID
				)
			);

			const sig = await sendTransaction(tx, connection);

			setTokenAmount((prev) => prev - amountToBurn);

			const link = getExplorerLink("tx", sig, "devnet");

			toast.success(
				<div className="flex flex-col bg-green-100 w-full p-4">
					<span className="font-semibold">Tokens Burned</span>
					<span>
						<a
							target="_blank"
							rel="noopener noreferrer"
							className="underline font-bold"
							href={link}
						>
							{link}
						</a>
					</span>
				</div>,
				{
					style: {
						padding: 0,
						margin: 0,
					},
				}
			);
		} catch (err) {
			toast.error(
				<div className="flex flex-col bg-red-100 w-full p-4">
					<span className="font-semibold">Transaction Failed</span>
					<span>{err.message}</span>
				</div>,
				{
					style: {
						padding: 0,
						margin: 0,
					},
				}
			);
		}
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
	}, [publicKey, mint]);

	return (
		<main className="flex flex-col gap-y-4">
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
						className="flex flex-col gap-y-4"
						onSubmit={(e) =>
							transferTokens(
								e,
								new PublicKey(recipientAddress),
								Number(amountToSend)
							)
						}
					>
						<h2 className="text-xl">Transfer to Another Wallet</h2>
						<div className="flex flex-col gap-y-2">
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
								step={0.000001}
								max={tokenAmount}
								value={amountToSend}
								onChange={(e) => setAmountToSend(e.target.value)}
								className="border-2 border-black w-[300px]"
							/>
						</div>
						<button type="submit" className="w-fit border-2">
							Send
						</button>
					</form>
					<form
						className="flex flex-col gap-y-4"
						onSubmit={(e) => burnTokens(e, amountToBurn)}
					>
						<h2 className="text-xl">Burn Tokens</h2>
						<div className="flex flex-col gap-y-2">
							<label htmlFor="amountBurn">Amount to Burn</label>
							<input
								type="number"
								id="amountBurn"
								min={0.000001}
								step={0.000001}
								max={tokenAmount}
								value={amountToBurn}
								onChange={(e) => setAmountToBurn(e.target.value)}
								className="border-2 border-black w-[300px]"
							/>
						</div>
						<button type="submit" className="w-fit border-2">
							Burn
						</button>
					</form>
				</>
			) : (
				<NotConnected	/>
			)}
		</main>
	);
}
