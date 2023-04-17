import { useEffect, useState } from 'react';
import { CreateRuleViewModel } from '../../../../lib/infrastructure/data/view-model/createRule.d';
import { Button } from '../../Button/Button';
import { CheckBox } from '../../Checkbox/Checkbox.stories';
import { Timeline } from '../../Timeline/Timeline';
import { Collapsible } from '../../Helpers/Collapsible';
import { Tabs } from '../../Tabs/Tabs';
import { TextInput } from '../../Input/TextInput';
import { Dropdown } from '../../Dropdown/Dropdown';
import { RulePage } from './RulePage';
import { convertCompilerOptionsFromJson } from 'typescript';
import { DateInput } from '../../Input/DateInput';
import { NumberInput } from '../../Input/NumberInput';
import { ListInput } from '../../Input/ListInput';
import { P } from "../../Text/Content/P";
import { H3 } from "../../Text/Headings/H3";
import { Label } from "../../Text/Content/Label"
import { RSEQuotaTable } from '../../Table/RSEQuotaTable';
import { NumInput } from '../../Input/NumInput';
import { AreaInput } from '../../Input/AreaInput';

var format = require("date-format")

/* =================================================
*  Importing Types and Interfaces
*  ================================================= */
import { DIDType } from '@/lib/core/data/rucio-dto';
import {
    CreateRuleQuery, CreateRuleResponse,
    DIDName, RSEName,
    DIDElement, DIDQueryError, RSEInformation,
    TypedDIDValidationQuery, TypedDIDValidationResponse,
    DIDSearchQuery, DIDSearchResponse,
    RSESearchQuery, RSESearchResponse,

} from '../../../../lib/infrastructure/data/view-model/createRule.d';

export interface CreateRulePageProps {
    onSubmit: (createRuleQuery: CreateRuleQuery) => Promise<CreateRuleResponse>
    didSearch: (didSearchQuery: DIDSearchQuery) => Promise<DIDSearchResponse>
    didValidation: (didValidationQuery: TypedDIDValidationQuery) => Promise<TypedDIDValidationResponse>
    rseSearch: (rseSearchQuery: RSESearchQuery) => Promise<RSESearchResponse>
}

// can assume that DIDs are unique, hence SET can be used later

interface Page0State {
    page0progressBlocked: boolean

    // Subpage 0: DID Search Pattern
    // settings for DID Search
    selectDIDMethod: number
    selectDIDDataPattern: string
    showXnumItems: number
    showItemsGranularity: DIDType
    // selection by search
    matchingDIDs: DIDSearchResponse
    chosenDIDs: Array<DIDName>

    // Subpage 1: List of DIDs
    // selection via typing
    typedDIDs: Array<DIDName>
    errorDIDs: TypedDIDValidationResponse // validation of typed DIDs
}

interface Page1State {
    page1progressBlocked: boolean
    RSEExpression: string
    RSEQueryResponse: Array<RSEInformation>
    RSESelection: Array<RSEName>
    askForApproval: boolean
}

interface Page2State {
    page2progressBlocked: boolean
    expiryDate: Date
    enableNotifications: boolean
    showAdvanced: boolean
    groupBy: DIDType
    asynchronousMode: boolean
    numcopies: number
    numsamples: number
    freeComment: string
}

