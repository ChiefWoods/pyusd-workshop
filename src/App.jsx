import {
	UnifiedWalletProvider,
} from "@jup-ag/wallet-adapter";
import {
	PhantomWalletAdapter,
	SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { toast, Toaster } from "sonner";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./components/Home";

export default function App() {
	return (
		<>
			<Toaster richColors closeButton />
			<UnifiedWalletProvider
				wallets={[new PhantomWalletAdapter(), new SolflareWalletAdapter()]}
				config={{
					autoConnect: true,
					env: "devnet",
					metadata: {
						name: "UnifiedWallet",
						description: "UnifiedWallet",
						url: "https://jup.ag",
						iconUrls: ["https://jup.ag/favicon.ico"],
					},
					notificationCallback: {
						onConnect: (props) => {
							toast.success(
								<div className="flex flex-col bg-green-100 w-full p-4">
									<span className="font-semibold">Wallet Connected</span>
									<span className="text-xs text-black/50">{`Connected to wallet ${props.shortAddress}`}</span>
								</div>,
								{
									style: {
										padding: 0,
										margin: 0,
									},
								}
							);
						},
						onConnecting: (props) => {
							toast.message(
								<div className="flex flex-col p-4">
									<span className="font-semibold">
										Connecting to {props.walletName}
									</span>
								</div>,
								{
									style: {
										padding: 0,
										margin: 0,
									},
								}
							);
						},
						onDisconnect: (props) => {
							toast.message(
								<div className="flex flex-col p-4">
									<span className="font-semibold">
										Disconnected from {props.walletName}
									</span>
									<span className="text-xs text-black/50">{`Disconnected from wallet ${props.shortAddress}`}</span>
								</div>,
								{
									style: {
										padding: 0,
										margin: 0,
									},
								}
							);
						},
						onNotInstalled: (props) => {
							toast.error(
								<div className="flex flex-col bg-red-100 w-full p-4">
									<span className="font-semibold">
										{props.walletName} Wallet is not installed
									</span>
									<span>
										{`Please go to the provider`}{" "}
										<a
											target="_blank"
											rel="noopener noreferrer"
											className="underline font-bold"
											href={props.metadata.url}
										>
											{`website`}
										</a>{" "}
										{`to download.`}
									</span>
								</div>,
								{
									style: {
										padding: 0,
										margin: 0,
									},
								}
							);
						},
					},
					walletlistExplanation: {
						href: "https://station.jup.ag/docs/additional-topics/wallet-list",
					},
					theme: "jupiter",
					lang: "en",
					hardcodedWallets: [
						{
							id: "Backpack",
							name: "Backpack",
							url: "https://www.backpack.app/",
							icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAbvSURBVHgB7Z1dUtxGEMf/LZH3fU0V4PUJQg4QVj5BnBOAT2BzAsMJAicwPoHJCRDrAxifgLVxVV73ObDqdEtsjKn4C8+0NDv9e7AxprRC85uvnp4RYYW5qKpxCVTcYKsgfiDfGjMwIsZIvh7d/lkmzAiYy5fzhultyZhdlagf1vU5VhjCiiGFXq01zYSJdqWgx/hB5AHN5I/6iuilyFBjxVgZAdqCZ34ORoVIqAzSOhxsvq6PsSIkL4A281LwL2IW/F1UhLKgRz/X9QyJUyBhuuae31gWviLjiPF1wxeX29vPkTjJtgAftrd3GHSMnmHw4eZ0uodESVKAoRT+kpQlSE6Ats/XZv/ONK5vZHC49+B1fYjESG4MUDKfYmCFr0ic4fmHqtpCYiQlgA66QsztIzFi5j+RGMl0AXebfgn0aOTuvGG8owIarZsXOj3ronlRuEYnn84CJLo4Lgi/QL/H/LHmy/RwI6GA0RoS4acFHi8kGieFXS/QhmijFfQXmH3uPy5lSkoLbIkYlfyzhuM4juM4juM4juMMj6TzATQ4JH9tlRqFk8BM2aV9RWHB9K5kzK/KLui0KqliSQmgBa4BIS54cpMD0OeawFye3jk19JdKkWq62OAFkEIfrTXNUxBV1okf38Ot3MGjlFqHwQrQZvQ22Cfw7xjg6t8XkZaBGzpKIXdwcAJojZeCP5SC30HipJBEOigBZLn3qdzSPlKr8V9hyEmkgxCgj8zefuD9jen0AAOidwE0i6ZhfjXgRI+gDK016DUjqE3ubPhNLoWvaDLJouHToaSP9SbA0DJ7LekyiviNPgP0TC9dQM6FfxeZ7eyuT6cv0RPmAmjTx11uXx/MiegEDd425cfcwWV+H4O3+uiO+pTAVIA2uMN8av6QiWr5TQ++JVlTc/tEiF3jOMScZGC43kME0VSA95PJhWXhM+Gt1Phn98nStZa1r9mB2SDQPqefjhayfnDfFG2J5882z84eynVM5u3thlONhRhj0gLc5PRfwAw62JjW+wjE5Xa1L0VkshO4kXt/EPDev4ZJCyBRvlcwggjHG4EfYHc9OoIBBWy3mEUX4H1V7Ur7ZvILaT8qy7FRduleF9jXc4RggOUWs/gtANs0nYquvMXaMaTXlQHlE1ggayLvf5OKY0DUMYDWfmpsBjZa+9enOmiLy+VkcmqxaNW2ZgX9GnsLXNQWoGj4KYzQ2g8LyG5WUDR4hshEE6CN+AFmg5lFiRMYcI0uKRQGyIAwegWKJkBjYO8tzq12C7efQ7CK2I00MomIxOsCiCcwQhaW3sEQ6W7sPi/yIDqKAHp8m2nIF7COoc9ghQw4NU8SkYgiQCmLKXCCUSziPc84XYBh83/DSiWR3qUo2tT4ONdGYDTub73cSzD/PNt0rojdQHAByoXxw0E7XfoFhsjnRduD+DnWIkkXXACJl1cwRoMmf3cbRaOjLRzDXnKZVj9GBIILUJBtbVzyj9HAU19AgR6I9VzDtwCgMXpAo2Yxp0v/Ybi49ennJtIFEPMY/TCKHTvv+aTSUQzBgwrQ92YHbQVi3UN3GAVZhrf/jzECE1SAq/7n4yOJ074KPSBcJoii598vxgwrqAByg70HZJZbr0JJ0G5XZz5Z1e1rYccA5TAicqEk0O5ECl/3LvYys7mLTLHHCEzS7wz6Esv3+nyYTF58rwha63XAl8PG1aCnhesWq6EdOcKM3WvmXRHh+Gvv/tNVTJlJPC4a3RVEK72+sCSZ4+J/FBVhTUS43J7gJqFjrnl33A3sxtCa3nAWhX6bbAT4hJugCsNZ2TGA8224AJnjAmSOC5A5LkDmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnjAmSOC5A5LkDmuACZ4wJkjguQOWEFYJvz85xwBBWgKM1P68oKKsI/36ACdC9nsDlWPTsIJ5t1Hfw01OBjgI1p/YwLegIibw0CwESz9gUYZ2d/wHEcx3Ecx3Ecx3Ecx3HuS5QjfdrXxTHv3JzEkd2xKwHR9xPNuKGjzdf1MSIQXAA9XUsuuw8nKPpK3PWzs+AvrgwqgP1LojOjoEf3fRv6Zy+JgBSLOGfaOx1NE/6o+rCrgeT9fWp4SljmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnjAmSOC5A5LkDmuACZ4wJkjguQOS5A5rgAmeMCZI4LkDkuQOa4AJnj5wRmTlABqHQBohKhggUVYAEEP8fO+UiMgziDCvCwrnU3aw0nOATMQu8LVIIPAq+JdAerdwWBaQ/fjEBwAaQVmMnN7sEJCB3EqP3tlRGJy6qqmPkFMcZw7sucmfZiHQ6hRBNgSXdaCHbA7KeFfBvz9pxlxtl1gcN2XBWRfwHK959XFRG6AgAAAABJRU5ErkJggg==",
						},
						{
							id: "OKX Wallet",
							name: "OKX Wallet",
							url: "https://www.okx.com/web3",
							icon: "https://station.jup.ag/img/wallet/glow.png",
						},
					],
				}}
			>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Home />} />
					</Route>
				</Routes>
			</UnifiedWalletProvider>
		</>
	);
}
