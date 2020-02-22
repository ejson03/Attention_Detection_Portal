var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    users = [];

const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors')
const conString ='postgres://postgres:Prince@99@localhost/teach.ai'

/* ************************************************************************ */ 
/* *******************************MIDDLEWARE******************************* */
/* ************************************************************************ */ 

//specify the html we will use
app.use('/', express.static(__dirname + '/www'));
//bind the server to the 80 port
app.use(bodyParser.json());
app.use(cors())

/* ************************************************************************ */ 
/* ********************************ROUTES********************************** */
/* ************************************************************************ */ 

app.get('/api', (req , res)=>{
    res.send("<marquee><h1>This api is made by Princeton</h1><marquee>")
})

/* ********************************SEND DATA********************************** */

app.post('/api/sendData', async (req , res)=>{
    try{
        ARRAY_DATA = req.body
        
        if(ARRAY_DATA!==null)
        {
            var client = new Client({
                connectionString: conString,
            })
            try{
                await client.connect()
                console.log("Connected successfully.")
            
                var str = 'INSERT INTO maindata (happy,disgusted,angry,timestamp,personid,handraised,sleep,headgaze,output) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)'
                var values = [ ARRAY_DATA.happy,ARRAY_DATA.disgusted,
                                ARRAY_DATA.angry,ARRAY_DATA.timestamp,
                                ARRAY_DATA.personId,ARRAY_DATA.raisHand,
                                ARRAY_DATA.sleeping,ARRAY_DATA.headPose,
                                ARRAY_DATA.output]
                var rows = await client.query(str,values)
                console.log(rows.rowCount+" row inserted into the table maindata...........")
            }
            catch(ex)
            {
                console.log(`Something wrong happened ${ex}`)
            }
        }
        else
        {
            console.log("No Face was Detected")
        }
    }
    catch(ex)
    {
        console.log(`Something wrong happened ${ex}`)
    }
})


/* ********************************GET PERSON********************************** */

app.get('/api/getPerson/:id', async (req , res)=>{
    try{
        // console.log(req.body.data[0])
        ARRAY_DATA = req.params.id
        
        if(ARRAY_DATA!==null)
        {
            var client = new Client({
                connectionString: conString,
            })
            try{
                await client.connect()
                console.log("Connected successfully.")
            
                var str = 'SELECT base64image from persondata where personid=$1'
                var values = [ ARRAY_DATA ]
                var rows1 = await client.query(str,values)
                if(rows1.rows[0].base64image){
                    res.send(rows1.rows[0].base64image)
                }
                    
            }
            catch(ex)
            {
                console.log(`Something wrong happened ${ex}`)
            }
        }
        else
        {
            console.log("No Face was Detected")
        }
    }
    catch(ex)
    {
        console.log(`Something wrong happened ${ex}`)
    }
})

/* ********************************SAVE PERSON********************************** */

app.post('/api/savePerson', async (req , res)=>{
    try{
        // console.log(req.body.data[0])
        ARRAY_DATA = req.body
        console.log(ARRAY_DATA)
        if(ARRAY_DATA!==null)
        {
            var client = new Client({
                connectionString: conString,
            })
            try{
                await client.connect()
                console.log("Connected successfully.")
            
                var str = 'INSERT INTO persondata (personid,base64image) VALUES ($1,$2)'
                var values = [ ARRAY_DATA.personid,ARRAY_DATA.descriptor ]
                var rows = await client.query(str,values)
                console.log(rows.rowCount+" row inserted into the table persondata...........")
            }
            catch(ex)
            {
                console.log(`Something wrong happened ${ex}`)
            }
        }
        else
        {
            console.log("No Face was Detected")
        }
    }
    catch(ex)
    {
        console.log(`Something wrong happened ${ex}`)
    }
})

/* ********************************GET TIMESTAMPS FOR QUIZ********************************** */

app.get('/api/sendTime', async (req , res)=>{
    try{
        var minutes = req.body.minutes
        var seconds = req.body.seconds

        var totalSeconds = minutes*60 + seconds;

        if(totalSeconds<60){
            returningTime = 25;
        }
        else if(totalSeconds>60){
            returningTime = 60;
        }
        res.send(returningTime)

    }
    catch(ex)
    {
        console.log(`Something went wrong ${ex}`)
    }
});


//server.listen(3000);//for local test
server.listen(process.env.PORT || 3000, ()=> console.log("Node Server Running on port 3000"));//publish to heroku
//server.listen(process.env.OPENSHIFT_NODEJS_PORT || 3000);//publish to openshift
//handle the socket

io.sockets.on('connection', function(socket) {
    //new user login
    socket.on('login', function(nickname) {
        if (users.indexOf(nickname) > -1) {
            socket.emit('nickExisted');
        } else {
            //socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname, users.length, 'login');
        };
    });
    //user leaves
    socket.on('disconnect', function() {
        if (socket.nickname != null) {
            //users.splice(socket.userIndex, 1);
            users.splice(users.indexOf(socket.nickname), 1);
            socket.broadcast.emit('system', socket.nickname, users.length, 'logout');
        }
    });
    //new message get
    socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    //new image get
    socket.on('img', function(imgData, color) {
        socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });
});
