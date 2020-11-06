import express from "express";
import mongoose from "mongoose";
import Pusher from "pusher";
import cors from "cors";
import mongo from "mongodb";
import CircularJSON from "circular-json";

var rnum=0;




//app config
const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT || 9001;
const pusher = new Pusher({
  appId: "1098690",
  key: "2b3fc78162290240f28f",
  secret: "0a9201bb6740d8153056",
  cluster: "ap2",
  useTLS: true
});
// middleware


// DB config
const connection_url =
  `mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/realtimedata?retryWrites=true&w=majority`;
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// pusher
const db1 = mongoose.connection;

db1.once("open", () => {
  console.log("DB connected");

  const msgCollection = db1.collection("messages");
  
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    console.log("A change occured", change);

    if (change.operationType === "insert") {
      const messageDetails = change.fullDocument;
      pusher.trigger("message", "inserted", {
        room: messageDetails.room,
        name: messageDetails.name,
        message: messageDetails.message,
        timestamp: messageDetails.timestamp,
       
      });
      
    } 
    
    else {
      console.log("Error triggering Pusher");
    }
  });
});

// api routes
app.get("/", (req, res) => res.status(200).send("hello world"));




//send_to_realtimedata
app.post("/messages/sendtorealtimedata", (req, res) => {
  var room = req.body.room;
  var name = req.body.name;
  var message = req.body.message;
  var timestamp = req.body.timestamp;
  

  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/realtimedata?retryWrites=true&w=majority", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  dbo1.collection("messages").insertOne( { 
        room:room,
        name: name,
        message: message,
        timestamp:timestamp
       
   } );
  
   res.send({mes:"ok"});
});




//to get no of rooms of user
app.post("/messages/noofroomsofuser", (req, res) => {
 
  var name = req.body.name;
  console.log(name);
  var dbw=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    

var docs=dbw.collection(name).countDocuments({} );
 
docs.then((doc)=>
{console.log(doc);
  if(doc==0)
  {
    var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbo1.createCollection(name);

  }
res.status(201).send({mes:doc});}
);
  
  
 
});
//to get all rooms of user
app.post("/messages/getallroomsofuser", (req, res) => {
 
  var name = req.body.name;
  console.log(name);
  var arr=new Array();
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
 
  
dbo1.collection(name).find().then((ar)=>
{
 var rp=ar.toArray();


 rp.then((rps)=>
 {
 var rarr=[];
for(var i=0;i<rps.length;i++)
{
rarr.push(rps[i].room);
if(i==rps.length-1)
res.send({mes:rarr});

}

 });

 
});



});



//to get first room of the user
app.post("/messages/firstroomofuser", (req, res) => {
 
  var name = req.body.name;
  console.log(name);
 
  

  

  var arr=new Array();
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
 
  
dbo1.collection(name).find().then((ar)=>
{
 var rp=ar.toArray();


 rp.then((rps)=>
 {
 
for(var i=0;i<rps.length;i++)
{

if(i==0)
res.send({mes:rps[i].room});

}

 });

 
});



});


//to get all messages of room
app.post("/messages/getallmessagesoftheroom", (req, res) => {
 
  var name = req.body.name;
  var room = req.body.room;
  console.log(name);
  console.log(room);
  
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
dbo1.collection(name).find({"room":room}).then((okk)=>
{
  var y=0;
  okk.forEach((ok)=>
  
  {
    if(y==0)
    {res.send({mes:ok.mess});console.log(ok.mess);}
    y++;
  })
});

});

//to send message to room of user
app.post("/messages/sendmessagetouserroom", (req, res) => {
 
  var room = req.body.room;
  var name = req.body.name;
  var message = req.body.message;
  var timestamp = req.body.timestamp;
  
 
  
  
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
dbo1.collection(name).updateOne({room:room},
  {$push:{mess:{name:name,room:room,message:message,timestamp:timestamp,received:false}}});
  res.send({mes:1});
});

//to send message to room of friends
app.post("/messages/sendmessagetofriendroom", (req, res) => {
 
  var room = req.body.room;
  var name = req.body.name;
  var message = req.body.message;
  var timestamp = req.body.timestamp;



  var dboo=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/rooms?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
 
  dboo.collection(room).find().then((docs)=>
  {
    docs.forEach((doc)=>
    {
      if(doc.friends!=name)
      {
        
        var dbw=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    dbw.collection(doc.friends).updateOne({room:room},
      {$push:{mess:{name:name,room:room,message:message,timestamp:timestamp,received:true}}});

      }
    })

  });

  res.send({mes:1});

    });




    //to craete room
app.post("/messages/createroom", (req, res) => {
  var room = req.body.room;
  var name = req.body.name;
  
  var MongoClient=mongo.MongoClient;
  var flag=0;
 
  var url = "mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/rooms?retryWrites=true&w=majority";
  const client = new MongoClient(url, {
   
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }); // { useUnifiedTopology: true } removes connection warnings;
  

  
  client
        .connect()
        .then(
          client =>
            client
              .db("rooms")
              .listCollections()
              .toArray() // Returns a promise that will resolve to the list of the collections
        )
        .then(cols => cols.forEach((col)=>
        {
if(col.name==room)
flag=1;
  

        }
        
        ))
        .finally(() =>
        {
          if(flag==0)
          {
          
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/rooms?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  dbo1.createCollection(room);
  dbo1.collection(room).insertOne( { 
       
    friends:name
    
} );


  var dbo2=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
 
  dbo2.collection(name).insertOne( { 
       
    room:room,

    mess:[]
} );
res.send({mes:1});
          }
          else{res.send({mes:0});}
                  client.close()

        }
        );

    });






    //to add to new room
app.post("/messages/addtonewroom", (req, res) => {
  var room = req.body.room;
  var name = req.body.name;
  
  var MongoClient=mongo.MongoClient;
  var flag=0;
 
  var url = "mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/rooms?retryWrites=true&w=majority";
  const client = new MongoClient(url, {
   
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }); // { useUnifiedTopology: true } removes connection warnings;
  

  
  client
        .connect()
        .then(
          client =>
            client
              .db("rooms")
              .listCollections()
              .toArray() // Returns a promise that will resolve to the list of the collections
        )
        .then(cols => cols.forEach((col)=>
        {
if(col.name==room)
flag=1;
  

        }
        
        ))
        .finally(() =>
        {
          if(flag==1)
          {
          
  var dbo1=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/rooms?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  dbo1.createCollection(room);
  dbo1.collection(room).insertOne( { 
       
    friends:name
    
} );


  var dbo2=mongoose.createConnection("mongodb+srv://admin:HFGSXiUTqRY29l9G@cluster0.59w0h.mongodb.net/users?retryWrites=true&w=majority", {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
 
  dbo2.collection(name).insertOne( { 
       
    room:room,

    mess:[]
} );
res.send({mes:1});
          }else{res.send({mes:0});}
                  client.close()

        }
        );

    });
  


// listen
app.listen(port, () => console.log(`Listening on localhost:${port}`));