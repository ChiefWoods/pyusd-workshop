import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";
import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
	const location = useLocation();

	return (
		<main>
			<nav className="flex gap-4 justify-between">
				<ul>
					<li>
						<Link to="/" className={location.pathname === "/" ? "underline" : ""}>Home</Link>
					</li>
				</ul>
				<UnifiedWalletButton />
			</nav>
			<Outlet />
		</main>
	);
}
