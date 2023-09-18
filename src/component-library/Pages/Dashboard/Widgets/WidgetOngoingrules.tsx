import { H3 } from "@/component-library/Text/Headings/H3.stories";
import { P } from "@/component-library/Text/Content/P";
import { twMerge } from "tailwind-merge";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { ChartData } from "../types";
import { Ongoingrules } from "@/lib/core/entity/widgets";
import {
    createColumnHelper, getCoreRowModel, getPaginationRowModel, useReactTable,
    Row, Column, getSortedRowModel
} from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { TableSortUpDown } from "@/component-library/StreamedTables/TableSortUpDown.stories";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

ChartJS.defaults.font.size = 14
ChartJS.defaults.font.family = "mono"


type ChartDataNumeric = {
    label: string,
    backgroundColor: string, // Hex
    data: number[]
}

export const WidgetColourLabel: React.FC<JSX.IntrinsicElements["div"] & {
    name: string,
    colour: string, // needs to be valid Tailwind Classname
}> = ({ name, colour, ...props }) => {
    const { className, ...otherprops } = props
    return (
        <div
            className={twMerge(
                "flex flex-row space-x-1 items-center",
                className ?? "",
            )}
            {...otherprops}
        >
            <div
                className={twMerge(
                    "w-6 h-4",
                    colour
                )}
            />
            <P>{name}</P>
        </div>
    )
}

export const WidgetOngoingrules: React.FC<JSX.IntrinsicElements["div"] & {
    input: Ongoingrules[]
}> = (
    {
        input,
        ...props
    }
) => {
        /* 
        * This is a widget that displays the ongoing rules in a stacked bar chart.
        * The input is an array of Ongoingrules objects, containing the rulename
        * as well as the absolute amount of locks in each state.
        * The widget displays the percentage of locks in each state for each rule.
        * The colours correspond to those used in the LockStateTag.
        */
        const { className, ...otherprops } = props
        const [data, setData] = useState<ChartData<ChartDataNumeric>>({
            labels: [],
            datasets: []
        })
        const options = {
            indexAxis: "y" as const,
            responsive: true,
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: "Percentage [%]",
                    },
                    stacked: true,
                    min: 0,
                    max: 100,
                },
                y: {
                    stacked: true,
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: false,
                    text: "Locks of Ongoing Rules",
                    font: {
                        size: 18,
                    },
                    color: "#000",
                },
                tooltip: {
                    enabled: true,
                },
            }
        }
        const percentify = (v: number, row: Row<Ongoingrules>) => {
            const totalLocks = (row.getValue("replicating") as number) +
                (row.getValue("ok") as number) +
                (row.getValue("stuck") as number)
            return v / totalLocks * 100
        }

        // TABLE
        const columnHelper = createColumnHelper<Ongoingrules>()
        const table = useReactTable<Ongoingrules>({
            data: input || [],
            columns: [
                columnHelper.accessor("rulename", {
                    id: "rulename",
                }),
                columnHelper.accessor(row => 100 * row.ok / (row.ok + row.replicating + row.stuck), {
                    id: "ok"
                }),
                columnHelper.accessor(row => 100 * row.replicating / (row.ok + row.replicating + row.stuck), {
                    id: "replicating"
                }),
                columnHelper.accessor(row => 100 * row.stuck / (row.ok + row.replicating + row.stuck), {
                    id: "stuck"
                })
            ],
            getCoreRowModel: getCoreRowModel(),
            getPaginationRowModel: getPaginationRowModel(),
            getSortedRowModel: getSortedRowModel()
        })

        const tableToChart = () => {
            const rows = table.getRowModel().rows
            return {
                labels: rows.map(row => row.getValue("rulename")),
                datasets: [
                    {
                        label: "OK",
                        data: rows.map(row => percentify(row.getValue("ok"), row)),
                        backgroundColor: "#86efac"
                    },
                    {
                        label: "Replicating",
                        data: rows.map(row => percentify(row.getValue("replicating"), row)),
                        backgroundColor: "#fcd34d",
                    },
                    {
                        label: "Stuck",
                        data: rows.map(row => percentify(row.getValue("stuck"), row)),
                        backgroundColor: "#f87171"
                    }
                ]
            } as ChartData<ChartDataNumeric>
        }

        useEffect(() => {
            setData(tableToChart())
        }, [table, table.getRowModel()])

        return (
            <div
                className={twMerge(
                    "flex flex-col items-center"
                )}
            >
                <div
                    className={twMerge(
                        "flex flex-col items-center space-y-2"
                    )}
                >
                    <H3 className="font-bold">Locks of Ongoing Rules</H3>
                    <div
                        className={twMerge(
                            "flex flex-row space-x-2"
                        )}
                    >

                        <TableSortUpDown
                            name="OK"
                            column={table.getColumn("ok") as Column<Ongoingrules, number>}
                            element={<WidgetColourLabel name="OK" colour="bg-green-300" />}
                        />
                        <TableSortUpDown
                            name="Replicating"
                            column={table.getColumn("ok") as Column<Ongoingrules, number>}
                            element={<WidgetColourLabel name="Replicating" colour="bg-amber-300" />}
                        />
                        <TableSortUpDown
                            name="Stuck"
                            column={table.getColumn("stuck") as Column<Ongoingrules, number>}
                            element={<WidgetColourLabel name="Stuck" colour="bg-red-400" />}
                        />
                    </div>
                </div>
                <Bar
                    options={options}
                    data={data}
                    aria-label="Ongoing Rules Widget"
                />
            </div>
        );
    };
