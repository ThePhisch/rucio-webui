'use client';
import { ListDID as ListDIDStory } from "@/component-library/components/Pages/ListDID/ListDID";
import { DIDMeta, DIDType } from "@/lib/core/entity/rucio";
import { DIDLong } from "@/lib/core/entity/rucio"
import { DIDName } from '@/lib/infrastructure/data/view-model/create-rule'
import useComDOM from "@/lib/infrastructure/hooks/useComDOM";
import { HTTPRequest } from "@/lib/common/http";
import { useEffect, useState } from "react";
import { createDIDMeta } from "test/fixtures/table-fixtures";


export default function ListDID() {

    const [didMetaQueryResponse, setDIDMetaQueryResponse] = useState<DIDMeta>({} as DIDMeta)
    const didMetaQuery = (did: DIDName) => { setDIDMetaQueryResponse(createDIDMeta()) }

    const DIDSearchComDOM = useComDOM<DIDLong>(
        'list-did-query',
        [],
        false,
        Infinity,
        200,
        true
    )
    useEffect(() => {
        setDIDMetaQueryResponse(createDIDMeta())
    }, [])
    useEffect(() => {
        const setRequest = async () => {
            const request: HTTPRequest = {
                url: new URL('http://localhost:3000/api/dids'),
                method: 'POST',
                headers: new Headers({
                    'Content-Type': 'application/json',
                } as HeadersInit),
                body: {
                    "query": "test:*",
                    "type": DIDType.DATASET
                },
            }
            await DIDSearchComDOM.setRequest(request)
        }
        setRequest()
    }, [])
    return (
        <ListDIDStory
            comdom={DIDSearchComDOM}
            didMetaQuery={didMetaQuery}  // TODO: implement
            didMetaQueryResponse={didMetaQueryResponse}  // TODO: implement
        />
    )
}