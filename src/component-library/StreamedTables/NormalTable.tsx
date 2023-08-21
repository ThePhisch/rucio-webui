import { StyleMetaColumnDef } from "@/lib/infrastructure/data/view-model/streamedtables";
import {
    flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
    getSortedRowModel, RowSelectionState, useReactTable
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { UseComDOM } from "@/lib/infrastructure/hooks/useComDOM";
import { TableFooter } from "./TableFooter";
import { BaseViewModel } from "@/lib/sdk/view-models";
import { TablePaginationNav } from "./TablePaginationNav";

type NormalTableProps<T> = JSX.IntrinsicElements["table"] & {
    tabledata: T[]
    tablecolumns: any[] // todo type this
    tablestyling?: Partial<{
        visibility?: Record<string, boolean>
        tableHeadRowStyle?: string
        tableBodyRowStyle?: string
        pageSize?: number
        tableFooterStack?: boolean
    }>
    tableselecting?: {
        handleChange: (data: T[]) => void,
        enableRowSelection: boolean
        enableMultiRowSelection?: boolean,
        breakOut?: {
            breakoutVisibility: boolean,
            keys: Record<string, string>, // column id, displayname
        }
    }
}

export function NormalTable<T>(props: NormalTableProps<T>) {
    const { className, ...otherprops } = props

    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

    const table = useReactTable<T>({
        data: props.tabledata || [],
        columns: props.tablecolumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: false,
        enableRowSelection: props.tableselecting?.enableRowSelection ?? false,
        enableMultiRowSelection: props.tableselecting?.enableMultiRowSelection ?? false,
        onRowSelectionChange: setRowSelection,
        state: {
            columnVisibility: props.tablestyling?.visibility,
            rowSelection: rowSelection
        }
    })

    // https://github.com/TanStack/table/discussions/2155#discussioncomment-6010065
    useEffect(() => {
        props.tableselecting?.handleChange(table.getSelectedRowModel().flatRows.map((row) => row.original))
    }, [rowSelection, table])
    // `enableRowSelection` might be subject to change => clear selection if changes to false
    useEffect(() => {
        if (props.tableselecting?.enableRowSelection === false) {
            table.setRowSelection({})
        }
    }, [props.tableselecting?.enableRowSelection])


    // Pagination
    const [pageIndex, setPageIndex] = useState(table.getState().pagination.pageIndex)
    useEffect(() => {
        setPageIndex(table.getState().pagination.pageIndex)
    }, [table])
    useEffect(() => {
        table.setPageIndex(pageIndex)
    }, [pageIndex, table])
    // Page number
    useEffect(() => {
        table.setPageSize(props.tablestyling?.pageSize ?? 10) // default to 10
    }, [props.tablestyling?.pageSize, table])

    // Breakout
    const [breakoutVisibility, setBreakoutVisibility] = useState(props.tableselecting?.breakOut?.breakoutVisibility ?? false)
    useEffect(() => {
        setBreakoutVisibility(props.tableselecting?.breakOut?.breakoutVisibility ?? false)
    }, [props.tableselecting?.breakOut?.breakoutVisibility])

    return (
        <table
            className={twMerge(
                "bg-white dark:bg-gray-700",
                "w-full",
                "relative",
                "table-fixed",
                className
            )}
            {...otherprops}
            role="grid" // if table maintains selection state or allows 2D nav -> use grid
        // see https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/table_role#description
        >
            <thead role="rowgroup" aria-label="Table Header">
                <tr
                    className={twMerge(
                        "h-16 md:h-12",
                        "bg-white dark:bg-gray-700",
                        "relative",
                        props.tablestyling?.tableHeadRowStyle ?? "",
                    )}
                    role="row"
                >
                    {table.getLeafHeaders().map(header => {
                        return (
                            <th
                                key={header.id}
                                className={(header.column.columnDef as StyleMetaColumnDef<T>).meta?.style ?? ""}
                                role="columnheader"
                                aria-label={header.id}
                            >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody
                role="rowgroup"
                aria-label="Table Body"
            >
                {table.getRowModel().rows.map(row => {
                    const selected = row.getIsSelected()
                    return (
                        <tr
                            key={row.id}
                            className={twMerge(
                                "h-16 md:h-8",
                                selected ? "bg-blue-200 odd:bg-blue-200" : "bg-white odd:bg-stone-100", // bg normal
                                selected ? "dark:bg-blue-500 odd:dark:bg-blue-500" : "dark:bg-gray-700 dark:odd:bg-gray-800", // bg dark
                                selected ? "hover:bg-blue-300  dark:hover:bg-blue-600" : "hover:bg-gray-200 dark:hover:bg-gray-900", // hover (dark and light)
                                selected ? "border-blue-400 dark:border-blue-700 border" : "", // handle border when selected
                                row.getCanSelect() ? "hover:cursor-pointer" : "hover:cursor-normal", // handle cursor when selectable
                                props.tablestyling?.tableBodyRowStyle ?? "",
                            )}
                            onClick={(e) => {
                                if (row.getCanSelect()) {
                                    row.toggleSelected()
                                }
                            }}
                            role="row"
                            aria-selected={row.getCanSelect() ? selected : undefined} // undefined => not selectable
                        >
                            {row.getVisibleCells().map(cell => {
                                return (
                                    <td
                                        key={cell.id}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
            </tbody>
            <tfoot
                className={twMerge("h-8")}
                role="rowgroup"
                aria-label="NormalTable Footer"
            >
                <tr aria-label="Pagination Controls">
                    <td
                        colSpan={table.getVisibleLeafColumns().length}
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-full md:w-[400px]">
                                <TablePaginationNav table={table} />
                            </div>
                        </div>
                    </td>
                </tr>

            </tfoot>
        </table>
    )
}