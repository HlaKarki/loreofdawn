export default async function Home() {
	// if i do some fetch here, will it block this home page from rendering until this fetch was complete?
	return (
		<div className="container mx-auto max-w-3xl px-4 py-2">
			{/* Search input */}
			<div>Search</div>

			{/* Three Top Heroes */}
			<div>
				<h1>Heroes popping off this week</h1>
			</div>

			{/* Live Meta Stats */}
			<div>Live meta stats</div>
			<div>Table snapshot? Can view full table on click _ go to stats page/#table</div>
			<div>Quardrant chart? like in football?</div>

			{/* Action buttons */}
			<div>Find your main</div>
			<div>Counter picks</div>
			<div>Did you know?</div>

			{/* Latest */}
			<div>Reddit feed</div>
			<div>Patch notes</div>
		</div>
	);
}
