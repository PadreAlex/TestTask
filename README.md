# TestTask
ВАЖНО!!!<br/>

Если вы собираетесь часто перезагружать сервер для тестов. Советую отключить функцию на 288 сточке в файле web3Calculations.ts - иначе при каждом запуске будет происходить вызов информации из блокчейна.<br/>

Необходимо создать .env файл и внести в него данные:<br/>

INFURA_KEY = ""<br/>
PORT = 8080<br/>
HOST = "127.0.0.1"<br/>

Запуск сервера происходит через <b>server.ts</b>. <br/> 
Я запускаю через [ts-node](https://github.com/TypeStrong/ts-node "Github TS-NODE")

[Postman API documentation](https://documenter.getpostman.com/view/23197292/2s83tGoBu7 "Postman")
