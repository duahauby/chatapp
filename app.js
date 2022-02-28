var express = require('express');

var app = express();
const bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var http = require("http");
const server = http.createServer(app);
const cors = require('cors');

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function contract()
{
    const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

            // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

            // Check to see if we've already enrolled the user.
    const identity = await wallet.get('appUser');
    if (!identity) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

            // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

            // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

            // Get the contract from the network.
    const contract = network.getContract('fabcar');

    return contract;
}

const socketIo = require("socket.io")(server, {
   cors: {
       origin: "*",
   }
 });
//const socketIo = require("socket.io")(server);

async function queryNameUser(id){
    //query chaincode
    return("name_test");
}
 var time_queue = 0;
var users = [];
var online_account = [];

 socketIo.on("connection", (socket) => {
    console.log("New client connected ->" + socket.id);
    const ID = socket.id // id property on the socket Object
    socketIo.to(ID).emit("getId", socket.id);

    socket.on('connected', function(userID){
        users[userID]=socket.id;
        let flag_online=0;
        for(let i=0;i<online_account.length;i++)
        {
            if(online_account[i]['userID']==userID)
            {
                flag_online=1;
                online_account[i]['socketID']=socket.id;
            }
        }
        if(flag_online==0)
        {
            online_account.push({'userID':userID, 'socketID':socket.id});
        }
        
        console.log(online_account);
        socketIo.to(socket.id).emit('online_list', online_account);
        socketIo.emit('online_status', {'userID':userID, 'isOnline': true})
    })
  
    socket.on("sendRoom", function(data) {
      console.log(data);
      
      //socketIo.emit(receiver, { 'data': data, 'socket': socket.id });
    })
    socket.on("sendMess", async function(data){
        try
        {
            console.log(data);
            socketIo.to(users[data.receiver]).emit('incoming_mess',
                {
                    'sender': data.sender, 
                    'receiver': data.receiver, 
                    'message': data.message, 
                    'sender_name': data.sender_name,
                    'docType': 'private_message'
            });
            time_queue++; //console.log(time_queue);
            const contract_ = await contract();
            
            var genDate='MessPriv.' + data.sender+'.'+data.receiver+'.' + Date.now().toString();

            await contract_.submitTransaction('savePrivateMessage', genDate + time_queue.toString(),
                            data.sender, data.sender_name, data.receiver, data.message, parseInt(Date.now()));
            
                /*await contract_.submitTransaction('updateCommandHistory', 
                            data.sender.toString(), data.receiver.toString(), 'private_message');*/
            //save message to server then response to receiver
        }
        catch(error)
        {
            console.log(error);
        }
       
    })
  
    socket.on("disconnect", () => {
      console.log("Client disconnected:" + socket.id);
      for(let i=0;i<online_account.length;i++)
      {
          if(online_account[i]['socketID']==socket.id)
          {
            socketIo.emit('online_status', {'userID':online_account[i]['userID'], 'isOnline': false})
            online_account.splice(i,1);
          }
      }
      console.log(online_account);
    });
  });


app.set('view engine', 'ejs');
app.set('views', __dirname);
 
app.use(upload.array()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(__dirname + '/views'));

//code

app.get('/', function(req, res){
    res.render('./views/index', {'data':'Commander System'});
})
app.post('/login',async function(req, res){
    try{
        console.log(req.body);
        //var username = await queryNameUser(req.body.id);
        var _contract = await contract();
        const authen = await _contract.evaluateTransaction('authentication', req.body.id, req.body.pw);
        if(await authen.toString() != 'false')
        {
            res.send({'result': 'OK', 'username': authen.toString()});
        }
        else if(await authen.toString() == 'false')
        {
            res.send({'result': 'NG'});
        }
    }
    catch(error){
        console.log(error);
    }
    
})

