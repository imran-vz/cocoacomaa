"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { FadeIn } from "@/components/fade-in";
import { DataTable } from "@/components/ui/data-table";

interface FilterColumn {
	id: string;
	title: string;
	options: { label: string; value: string }[];
}

interface AdminPageLayoutProps<TData> {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	columns: ColumnDef<TData>[];
	data: TData[];
	searchKey?: string;
	searchPlaceholder?: string;
	filterableColumns?: FilterColumn[];
	isLoading?: boolean;
}

export function AdminPageLayout<TData>(props: AdminPageLayoutProps<TData>) {
	if (props.isLoading) {
		return <AdminPageLayoutLoading {...props} />;
	}

	const {
		title,
		subtitle,
		actions,
		columns,
		data,
		searchKey,
		searchPlaceholder,
		filterableColumns,
	} = props;

	return (
		<div className="container mx-auto px-4 sm:px-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
					{subtitle && (
						<p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
					)}
				</div>
				{actions && <div className="flex gap-2">{actions}</div>}
			</div>
			<div className="rounded-md">
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={data}
						searchKey={searchKey}
						searchPlaceholder={searchPlaceholder}
						filterableColumns={filterableColumns}
					/>
				</div>
			</div>
		</div>
	);
}

function AdminPageLayoutLoading<TData>({
	title,
	subtitle,
	actions,
	columns,
	data,
	searchKey = "name",
	searchPlaceholder = "Search...",
	filterableColumns,
	isLoading = false,
}: AdminPageLayoutProps<TData>) {
	return (
		<FadeIn>
			<div className="container mx-auto px-4 sm:px-6">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
						{subtitle && (
							<p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
						)}
					</div>
					{actions && <div className="flex gap-2">{actions}</div>}
				</div>
				<div className="rounded-md">
					<div className="overflow-x-auto">
						<DataTable
							columns={columns}
							data={data}
							searchKey={searchKey}
							searchPlaceholder={searchPlaceholder}
							filterableColumns={filterableColumns}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
		</FadeIn>
	);
}
