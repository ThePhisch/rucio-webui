// components
import { Button } from "../../Button/Button";
import { P } from "../../Text/Content/P";
import { H3 } from "../../Text/Headings/H3";
import { Filter } from "../../StreamedTables/Filter";
import { NumInput } from "../../Input/NumInput";
import { BoolTag } from "../../Tags/BoolTag";
import { AvailabilityTag } from "../../Tags/AvailabilityTag";
import { DIDTypeTag } from "../../Tags/DIDTypeTag";
import { DateTag } from "../../Tags/DateTag";
import { NullTag } from "../../Tags/NullTag";
import { FetchstatusIndicator } from "../../StreamedTables/FetchstatusIndicator";
import { PaginationDiv } from "../../StreamedTables/PaginationDiv";

// misc packages, react
import { useEffect, useState } from "react"
import { createColumnHelper, useReactTable, TableOptions, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, Column, flexRender } from "@tanstack/react-table"
import { twMerge } from "tailwind-merge"
import { FetchStatus } from "@tanstack/react-query";
import { HiChevronDoubleLeft, HiChevronLeft, HiChevronRight, HiChevronDoubleRight, HiSearch, HiCheck, HiDotsHorizontal, HiExternalLink } from "react-icons/hi"

// Viewmodels etc
import { ReplicaState } from "@/lib/core/entity/rucio";
import { ReplicaStateTag } from "../../Tags/ReplicaStateTag";
import { TableData } from "@/lib/infrastructure/data/view-model/streamedtables";
import { FilereplicaState } from "@/lib/infrastructure/data/view-model/page-did";