var sample_chat_data = [
        {   
            userID: 'DVA',
            username: 'Do Van An',
            docType: 'private_message',
            message_block:
            [
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'hello',
                    'timestamp': 1,
                    'docType': 'private_message'
                },
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'bye',
                    'timestamp': 2,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'ahihi',
                    'timestamp': 3,
                    'docType': 'private_message'
                },
            ]
        },
        {
            
            userID: 'LTA',
            username: 'Le Thi Anh',
            docType: 'private_message',
            message_block:
            [
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'Ok em',
                    'timestamp': 1,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'Vang',
                    'timestamp': 2,
                    'docType': 'private_message'
                },
                {
                    'sender': 'DVA',
                    'receiver': 'LTA',
                    'content': 'Em xin cam on',
                    'timestamp': 3,
                    'docType': 'private_message'
                },
                {
                    'sender': 'LTA',
                    'receiver': 'DVA',
                    'content': 'Khong co gi',
                    'timestamp': 4,
                    'docType': 'private_message'
                }
            ]
        }
    ];

app.get('/chat', function(req, res){
    console.log(req.query.userID);
    res.render('./views/chat');
})

app.post('/load_chat_history', async function(req, res){
    try
    {
        const contract_ = await contract();
        /*
        const query_private_message = {
            "selector":{
                "$or":[
                    {"sender": 'DVA', "receiver": 'LTA'},
                    {"sender": 'LTA', "receiver": 'DVA'}
                ],
                "timestamp": {"$gt": null}
            },
            "sort":[{"timestamp":"desc"}],
            "limit": 100,
            "skip":0,
            "use_index": ["_design/indexPrivMessDoc", "indexPrivMess"]
        }
        const result_6 = await contract_.evaluateTransaction('queryCustom',JSON.stringify(query_private_message));
        console.log('custom query 4:', result_6.toString());*/
        //const chat_data = await contract_.evaluateTransaction('queryMessage', 'DVA', 'LTA', 'private_message', 100, 0);
        //console.log(chat_data.toString());
        const chat_history_raw = await contract_.evaluateTransaction('queryHistoryMessage', req.body.id); console.log(chat_history_raw);
        res.send(chat_history_raw.toString());
    }
    catch(error)
    {
        console.log(error);
    }
    
})

//for chat one to one from chat history
app.post('/chat_peer', async function(req, res){
    try
    {
        const contract_ = await contract();
        console.log({'partner_ID': req.body.partner_ID, 'my_ID': req.body.my_ID, 'limit': req.body.limit, 'skip': req.body.skip});
        const chat_data = await contract_.evaluateTransaction('queryMessage', req.body.my_ID, 
                            req.body.partner_ID, 'private_message', req.body.limit, req.body.skip);
        res.send(chat_data.toString());
    }
    catch(error)
    {
        console.log(error);
    }
})

//for chat room (dev in future)
app.post('/chat_room', function(req, res){
    console.log({'room_ID': req.body.room_ID, 'docType':req.body.type});
})

//for begin chat with one user from query
app.post('/init_new_chat', function(req, res){
    console.log( {'partner_ID': req.body.partner_ID, 'myID': req.body.myID});
})

//for user search result
app.get('/home', function(req, res){
    res.render('./views/home');
})

const sample_user_data_1 ={'userID': 001, 'username': 'Do Van An'};
//for user search
app.get('/searchUserByID', async function(req, res){
    try
    {
        console.log(req.query.id);
        const query_user={
            "selector":{"userID": req.query.id, "docType":"user"}
        };
        //neccessary to check if userID exist and response true/false
        const contract_ = await contract();
        const user = await contract_.evaluateTransaction('queryCustom', JSON.stringify(query_user));
        
        if(user) //only for test, change condition when finish develop chaincode
        {
            const user_json = JSON.parse(user.toString());
            const response_data = {
                'userID': user_json[0].Record.userID,
                'name': user_json[0].Record.name,
                'Phone': user_json[0].Record.Phone,
                'certification': user_json[0].Record.certification,
                'position': user_json[0].Record.position,
                'dept': user_json[0].Record.dept,
            }
            res.send(JSON.stringify({'data': response_data}));
        }
        else if(!user)
        {
            res.send(JSON.stringify({'data': 'no_data'}));
        }
    }
    catch(error)
    {
        console.log(error);
    }
    
})

app.get('/user_information', function(req, res){
    var user_id = req.query.id_user;
    var user_name = req.query.username;
    res.render('./views/profile',
    {
        'data':JSON.stringify(
            {
                'userID': user_id, 
                'name': user_name,
                'Phone': req.query.Phone,
                'dept': req.query.dept,
                'certification': req.query.certification,
                'position': req.query.position
            }
        )
    });
})

server.listen(8082, () => {
    console.log('Server đang chay tren cong 8082');
 });