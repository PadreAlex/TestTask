var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-quick-search'));

export const db = new PouchDB('AllOrders')

import { IgetOrderInfo, IpouchDocStruct, IpouchResult, IpouchResultInDepthArray, IDoc, IpouchModifyHandlerStruct } from "./interfaces";

//Данная функция нужна для записи данных в базу данных
export async function putDoc(object: IgetOrderInfo): Promise<void> {
    const allRows = await db.allDocs({ include_docs: true })

    const doc: IpouchDocStruct  = {
        _id: allRows.total_rows.toString(),
        data: object
    }

    db.put(doc)
}


//Данная функция нужна для получения всех даных из базы данных
export function getData(): IgetOrderInfo[] {
    let allData: IgetOrderInfo[] = db.allDocs({
        include_docs: true,
        attachments: true
    }).then(function (result: IpouchResult) {
        return result.rows.map((row: IpouchResultInDepthArray) => row.doc.data);
    }).catch(function (err: Error) {
        console.log(err);
    });

    return allData
}

//Данная функция нужна для получения одного элемента базы данных
export function getOneDoc(docId: string): IpouchModifyHandlerStruct {
    return db.get(docId).then(function (doc: IDoc) {
        return doc.data
    })
}

//Данная функция нужна для получения индекса нужного нам эелемента
export async function searchForValue(lookUp: string): Promise<string> {
    var searchRes: any = await db.search({
        query: lookUp,
        fields: ['data.id', "data"],
        include_docs: true,
        highlighting: true
    });

    return searchRes.rows[0].id.toString()
}

//Данная функция нужна для изменения данных в базе данных
export function modifyData(docId: string, newData: IgetOrderInfo): void {
    db.get(docId).then(function (doc: IDoc) {
        doc.data = newData
        return db.put(doc);
    }).then(function () {
        return db.get(docId);
    })

}

//Данная функция нужна для удаления всех элементов из базы данных
export function removeAllElements(): void {
    db.allDocs().then(async function (result: any) {
        return Promise.all(result.rows.map(function (row: any) {
          return db.remove(row.id, row.value.rev);
        }));
      }).then(async function () {
        console.log('Database is cleared')
      }).catch(function (err: Error) {
        console.log(err)
      });
}

//Данная функция нужна для полного удаления базы данных. Лучше не вызывать
export function deleteDB(): void {
    db.destroy();
}