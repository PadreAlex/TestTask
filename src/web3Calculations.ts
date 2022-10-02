import { contractAbi } from "./ContractAbi";
import { deleteDB, getData, getOneDoc, modifyData, putDoc, removeAllElements, searchForValue } from './PouchDB'
import { IgetOrderInfo, Address, IFunctionArgumentsGetOrder, IFunctionArgumentsMatch, responseFromBlockchainOrderCreated, responseFromBlockchainOrderCanceled, responseFromBlockchainOrderMatch, IpouchModifyHandlerStruct } from "./interfaces";
import { Contract } from "web3-eth-contract"
const Web3 = require('web3')
require('dotenv').config()

const RPC: string = `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`
const RPCWS: string = `wss://rinkeby.infura.io/ws/v3/${process.env.INFURA_KEY}`

// const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const web3ws = new Web3(new Web3.providers.WebsocketProvider(RPCWS));

const ContractAddr: string = "0xC7dd7d4730d95AAE47F27c32eBb85b04fc78769E";

const ContractInstance: Contract = new web3ws.eth.Contract(
    contractAbi,
    ContractAddr,
);

const emptyOrderInfo = {
    id: "",
    amountA: "",
    amountB: "",
    amountLeftToFill: "",
    fees: "",
    tokenA: "",
    tokenB: "",
    user: "",
    isCancelled: false
}

//Данная функция нужна для получения данных из контракта - метода getOrderIdLength
const getOrderIdLength = async (): Promise<string> => {
    try {
        var getSomeInfo: Promise<string> = await ContractInstance.methods.getOrderIdLength().call()
        return getSomeInfo
    } catch (error) {
        console.log(error)
        return "err"
    }
}

//Данная функция нужна для получения данных из контракта - метод getOrderId
const getOrderId = async (lengthId: number): Promise<string> => {
    try {
        var getSomeInfo: Promise<string> = await ContractInstance.methods.getOrderId(lengthId).call()
        return getSomeInfo
    } catch (error) {
        console.log(error)
        return "err"
    }
}

//Данная функция нужна для получения данных из контрака - метод getOrderInfo
const getOrderInfo = async (orderId: string): Promise<IgetOrderInfo> => {
    try {
        var getSomeInfo: IgetOrderInfo = await ContractInstance.methods.getOrderInfo(orderId).call()
        
        var orderInfo: IgetOrderInfo = {
            id: getSomeInfo[0],
            amountA: getSomeInfo[1],
            amountB: getSomeInfo[2],
            amountLeftToFill: getSomeInfo[3],
            fees: getSomeInfo[4],
            tokenA: getSomeInfo[5],
            tokenB: getSomeInfo[6],
            user: getSomeInfo[7],
            isCancelled: getSomeInfo[8]
        }
        console.log(getSomeInfo)
        return orderInfo
    } catch (error) {
        console.log(error)
        return emptyOrderInfo
    }

}

//Данная функция нужна для получения всех имеющихся ордеров и записи их в базу данных
const getAllDataOnStart = async (): Promise<void> => {
    try {
        var promisesArr1: Promise<string>[] = []

        const orderIdLength: string = await getOrderIdLength()

        for (let i = 0; i < parseInt(orderIdLength); i++) {
            const res: Promise<string> = getOrderId(i)
            promisesArr1.push(res)
        }
        const p: string[] = await Promise.all(promisesArr1)

        var promisesArr2: Promise<IgetOrderInfo>[] = []
        for (let j = 0; j < p.length; j++) {
            const res: Promise<IgetOrderInfo> = getOrderInfo(p[j])
            promisesArr2.push(res)
        }
        const p2: IgetOrderInfo[] = await Promise.all(promisesArr2)

        setDocsInDataBase(p2)

    } catch (error) {
        console.log(error)
    }
}
//Данная функция нужна для удаления информации из базы данных и записи туда новой
const syncDataFromBlockchain = async (): Promise<void> => {
    try {
        removeAllElements()
        await getAllDataOnStart()
    } catch (error) {
        console.log(error)
    }
}

//Данная функция нужна для провеки того что вызвать при старте сервера
const onServerStart = async (): Promise<void> => {
    try {

        console.log("Setting the server")

        const totalRows: IgetOrderInfo[] = await getData()
        console.log("Getting data from blockchain. Please wait")

        if (totalRows.length > 0) {
            await syncDataFromBlockchain()
            console.log("All is done")
        } else {
            await getAllDataOnStart()
            console.log("All is done")
        }
    } catch (error) {
        console.log(error)
    }
}

//Данная функция нужна для записи данных в базу данных
const setDocsInDataBase = async (dataArr: IgetOrderInfo[]): Promise<void> => {
    try {
        for (let i = 0; i < dataArr.length; i++) {
            await putDoc(dataArr[i])
        }
    } catch (error) {
        console.log(error)
    }
}

