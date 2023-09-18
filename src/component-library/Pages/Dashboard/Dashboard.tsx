import { twMerge } from "tailwind-merge";
import { H3 } from "../../Text/Headings/H3";
import { H4 } from "../../Text/Headings/H4";
import { P } from "../../Text/Content/P";
import { Checkbox } from "../../Button/Checkbox";
import { WidgetOngoingrules } from "./Widgets/WidgetOngoingrules";
import { RoleTag } from "../../Tags/RoleTag";
import { Role } from "@/lib/core/entity/account";
import { Ongoingrules, Usedquota } from "@/lib/core/entity/widgets";
import { WidgetUsedquota } from "./Widgets/WidgetUsedquota";
import { useState, useEffect } from "react";
import { Heading } from "../Helpers/Heading";
import { Body } from "../Helpers/Body"

interface PageDashboardProps {
    accountname: string;
    accountrole: Role;
    inputOngoingrules: Ongoingrules[];
    inputUsedquota: Usedquota[];
}

type WidgetVisibility = {
    ongoingrules: boolean;
    usedquota: boolean;
}

export const Dashboard = (
    props: PageDashboardProps
) => {
    const [widgetVisibility, setWidgetVisibility] = useState<WidgetVisibility>({
        ongoingrules: true,
        usedquota: true
    })
    return (
        <div
            className={twMerge("flex flex-col space-y-2 w-full")}
        >
            <Heading
                title="Dashboard"
                subtitle={`Overview for ${props.accountname}`}
                tag={<RoleTag role={props.accountrole} />}
            />
            <div
                className={twMerge(
                    "flex flex-col space-y-2",
                    "rounded-md p-2 border",
                    "bg-white dark:bg-gray-800"
                )}
            >
                <div
                    aria-label="Widgets"
                    className="flex flex-col space-y-2"
                >
                    <WidgetOngoingrules
                        input={props.inputOngoingrules}
                        className={widgetVisibility.ongoingrules ? "" : "hidden"}
                    />
                    <WidgetUsedquota
                        input={props.inputUsedquota}
                        className={widgetVisibility.usedquota ? "" : "hidden"}
                    />
                </div>
                <form
                    className={twMerge(
                        "bg-stone-100 dark:bg-gray-900 p-2 rounded-md",
                    )}
                    aria-label="Select Widgets"
                    id="select-widgets-panel"
                >
                    <label htmlFor="select-widget-panel">
                        <P className="font-bold">Select Widgets</P>
                    </label>
                    <div
                        className={twMerge(
                            "grid gap-y-0",
                            "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        )}
                    >
                        <Checkbox
                            label="Ongoing Rules"
                            checked={widgetVisibility.ongoingrules}
                            onChange={(e) => {setWidgetVisibility({...widgetVisibility, ongoingrules: e.target.checked})}}
                        />
                        <Checkbox
                            label="Top Quota Overview"
                            checked={widgetVisibility.usedquota}
                            onChange={(e) => {setWidgetVisibility({...widgetVisibility, usedquota: e.target.checked})}}
                        />
                    </div>

                </form>

            </div>

        </div>

    );
};
