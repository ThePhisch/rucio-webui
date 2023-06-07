import { DIDLong } from "@/lib/core/entity/rucio";
import { TableData } from "@/lib/infrastructure/data/view-model/streamedtables";
import { StoryFn, Meta } from "@storybook/react";
import { createColumnHelper, Column} from "@tanstack/react-table";
import { createRandomDIDLong } from "test/fixtures/table-fixtures";
import { StreamedTable as S } from "./StreamedTable";

export default {
    title: 'Components/StreamedTables',
    component: S,
} as Meta<typeof S>;

const Template: StoryFn<typeof S> = (args) => <S {...args} />;

const columnHelper = createColumnHelper<DIDLong>()

export const StreamedTable = Template.bind({});
StreamedTable.args = {
    tabledata: {
        data: Array.from({length: 100}, (_, i) => createRandomDIDLong()),
        fetchStatus: "idle",
        pageSize: 10,
    } as TableData<DIDLong>,
    tablecolumns: [
        columnHelper.accessor(row => `${row.scope}:${row.name}`, {
            id: "did",
        }),
        columnHelper.accessor("did_type", {
            id: "did_type",
            header: info => {
                return (
                    // tidbit: filter column by clicking on the header
                    <div
                        onClick={(e) => {
                            const nextRecord = {
                                "undefined": "Dataset",
                                "Dataset": "Container",
                                "Container": undefined, // default value of tanstack is undefined
                            }
                            console.log(info.column.getFilterValue())
                            const currentFilterValue = String(info.column.getFilterValue()) as keyof typeof nextRecord 
                            info.column.setFilterValue(nextRecord[currentFilterValue ?? "null"])
                        }}
                    >
                        <span>DID Type</span>
                    </div>
                )
            }
        })
    ]
};
