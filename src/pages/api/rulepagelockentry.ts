
import { NextApiRequest, NextApiResponse } from "next";
import StreamGatewayOutputPort from "@/lib/core/port/secondary/stream-gateway-output-port";
import appContainer from "@/lib/infrastructure/ioc/container-config";
import GATEWAYS from "@/lib/infrastructure/ioc/ioc-symbols-gateway";
import { PassThrough } from "node:stream";
import { HTTPRequest } from "@/lib/common/http";
import { Response } from "node-fetch";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const rulePageLockEntry = async (req: NextApiRequest, res: NextApiResponse) => {
    const streamingGateway = appContainer.get<StreamGatewayOutputPort>(GATEWAYS.STREAM)
    const url = 'http://localhost:8080/rulepagelockentry'
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/event-stream;charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Content-Encoding', 'none');
    const request: HTTPRequest = {
        method: 'GET',
        url: url,
        headers: {
            'Content-Type': 'application/x-json-stream',
        }
    }
    const responseStream: PassThrough | Response = await streamingGateway.getJSONChunks(request)
    if ( responseStream instanceof Response ) {
        res.status(responseStream.status).json( await responseStream.json() )
        return
    }
    responseStream?.on('data', async (chunk) => {
        res.write(chunk.toString() + '\n')
        await sleep(1000);
    })
    responseStream?.on('end', async () => {
        res.end()
    })
}

export default rulePageLockEntry;