export const PageDIDFilereplicas = (
    props: {
        tableData: TableData<FilereplicaState>,
    }
) => {
    const tableData = props.tableData
    const columnHelper = createColumnHelper<FilereplicaState>()
    const columns: any[] = [
        columnHelper.accessor("rse", {
            id: "rse",
            cell: (info) => {
                return (
                    <span className="flex flex-row justify-start space-x-2 items-center">
                        <p
                            className={twMerge(
                                "pl-2 select-all",
                                "dark:text-gray-100",
                                "break-all"
                            )}
                        >
                            {info.getValue()}
                        </p>
                        <a
                            href={"/rse/" + info.getValue()}
                            className={twMerge(
                                "text-gray-600 hover:text-blue-600",
                                "dark:text-gray-400 dark:hover:text-blue-400",
                            )}
                        >
                            <HiExternalLink className="text-l" />
                        </a>
                    </span>
                )
            },
            filterFn: "includesString",
        }
        ),
        columnHelper.accessor("state", {
            id: "state",
            cell: (info) => {
                return (
                    <ReplicaStateTag state={info.getValue()} />
                )
            },
            filterFn: "equalsString"
        })
    ]

    const table = useReactTable<FilereplicaState>({
        data: tableData.data || [],
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        debugTable: true,
    } as TableOptions<FilereplicaState>)

    // filtering by File Replica State
    const [filterType, setFilterType] = useState<ReplicaState | null>(null)

    // handle window resize
    const [windowSize, setWindowSize] = useState([
        1920, 1080
    ]);

    useEffect(() => {
        setWindowSize([window.innerWidth, window.innerHeight])

        const handleWindowResize = () => {
            setWindowSize([window.innerWidth, window.innerHeight]);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);
    // using the window size to determine whether we shall show the input form with full width
    const [smallScreenNameFiltering, setSmallScreenNameFiltering] = useState(false)
    useEffect(() => {
        if (windowSize[0] > 640) {
            setSmallScreenNameFiltering(false)
        }
    }, [windowSize])

    // Pagination
    const [pageIndex, setPageIndex] = useState(table.getState().pagination.pageIndex)
    useEffect(() => {
        setPageIndex(table.getState().pagination.pageIndex)
    }, [table.getState().pagination.pageIndex])
    useEffect(() => {
        table.setPageIndex(pageIndex)
    }, [pageIndex])
    useEffect(() => {
        table.setPageSize(tableData.pageSize)
    }, [tableData.pageSize])

    return (
        <div
            className={twMerge(
                "border dark:border-gray-200 dark:border-2 rounded-md",
                "flex flex-col justify-between space-y-2 pb-2",
                "bg-white dark:bg-gray-700",
                "h-fit min-h-[430px]",
                "relative",
                "min-w-0",
            )}
        >
            <table className="table-fixed w-full text-left">
                <thead className="w-full">
                    <tr
                        className={twMerge(
                            "w-full flex-row sticky top-0 bg-white dark:bg-gray-700 shadow-md dark:shadow-none h-16 sm:h-12"
                        )}
                    >
                        <th className="pl-2">
                            <div className="flex flex-row items-center space-x-8 justify-between">
                                <span className="shrink-0">
                                    <H3>RSE</H3>
                                </span>
                                <span className="hidden sm:flex w-full">
                                    <Filter
                                        column={table.getColumn("rse") as Column<FilereplicaState, unknown>}
                                        table={table}
                                        placeholder="Filter by Key"
                                    />
                                </span>
                                <span className="flex sm:hidden pr-4 relative">
                                    <button
                                        onClick={(e) => { setSmallScreenNameFiltering(!smallScreenNameFiltering) }}
                                    >
                                        <HiSearch className="text-xl text-gray-500 dark:text-gray-200" />
                                    </button>
                                </span>
                            </div>
                            <div
                                id="smallScreenNameFiltering"
                                className={twMerge(
                                    "absolute inset-0",
                                    smallScreenNameFiltering ? "flex" : "hidden",
                                    "bg-white",
                                    "p-2 flex-row justify-between space-x-2 items-center"
                                )}
                            >
                                <Filter
                                    column={table.getColumn("rse") as Column<FilereplicaState, unknown>}
                                    table={table}
                                    placeholder="Filter by Key"
                                />
                                <button
                                    onClick={(e) => { setSmallScreenNameFiltering(!smallScreenNameFiltering) }}
                                >
                                    <HiCheck className="text-xl text-gray-500 dark:text-gray-200" />
                                </button>
                            </div>
                        </th>
                        <th
                            className="pl-2 w-32 md:w-64 cursor-pointer"
                            onClick={(e) => {
                                // create a match statement for the filter type
                                const filterchange = (filterType: ReplicaState | null) => {
                                    setFilterType(filterType)
                                    var column = table.getColumn("state") as Column<FilereplicaState, unknown>
                                    column.setFilterValue(filterType ?? "")
                                }
                                const nextRecord = {
                                    "null": "Available",
                                    "Available": "Unavailable",
                                    "Unavailable": "Copying",
                                    "Copying": "Being_Deleted",
                                    "Being_Deleted": "Bad",
                                    "Bad": "Temporary_Unavailable",
                                    "Temporary_Unavailable": null,
                                }
                                filterchange(nextRecord[filterType ?? "null"] as ReplicaState | null)
                            }}
                        >
                            <span className="flex flex-col md:flex-row justify-between items-center pr-1 space-y-1 md:pr-2">
                                <H3>File Replica State</H3>
                                <span className="h-6">
                                    {
                                        filterType === null ? <HiDotsHorizontal className="text-xl text-gray-500 dark:text-gray-200" /> : <ReplicaStateTag state={filterType as ReplicaState} tiny />
                                    }
                                </span>
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody className="w-full">
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <tr
                                key={row.id}
                                className={twMerge(
                                    "w-full hover:cursor-normal h-16 md:h-8",
                                    "bg-white odd:bg-stone-100",
                                    "dark:bg-gray-700 dark:odd:bg-gray-800",
                                    "hover:bg-gray-200 dark:hover:bg-gray-900",
                                )}
                            >
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <td
                                            key={cell.id}
                                            className="pl-2"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    }
                    )}
                </tbody>
            </table>
            <PaginationDiv table={table}/>
            <div
                className={twMerge(
                    "absolute",
                    "top-16 sm:top-12 right-2",
                )}
            // DO WE NEED THIS?
            >
                <FetchstatusIndicator status={tableData.fetchStatus} />
            </div>
        </div>
    )
}