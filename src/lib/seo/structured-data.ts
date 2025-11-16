import type { Thing, WithContext } from "schema-dts";

export function generateLocalBusinessSchema(): WithContext<Thing> {
	return {
		"@context": "https://schema.org",
		"@type": "Bakery",
		name: "Cocoa Comaa",
		image: "https://cocoacomaa.com/logo.png",
		"@id": "https://cocoacomaa.com",
		url: "https://cocoacomaa.com",
		telephone: "+91-84318-73579",
		email: "contact@cocoacomaa.com",
		address: {
			"@type": "PostalAddress",
			streetAddress: "17th F Main Rd, KHB Block Koramangala, 5th Block",
			addressLocality: "Koramangala",
			addressRegion: "Karnataka",
			postalCode: "560095",
			addressCountry: "IN",
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: 12.9352,
			longitude: 77.6245,
		},
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
				opens: "09:00",
				closes: "18:00",
			},
		],
		priceRange: "₹₹",
		servesCuisine: "Desserts",
		acceptsReservations: "True",
	};
}

export function generateOrganizationSchema(): WithContext<Thing> {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: "Cocoa Comaa",
		url: "https://cocoacomaa.com",
		logo: "https://cocoacomaa.com/logo.png",
		description:
			"Order fudgy custom brownies, cakes & desserts in Bengaluru. Baking workshops available.",
		email: "contact@cocoacomaa.com",
		telephone: "+91-84318-73579",
		address: {
			"@type": "PostalAddress",
			streetAddress: "17th F Main Rd, KHB Block Koramangala, 5th Block",
			addressLocality: "Koramangala",
			addressRegion: "Karnataka",
			postalCode: "560095",
			addressCountry: "IN",
		},
		sameAs: ["https://www.instagram.com/cocoacomaa"],
	};
}

export function generateBreadcrumbSchema(
	items: Array<{ name: string; url: string }>,
): WithContext<Thing> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: item.url,
		})),
	};
}

interface ProductSchemaProps {
	name: string;
	description: string;
	image: string;
	price: number;
	availability: "InStock" | "OutOfStock" | "PreOrder";
	category: string;
}

export function generateProductSchema({
	name,
	description,
	image,
	price,
	availability,
	category,
}: ProductSchemaProps): WithContext<Thing> {
	return {
		"@context": "https://schema.org",
		"@type": "Product",
		name,
		description,
		image,
		category,
		brand: {
			"@type": "Brand",
			name: "Cocoa Comaa",
		},
		offers: {
			"@type": "Offer",
			url: "https://cocoacomaa.com/order",
			priceCurrency: "INR",
			price: price.toString(),
			availability: `https://schema.org/${availability}`,
			seller: {
				"@type": "Organization",
				name: "Cocoa Comaa",
			},
		},
	};
}

interface EventSchemaProps {
	name: string;
	description: string;
	startDate: string;
	endDate: string;
	location: string;
	price: number;
	availability: "InStock" | "SoldOut";
}

export function generateEventSchema({
	name,
	description,
	startDate,
	endDate,
	location,
	price,
	availability,
}: EventSchemaProps): WithContext<Thing> {
	return {
		"@context": "https://schema.org",
		"@type": "Event",
		name,
		description,
		startDate,
		endDate,
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
		location: {
			"@type": "Place",
			name: location,
			address: {
				"@type": "PostalAddress",
				streetAddress: "17th F Main Rd, KHB Block Koramangala, 5th Block",
				addressLocality: "Koramangala",
				addressRegion: "Karnataka",
				postalCode: "560095",
				addressCountry: "IN",
			},
		},
		offers: {
			"@type": "Offer",
			url: "https://cocoacomaa.com/workshops",
			priceCurrency: "INR",
			price: price.toString(),
			availability:
				availability === "InStock"
					? "https://schema.org/InStock"
					: "https://schema.org/SoldOut",
		},
		organizer: {
			"@type": "Organization",
			name: "Cocoa Comaa",
			url: "https://cocoacomaa.com",
		},
	};
}
