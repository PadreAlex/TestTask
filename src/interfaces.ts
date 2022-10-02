export type Address = string

export interface IgetOrderInfo {
    id: string
    amountA: string
    amountB: string
    amountLeftToFill: string
    fees: string
    tokenA: Address
    tokenB: Address
    user: Address
    isCancelled: boolean
}

export interface IFunctionArgumentsGetOrder {
    tokenA: string | null;
    tokenB: string | null;
    user: string | null;
    active: string | boolean | null;
}

export interface IFunctionArgumentsMatch {
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
}

export interface IQueryGetOrders {
    tokenA: string;
    tokenB: string;
    user: string;
    active: boolean;
}

export interface IFunctionArguments {
    tokenA: string | undefined;
    tokenB: string | undefined;
    user: string | undefined;
    active: boolean | undefined;
}

export interface IQueryMatch {
    tokenA: string;
    tokenB: string;
    amountA: string;
    amountB: string;
}

export interface IpouchDocStruct {
    _id: string,
    data: IgetOrderInfo
}

export interface IpouchModifyHandlerStruct {
    _id: string,
    _res: string
    data: IgetOrderInfo
}

export interface IpouchResult {
    total_rows: number
    offset: number
    rows: IpouchResultInDepthArray[]
}

export interface IpouchResultInDepthArray {
    id: string
    key: string
    value: IRev
    doc: IDoc
}

export interface IRev {
    rev: string
}

export interface IDoc {
    data: IgetOrderInfo
    _id: string
    _rev: string
}


// blockchain listener 
export interface responseFromBlockchainOrderCreated {
    removed: boolean
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
    address: string
    id: string
    returnValues: ReturnValuesOrderCreated
    event: string
    signature: string
    raw: Raw
}

export interface ReturnValuesOrderCreated {
    "0": string
    "1": string
    "2": string
    "3": string
    "4": string
    "5": string
    "6": boolean
    id: string
    amountA: string
    amountB: string
    tokenA: string
    tokenB: string
    user: string
    isMarket: boolean
}

export interface responseFromBlockchainOrderCanceled {
    removed: boolean
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
    address: string
    id: string
    returnValues: ReturnValuesOrderCanceled
    event: string
    signature: string
    raw: Raw
}

export interface ReturnValuesOrderCanceled {
    "0": string
    id: string
}


export interface responseFromBlockchainOrderMatch {
    removed: boolean
    logIndex: number
    transactionIndex: number
    transactionHash: string
    blockHash: string
    blockNumber: number
    address: string
    id: string
    returnValues: ReturnValuesOrderMatch
    event: string
    signature: string
    raw: Raw
}

export interface ReturnValuesOrderMatch {
    "0": string
    "1": string
    "2": string
    "3": string
    "4": string
    "5": string
    "6": string
    id: string
    matchedId: string
    amountReceived: string
    amountPaid: string
    amountLeftToFill: string
    fee: string
    feeRate: string
}


export interface Raw {
    data: string
    topics: string[]
}