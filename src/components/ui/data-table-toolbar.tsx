"use client";

import type { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { Input } from "@/components/ui/input";

interface DataTableToolbarProps<TData> {
	table: Table<TData>;
	searchKey?: string;
	searchPlaceholder?: string;
	filterableColumns?: {
		id: string;
		title: string;
		options: {
			label: string;
			value: string;
			icon?: React.ComponentType<{ className?: string }>;
		}[];
	}[];
}

export function DataTableToolbar<TData>({
	table,
	searchKey,
	searchPlaceholder = "Filter...",
	filterableColumns = [],
}: DataTableToolbarProps<TData>) {
	const isFiltered = table.getState().columnFilters.length > 0;

	return (
		<div className="flex flex-col sm:flex-row gap-2 sm:items-center justify-between py-2 pr-2">
			<div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2">
				{searchKey && (
					<Input
						placeholder={searchPlaceholder}
						value={
							(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
						}
						onChange={(event) =>
							table.getColumn(searchKey)?.setFilterValue(event.target.value)
						}
						className="h-8 w-full sm:w-[150px] lg:w-[250px]"
					/>
				)}
				{filterableColumns.map(
					(column) =>
						table.getColumn(column.id) && (
							<DataTableFacetedFilter
								key={column.id}
								column={table.getColumn(column.id)}
								title={column.title}
								options={column.options}
							/>
						),
				)}
				{isFiltered && (
					<Button
						variant="ghost"
						onClick={() => table.resetColumnFilters()}
						className="h-8 px-2 lg:px-3"
					>
						Reset
						<X className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
			<DataTableViewOptions table={table} />
		</div>
	);
}
