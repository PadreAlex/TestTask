import fastify from 'fastify';
import {
  getOrdersFullData, returnMatchData
} from './web3Calculations';
const server = fastify();
require('dotenv').config()

import { db, getData } from './PouchDB';
import {IQueryGetOrders, IFunctionArgumentsGetOrder, IQueryMatch, IFunctionArgumentsMatch} from "./interfaces"


server.listen({ port: parseInt(process.env.PORT ? process.env.PORT : "8080"), host: process.env.HOST}, async (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});



server.get<{ Querystring: IQueryGetOrders }>(
  '/getOrders',
  async (request, reply) => {
    const { tokenA, tokenB, user, active } = request.query;
    const args: IFunctionArgumentsGetOrder = { tokenA, tokenB, user, active }

    const arrData = await getData()

    try {
      const res = await getOrdersFullData(arrData, args)
      reply.header('Access-Control-Allow-Origin', '*').send({
        response: 'Ok',
        data: {
          dataFull: res,
        },
      });
    } catch (error) {
      reply.header('Access-Control-Allow-Origin', '*').send({
        response: 'Error',
        data: {
          ERROR: error,
        },
      });
    }
  },
);

server.get<{ Querystring: IQueryMatch }>(
  '/matchOrders',
  async (request, reply) => {
    const { tokenA, tokenB, amountA, amountB } = request.query;
    const args: IFunctionArgumentsMatch = { tokenA, tokenB, amountA, amountB };

    const arrData = await getData()
    // если ни одного поля не указано, Match не произойдет
    if (!tokenA && !tokenB && !amountA && !amountB) {
      try {
        reply.header('Access-Control-Allow-Origin', '*').send({
          response: 'Confused',
          data: {
            data: "Specify any field to execute search",
          },
        });
      } catch (error) {
        reply.header('Access-Control-Allow-Origin', '*').send({
          response: 'Error',
          data: {
            ERROR: error,
          },
        });
      }
    } else {
    try {
      const res = await returnMatchData(arrData, args);
      reply.header('Access-Control-Allow-Origin', '*').send({
        response: 'Ok',
        data: {
          allResultsWhere: {
            tokenA: tokenA,
            tokenB: tokenB,
            amountA: amountA,
            amountB: amountB
          },
          indexes: res
        },
      });
    } catch (error) {
      reply.header('Access-Control-Allow-Origin', '*').send({
        response: 'Error',
        data: {
          ERROR: error,
        },
      });
    }
  }
  },
);