//Данная функция нужна для получения данных по запросу GetOrders
export const getOrdersFullData = (dataArr: IgetOrderInfo[], args: IFunctionArgumentsGetOrder): IgetOrderInfo[] => {
    try {
        if (!args.tokenA && !args.tokenB && !args.user && !args.active) return dataArr.filter((el: IgetOrderInfo) => el.isCancelled === false)

        if (args.tokenA) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => el.tokenA === args.tokenA)
        }

        if (args.tokenB) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => el.tokenB === args.tokenB)
        }

        if (args.user) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => el.user === args.user)
        }

        if (args.active) {
            const curData = args.active === "true" ? false : true
            dataArr = dataArr.filter((el: IgetOrderInfo) => el.isCancelled === curData)
        }

        return dataArr
    } catch (error) {
        console.log(error)
        return [emptyOrderInfo]
    }
}

//Данная функция нужна для получения данных по запросу MatchOrders
export const returnMatchData = (dataArr: IgetOrderInfo[], args: IFunctionArgumentsMatch): string[] => {
    try {
        if (args.tokenA) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.tokenA) === parseInt(args.tokenB))
        }

        if (args.tokenB) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.tokenB) === parseInt(args.tokenA))
        }
        // в данной функции я не совсем понимаю
        if (args.amountA) {
            if(args.amountA == "0" && args.amountB) {
                dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.amountA) >= parseInt(args.amountB))
            } else {
                dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.amountA) >= parseInt(args.amountA))
            }
        }

        if (args.amountB) {
            dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.amountB) >= parseInt(args.amountB))
        }

        if(args.amountA && args.amountB) {
            // amountA * matchedOrderAmountA <= amountB * matchedOrderAmountB 
            //Данная функция была взята из смартконтракта
            dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.amountA) * parseInt(args.amountA) <= parseInt(args.amountB) * parseInt(el.amountB))
        }

        dataArr = dataArr.filter((el: IgetOrderInfo) => parseInt(el.amountLeftToFill) > 0)
        dataArr = dataArr.filter((el: IgetOrderInfo) => el.isCancelled === false)
        var returnArray: string[] = []
        dataArr.forEach((el: IgetOrderInfo) => {
            returnArray.push(el.id)
        })
        return returnArray
    } catch (error) {
        console.log(error)
        return []
    }
}

//Данная функция нужна для прослушивания ивентов в блокчейн
export const wsSubscriptionToEvents = async (): Promise<void> => {
    try {
        ContractInstance.events.OrderCancelled()
            .on('data', async (event: responseFromBlockchainOrderCanceled) => {
                await orderCanceledHandler(event.returnValues.id)
            })
            .on('changed', changed => {
                console.log(changed)
            })
            .on('error', (err: Error) => {
                throw err
            })
            .on('connected', (str: string) => {
                console.log(str)
            })

            ContractInstance.events.OrderCreated()
            .on('data', async (event: responseFromBlockchainOrderCreated) => {
                await orderCreatedHandler(event)
            })
            .on('changed', changed => {
                console.log(changed)
            })
            .on('error', (err: Error) => {
                throw err
            })
            .on('connected', (str: string) => {
                console.log(str)
            })

            ContractInstance.events.OrderMatched()
            .on('data', async (event: responseFromBlockchainOrderMatch) => {
                await orderMatchedHandler(event)
            })
            .on('changed', changed => {
                console.log(changed)
            })
            .on('error', (err: Error) => {
                throw err
            })
            .on('connected', (str: string) => {
                console.log(str)
            })
    } catch (error) {
        console.log(error)
    }
}

//Данная функция нужна для обработки ивента CancelOrder
const orderCanceledHandler = async (id: string): Promise<void> => {
    const idOfTransaction: string = await searchForValue(id)
    const fullData: IpouchModifyHandlerStruct = await getOneDoc(idOfTransaction.toString())

    var newDataHandler: IgetOrderInfo = fullData.data
    newDataHandler.isCancelled = true

    modifyData(idOfTransaction.toString(), newDataHandler)
}

//Данная функция нужна для обработки ивента CreateOrder
const orderCreatedHandler = async (dataFromListener: responseFromBlockchainOrderCreated) => {
    const newOrder: IgetOrderInfo = await getOrderInfo(dataFromListener.returnValues.id)
    await putDoc(newOrder)
}

//Данная функция нужна для обработки ивента MatchOrders
const orderMatchedHandler = async (dataFromListener: responseFromBlockchainOrderMatch) => {
    const idOfTransaction: string = await searchForValue(dataFromListener.returnValues.id)
    const fullData: IpouchModifyHandlerStruct = await getOneDoc(idOfTransaction.toString())

    var newDataHandler: IgetOrderInfo = fullData.data
    newDataHandler.amountLeftToFill = dataFromListener.returnValues.amountLeftToFill

    //Здесь я не уверен что правильно понял то как должна работать эта часть
    newDataHandler.amountA = (parseInt(newDataHandler.amountA) - parseInt(dataFromListener.returnValues.amountPaid)).toString()
    newDataHandler.amountB = (parseInt(newDataHandler.amountB) - parseInt(dataFromListener.returnValues.amountReceived)).toString()

    modifyData(idOfTransaction.toString(), newDataHandler)
}
//Данная функция запускает прослушиватьль в блокчейне который следит за исполнением ивентов
wsSubscriptionToEvents()

// Если не хотите получить ограничения в INFURA 
//советую отключить данную функцию после первого запуска 
//если планируете много перезапускать сервер

onServerStart()
