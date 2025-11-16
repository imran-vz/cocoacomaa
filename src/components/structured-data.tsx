import type { Thing, WithContext } from "schema-dts";

interface StructuredDataProps {
	data: WithContext<Thing> | WithContext<Thing>[];
}

export function StructuredData({ data }: StructuredDataProps) {
	const jsonLd = Array.isArray(data) ? data : [data];

	return (
		<>
			{jsonLd.map((item) => {
				const jsonString = JSON.stringify(item);
				return (
					<script
						key={jsonString}
						type="application/ld+json"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
						dangerouslySetInnerHTML={{ __html: jsonString }}
					/>
				);
			})}
		</>
	);
}
