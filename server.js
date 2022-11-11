import express  from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import dotenv from 'dotenv';
import * as fs from 'fs';

const app = express();
dotenv.config();

const http = new createServer(app);
const io = new Server(http);
const PORT = process.env.PORT || 3000

const messages = [];

const products = [{
    title:"Regla",
    price:123.45,
    thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
    id:1
},
{
    title:"Regla2",
    price:123.45,
    thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
    id:2
}]

const addProduct = (data) =>{
    try{
        const id = products.length;
        const obj = [data];
    
        obj.map((item,index)=> {
            item.id = id + (index + 1)
        });
    
        products.push(...obj)
    }
    catch(err){
        console.log(err)
    }
}

const addMessages = async (data) =>{
    try{
        await fs.promises.writeFile("./messages.txt",  JSON.stringify([...messages]))
    }
    catch(error){
        console.log(error)
    }
}

app.use(express.static('./public'));

app.get('/', (_req, res) => {
    res.sendFile('index', {root: __dirname});
})


http.listen(PORT, () => console.info(`Server up and running on port ${PORT}`));

io.on('connection', (socket) => {

    socket.emit('UPDATE_DATA', messages);
    socket.emit('PRODUCT', products);

    socket.on('NEW_MESSAGE_TO_SERVER', data => {
        messages.push(data)
        addMessages(data)
        io.sockets.emit('NEW_MESSAGE_FROM_SERVER', data);
    });

    socket.on('NEW_PRODUCT', data => {
        addProduct(data)
        io.sockets.emit('PRODUCT', products)
    });

})