export const CreateRule = (
    props: CreateRulePageProps
) => {
    /* =================================================
    *  Relevant for all pages
    *  ================================================= */
    // state to store active page
    const [activePage, setActivePage] = useState<number>(0)
    const pagePrevFunction = (event: any) => {
        setActivePage(activePage - 1)
    }


    /* =================================================
    *  Page 0
    *  ================================================= */
    // page 0 state
    const [Page0State, setPage0State] = useState<Page0State>({
        selectDIDMethod: 0,
        selectDIDDataPattern: "",
        matchingDIDs: { DIDList: [] },
        showXnumItems: 10,
        showItemsGranularity: "Dataset",
        chosenDIDs: [],
        typedDIDs: [],
        errorDIDs: { ErrorList: [] },
        page0progressBlocked: true
    })

    useEffect(() => {
        // set page0progressblocked to true if chosenDIDs is empty
        if (Page0State.chosenDIDs.length === 0 && Page0State.typedDIDs.length === 0) {
            setPage0State({ ...Page0State, page0progressBlocked: true })
        } else {
            setPage0State({ ...Page0State, page0progressBlocked: false })
        }
        // need to make decision whether changing tab should empty the chosenDIDs
    }, [Page0State.typedDIDs, Page0State.chosenDIDs])

    const page0DIDSearch = (event: any, explicitDIDSearchExpression?: string) => {
        let DIDSearchString = explicitDIDSearchExpression ? explicitDIDSearchExpression : Page0State.selectDIDDataPattern

        // build query
        const DIDSearchQuery: DIDSearchQuery = {
            DIDSearchString: DIDSearchString,
        }

        // execute query
        const DIDSearchResponse = props.didSearch(DIDSearchQuery)
        DIDSearchResponse.then((response) => {
            setPage0State({ ...Page0State, matchingDIDs: response })
        })
        DIDSearchResponse.catch((error) => {
            console.log("DIDSearchResponse error: ", error)
        })
    }

    const page0nextFunction = (event: any) => {
        if (Page0State.typedDIDs.length === 0) {
            // no validation, just next page
            setActivePage(activePage + 1)
            return
        }
        // if typedDIDs is not empty, then we need to validate the DIDs
        var splitDIDs = Page0State.typedDIDs
        const TypedDIDValidationQuery: TypedDIDValidationQuery = {
            DIDList: splitDIDs
        }

        // execute query
        const typedDIDValidationResponse = props.didValidation(TypedDIDValidationQuery)
        typedDIDValidationResponse.then((response) => {
            setPage0State({ ...Page0State, errorDIDs: response})
            setActivePage(activePage + 1)
        })
        typedDIDValidationResponse.catch((error) => {
            setPage0State({ ...Page0State, errorDIDs: error})
        })

        // TODO: display errors in a modal
    }

    /* =================================================
    *  Page 1
    *  ================================================= */
    // page 1 state
    const [Page1State, setPage1State] = useState<Page1State>({
        RSEExpression: "",
        RSEQueryResponse: [],
        RSESelection: [],
        askForApproval: false,
        page1progressBlocked: true
    })

    useEffect(() => {
        // set page1progressblocked to true if RSESelection is empty
        if (Page1State.RSESelection.length === 0) {
            setPage1State({ ...Page1State, page1progressBlocked: true })
        }
        else {
            setPage1State({ ...Page1State, page1progressBlocked: false })
        }
    }, [Page1State.RSESelection])

    const page1RSESearch = (event: any, explicitRSEExpression?: string) => {
        // sometimes the state has not updated yet, so use explicitly passed RSEExpr
        var RSEExpression = explicitRSEExpression ? explicitRSEExpression : Page1State.RSEExpression
        // if RSEExpression is empty, then set RSEQueryResponse to empty
        if (RSEExpression === "") {
            setPage1State({ ...Page1State, RSEQueryResponse: [] })
            return
        }
        // if RSEExpression is not empty, then we need to query the RSEs
        // build query
        const RSESearchQuery: RSESearchQuery = {
            RSEExpression: RSEExpression
        }
        // execute query
        const RSESearchResponse = props.rseSearch(RSESearchQuery)
        RSESearchResponse.then((response) => {
            setPage1State({ ...Page1State, RSEQueryResponse: response.RSEList })
        })
        RSESearchResponse.catch((error) => {
            console.log("RSESearchResponse error: ", error)
        })
    }

    /* =================================================
    *  Page 2
    *  ================================================= */
    // page 2 state
    const [Page2State, setPage2State] = useState<Page2State>({
        expiryDate: new Date(),
        numsamples: 1,
        enableNotifications: false,
        showAdvanced: false,
        groupBy: "Dataset",
        asynchronousMode: false,
        numcopies: 1,
        freeComment: "",
        page2progressBlocked: false
    })

    /* =================================================
    *  Page 3
    *  ================================================= */
    const page3submitFunction = (event: any) => {
        // build query
        const CreateRuleQuery: CreateRuleQuery = {
            DIDList: Page0State.typedDIDs.concat(Page0State.chosenDIDs),
            RSEList: Page1State.RSESelection,
            expirydate: Page2State.expiryDate,
            notifications: Page2State.enableNotifications,
            asynchronousMode: Page2State.asynchronousMode,
            numcopies: Page2State.numcopies,
            numsamples: Page2State.numsamples,
            groupby: Page2State.groupBy,
            comment: Page2State.freeComment,
        }

        // execute query
        const response = props.onSubmit(CreateRuleQuery)
        response.then((response) => {
            console.log("response: ", response)
        })
    }

    /* =================================================
    *  Building the page
    *  ================================================= */
    return (
        <div data-testid="create-rule-root">
            <div className="py-4 px-8" data-testid="timeline">
                <Timeline
                    steps={["DIDs", "RSEs", "Options", "Summary"]}
                    active={activePage}
                    onJump={(goal: number) => { setActivePage(goal) }}
                />
            </div>
            <div className="flex flex-col">
                <RulePage pagenum={0} activePage={activePage} progressBlocked={Page0State.page0progressBlocked} onNext={(event: any) => { page0nextFunction(event) }} onPrev={pagePrevFunction}>
                    <Tabs
                        tabs={["DID Search Pattern", "List of DIDs"]}
                        active={Page0State.selectDIDMethod}
                        handleClick={(event: any) => { console.log(event.target.id); setPage0State({ ...Page0State, selectDIDMethod: Number(event.target.id) }) }}
                        dataTestid="selectDIDMethod"
                    />
                    <Collapsible showIf={Page0State.selectDIDMethod === 0}>
                        <div className="flex flex-col space-y-2 m-2">
                            <div className="flex flex-col sm:flex-row w-full space-y-2 sm:space-x-2">
                                <label className='-mb-2 sm:mt-4 sm:w-36' htmlFor='did-search-pattern'><P>DID Search Pattern</P></label>
                                <div className='grow'>
                                    <TextInput
                                        onBlur={(event: any) => { setPage0State({ ...Page0State, selectDIDDataPattern: event.target.value }) }}
                                        onEnterkey={(event: any) => { setPage0State({ ...Page0State, selectDIDDataPattern: event.target.value }); page0DIDSearch(event.target.value, event.target.value) }}
                                        id="did-search-pattern"
                                    />
                                </div>
                                <div className="w-full sm:w-24 sm:grow-0">
                                    <Button type="submit" label="Search" onClick={page0DIDSearch} id="page0-search" />
                                </div>
                            </div>
                            <div className="flex flex-col md:flex-row w-full space-y-2 md:space-x-2">
                                <div className="grow flex flex-col space-y-2 sm:flex-row sm:space-x-2">
                                    <label className='-mb-2 sm:mt-4 sm:w-36 shrink-0' htmlFor='did-search-pattern'><P>Filter Results</P></label>
                                    <div className='grow'>
                                        <TextInput
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                    <span className="w-full md:w-24">
                                        <Dropdown
                                            label={Page0State.showXnumItems.toString()}
                                            options={["10", "20", "50", "100"]}
                                            handleChange={(element: any) => { setPage0State({ ...Page0State, showXnumItems: element }) }}
                                        />
                                    </span>
                                    <span className="w-full md:w-48">
                                        <Dropdown
                                            label={Page0State.showItemsGranularity}
                                            options={["Dataset", "Container", "Collection", "File"]}
                                            handleChange={(element: any) => { setPage0State({ ...Page0State, showItemsGranularity: element }) }}
                                        />
                                    </span>
                                </div>
                            </div>
                            <div className="h-full">
                                <table className="w-full text-left">
                                    <tbody className="w-full overflow-y-auto">
                                        {Page0State.matchingDIDs.DIDList.slice(0, Page0State.showXnumItems).map((element, index) => {
                                            // TODO: add pagination here
                                            // this works because the DID is unique
                                            return (
                                                !Page0State.chosenDIDs.includes(element.DID) ? (
                                                    <tr
                                                        key={index}
                                                        className="first:border-t border-b border-collapse hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-900 hover:cursor-pointer p-2 flex w-full"
                                                        onClick={() => {
                                                            setPage0State({ ...Page0State, chosenDIDs: Page0State.chosenDIDs.concat(element.DID) })
                                                        }}
                                                    >
                                                        <td><P mono>{element.DID}</P></td>
                                                    </tr>) : (
                                                    <tr
                                                        key={index}
                                                        className="first:border-t border-b border-collapse bg-blue-200 dark:bg-blue-500 hover:bg-blue-300 dark:hover:bg-blue-600 p-2 flex w-full"
                                                        onClick={() => {
                                                            setPage0State({ ...Page0State, chosenDIDs: Page0State.chosenDIDs.filter((item) => item !== element.DID) })
                                                        }}
                                                    >
                                                        <td><P mono>{element.DID}</P></td>
                                                    </tr>
                                                )
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Collapsible>
                    <Collapsible showIf={Page0State.selectDIDMethod === 1}>
                        <div className="flex flex-col space-y-2 m-2">
                            <Label label="dids">Data Identifiers to select:</Label>
                            <ListInput
                                id="dids"
                                onAdd={(value: string) => {
                                    setPage0State({ ...Page0State, typedDIDs: Page0State.typedDIDs.concat(value) })
                                }}
                                onRemove={(value: string) => {
                                    setPage0State({ ...Page0State, typedDIDs: Page0State.typedDIDs.filter((item) => item !== value) })
                                }}
                                value={Page0State.typedDIDs}
                                placeholder="Type your DIDs here"
                            />
                            <label htmlFor="didErrors">Errors:</label>
                            <div
                                id="didErrors"
                                className="h-24 overflow-y-auto w-full border rounded-md p-2 dark:text-white dark:border-2"
                            >
                                <Collapsible showIf={Page0State.errorDIDs.ErrorList.length === 0}>
                                    <p className="font-mono">{"Validate DIDs by pressing \"Next\"."}</p>
                                </Collapsible>
                                {Page0State.errorDIDs.ErrorList.map((element, index) => {
                                    return (
                                        <P mono key={index}>DID {element.DID} has Errorcodes {element.ErrorCodes}</P>
                                    )
                                })}
                            </div>
                        </div>
                    </Collapsible>
                </RulePage>
                <RulePage pagenum={1} activePage={activePage} progressBlocked={Page1State.page1progressBlocked} onNext={() => { setActivePage(activePage + 1) }} onPrev={pagePrevFunction}>
                    <div className="flex flex-col space-y-2 m-2">
                        <div className="flex w-full flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                            <label className="-mb-2 sm:mt-2.5 sm:w-36" htmlFor='rse-expression'><P>RSE Expression</P></label>
                            <div className="grow">
                                <TextInput
                                    id='rse-expression'
                                    onBlur={(event) => { setPage1State({ ...Page1State, RSEExpression: event.target.value }) }}
                                    onEnterkey={(event) => { setPage1State({ ...Page1State, RSEExpression: event.target.value }); page1RSESearch(event, event.target.value); }}
                                />
                            </div>
                            <div className="w-full sm:w-24">
                                <Button type="submit" label="Search" onClick={page1RSESearch} />
                            </div>
                        </div>
                        <RSEQuotaTable
                            data={Page1State.RSEQueryResponse}
                            selected={Page1State.RSESelection}
                            onAdd={(RSEName: string) => { setPage1State({ ...Page1State, RSESelection: [RSEName, ...Page1State.RSESelection] }) }}
                            onRemove={(RSEName: string) => { setPage1State({ ...Page1State, RSESelection: Page1State.RSESelection.filter((item) => item !== RSEName) }) }}
                            askApproval={Page1State.askForApproval}
                        />
                        <div>
                            <CheckBox
                                label="Ask for Approval"
                                type="checkbox"
                                handleChange={(event: any) => { setPage1State({ ...Page1State, askForApproval: event.target.checked})}}
                                isChecked={Page1State.askForApproval}
                            />
                        </div>
                    </div>
                </RulePage>
                <RulePage pagenum={2} activePage={activePage} progressBlocked={Page2State.page2progressBlocked} onNext={() => { setActivePage(activePage + 1) }} onPrev={pagePrevFunction}>
                    <div className="flex md:flex-row md:space-x-2 flex-col space-y-2 m-2">
                        <div className="flex flex-col space-y-2 md:w-60 w-full">
                            <div className="w-full">
                                <Label label="expiryDate">Expiry Date</Label>
                                <DateInput
                                    startDate={Page2State.expiryDate}
                                    placeholder="Rule Expiry Date"
                                    onChange={(date: Date) => { setPage2State({ ...Page2State, expiryDate: date }) }}
                                    id="expiryDate"
                                />
                            </div>
                            <div className="w-full">
                                <Label label="numSamples">Number of Samples</Label>
                                <NumInput
                                    value={Page2State.numsamples}
                                    placeholder="Rule Expiry Date"
                                    onChange={(event: any) => { setPage2State({ ...Page2State, numsamples: event.target.value }) }}
                                    id="numSamples"
                                    min={1}
                                />
                            </div>
                            <div className="w-full">
                                <CheckBox
                                    type="checkbox"
                                    label="Enable Notifications"
                                    handleChange={(event: any) => { setPage2State({ ...Page2State, enableNotifications: event.target.checked }) }}
                                    isChecked={Page2State.enableNotifications}
                                />
                            </div>
                        </div>
                        <div className="border rounded-md p-2 grow">
                            <div className="w-24">
                                <Button label="Advanced" onClick={() => { setPage2State({ ...Page2State, showAdvanced: !Page2State.showAdvanced }) }} />
                            </div>
                            <Collapsible showIf={Page2State.showAdvanced}>
                                <div className="flex flex-col space-y-2 mt-2">
                                    <div className="w-full">
                                        <Label label="groupBy">Group items by</Label>
                                        <Dropdown
                                            label={Page2State.groupBy}
                                            options={["Dataset", "Container", "Collection", "File"]}
                                            handleChange={(element: any) => { setPage2State({ ...Page2State, groupBy: element }) }}
                                        />
                                    </div>
                                    <div className="grow flex flex-col justify-end">
                                        <Label label="numCopies">Number of Copies</Label>
                                        <NumInput
                                            value={Page2State.numcopies}
                                            min={1}
                                            onChange={(event: any) => { setPage2State({ ...Page2State, numcopies: event.target.value }) }}
                                            id="numCopies"
                                        />
                                    </div>
                                    <div className="">
                                        <CheckBox
                                            type="checkbox"
                                            label="Asynchronous Mode"
                                            handleChange={(event: any) => { setPage2State({ ...Page2State, asynchronousMode: event.target.checked }) }}
                                            isChecked={Page2State.asynchronousMode}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <AreaInput
                                            id="freecomment"
                                            rows={3}
                                            onChange={(event) => { setPage2State({ ...Page2State, freeComment: event.target.value }); }}
                                            placeholder="Type your comment here."
                                            content={Page2State.freeComment}
                                        />
                                    </div>
                                </div>
                            </Collapsible>
                        </div>
                    </div>
                </RulePage>
                <RulePage pagenum={3} activePage={activePage} onNext={page3submitFunction} onPrev={pagePrevFunction} submit>
                    <div className="flex flex-col space-y-2 m-2">
                        <div className="w-full">
                            <H3>DIDs chosen</H3>
                            <ul>
                                {Page0State.typedDIDs.concat(Page0State.chosenDIDs).map((element, index) => {
                                    return (
                                        <li key={index}><P>{element}</P></li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className="w-full">
                            <H3>Replication to the following RSEs {Page1State.askForApproval ? "(will ask for approval)" : ""}</H3>
                            <ul>
                                {Page1State.RSESelection.map((element, index) => {
                                    return (
                                        <li key={index}><P>{element}</P></li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className="w-full">
                            <table className="w-full text-left">
                                <thead className="w-full flex hover:cursor-default">
                                    <tr className="hover:cursor-default w-full flex">
                                        <th className="w-1/2"><H3>Option</H3></th>
                                        <th className="w-1/2"><H3>Value</H3></th>
                                    </tr>
                                </thead>
                                <tbody className="w-full overflow-y-auto flex flex-col h-48">
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Expiry Date</P></td>
                                        <td className="w-1/2"><P>{format("yyyy-MM-dd", Page2State.expiryDate)}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Enable Notifications</P></td>
                                        <td className="w-1/2"><P>{Page2State.enableNotifications ? "Yes" : "No"}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Asynchronous Mode</P></td>
                                        <td className="w-1/2"><P>{Page2State.asynchronousMode ? "Yes" : "No"}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Number of Copies</P></td>
                                        <td className="w-1/2"><P>{Page2State.numcopies}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Number of Samples</P></td>
                                        <td className="w-1/2"><P>{Page2State.numsamples}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Group By</P></td>
                                        <td className="w-1/2"><P>{Page2State.groupBy}</P></td>
                                    </tr>
                                    <tr className="hover:cursor-default w-full flex">
                                        <td className="w-1/2"><P>Comment</P></td>
                                        <td className="w-1/2"><P>{Page2State.freeComment}</P></td>
                                    </tr>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </RulePage>
            </div>
        </div>
    )
}