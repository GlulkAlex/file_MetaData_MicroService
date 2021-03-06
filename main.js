"use strict";
//*** config ***//
//const
var env = () => {
  try {

    return require('./.env.json');
  } catch(err) {
    console.warn("config file missing, so as actual connection info too");

    return {
      "TEST_MONGODB": {
        "value": false
      }
      ,"DEBUG_MODE": {
        "value": false
      }
    };
  }
}();

const is_Debug_Mode = (
  process.env.IS_DEBUG ||
  process.env.DEBUG_MODE ||
  env.DEBUG_MODE.value ||
  process.argv[2] ||
  //true
  false
);
const port_Number = (
  //process.argv[3] ||
  process.env.PORT ||
  //0
  8080 ||
  3000
);
const mongo_URI = (
  process.env.MONGO_URI ||
  //env.TEST_MONGODB.value ||
  process.argv[3] ||
  "mongodb://localhost:27017/data"
);
const mongoLab_URI = (
  // must be on `.env` file or
  // in heroku config
  // it is possible
  // to use the same config var
  // in both local and Heroku environments
  process.env.MONGOLAB_URI ||
  process.env.TEST_MONGODB ||
  env.TEST_MONGODB.value ||
  process.argv[3] ||
  "mongodb://localhost:27017/data_uri"
);
const collection_Name = (
  //"docs" // <- for tests only
  //"links"
  "image_search_results"
);
//*** config end ***//

//*** Node.js modules ***//
//*** core modules ***//
//const http = require('http');
const https = require('https');
//var getter = require('https');
//const fs = require('fs');
//const path = require('path');
const url = require('url');
const assert = require('assert');
//*** core modules end ***//

//*** npm modules ***//
const express = require('express');
var app = express();
// Router-level middleware works
// in the same way as application-level middleware, except
// it is bound to an instance of express.Router().
var router = express.Router();

//const mongo_Client = require('mongodb').MongoClient;
var multer  = require('multer');
//var upload = multer();
//>>> multer(opts)
//>>> `dest` | `storage` -> Where to store the files
/*
If you want more control over your uploads,
you'll want to
use the `storage` option instead of `dest`.
Multer ships with
storage engines:
`DiskStorage` and
`MemoryStorage`
*/
//>>> `limits` -> Limits of the uploaded data
//> An object specifying
//> the size limits of the optional properties.
//> `fileSize` -> For `multipart` forms,
//> the max file size (in bytes) -> default: Infinity
//> `fieldSize` -> Max field value size -> default:	1MB
//var upload = multer({ "dest": 'uploads/' });
//>>> MemoryStorage:
//> The memory storage engine
//> stores the files in memory as Buffer objects.
//> It doesn't have any options.
//> 1 Byte = 8 Bits
//> 1 KiB = 1024 Bytes
//> 1 MiB = 1024 KiB
var limits = {"fileSize": 1024 * 1024 * 3};
var storage = multer.memoryStorage();
//var upload_In_Mem = multer({ "storage": storage });
var upload_In_Mem = multer({ "storage": storage, "limits": limits });
var upload_Single = upload_In_Mem.single('upload_File');
var upload_Array = upload_In_Mem.array('upload_File', 1);
var parser = upload_In_Mem.fields([{ "name": 'upload_File', "maxCount": 1 }]);
//> When using memory storage,
//> the `file info` will contain
//> a `field` called `buffer`
//> that contains the entire file.
//>>> WARNING:
//> Uploading very large files, or
//> relatively small files in large numbers very quickly,
//> can cause
//> your application to run out of memory
//> when memory storage is used.
//*** npm modules end ***//

// for correct connection using .env
// use `heroku local` or `heroku open [<url.path>]`

//*** application modules ***//
//const html_Parser = require('./html_Parser.js');
const parse_Stream = require('./stream_Parser.js').parse_Stream;
//*** application modules end ***//

//*** Global vars ***//
// redundant here, has no practical use
const end_Points_List = [
  "/"
  ,"/new" // special entry point
  //,"/home",
  //,"/help",
  //,"/info"
];

var server;
var input_args_list = process.argv;
var node_ = input_args_list[0];
var self_file_path = input_args_list[1];
// fetch template instead
var index_Template_Content_List = [
  '<html>',
    '<head>',
      '<title>File Metadata Microservice API</title>',
      //'<link rel="icon" type="image/x-icon"',
      //'href="favicon.ico" />',
      //'<link rel="stylesheet" type="text/css" href="/main.css"/>',
      '<style>',
        'body {',
          'background-color: lightblue;',
        '}',
      '</style>',
    '</head>',
    '<body>',
      '<h1>API Basejump: File Metadata Microservice</h1>',
    '</body>',
  '</html>'
];
var index_Template_Content_Str = index_Template_Content_List.join("\n");
var getter = (
  app
  //http
  //https
);
var response_Body; 
var links_Count = 0;
var options = {};
//*** Global vars end ***//


//JSON.stringify(value[, replacer[, space]])
if (is_Debug_Mode) {
  console.log(
    "process.env:",
    JSON.stringify(
      process.env
      ,[
        'PORT',
        'IS_DEBUG',
        'DEBUG_MODE',
        'MONGO_URI',
        'MONGOLAB_URI',
        'TEST_MONGODB'
      ]
      // works as "pretty print"
      ,'\t'
    )
  );}

//var MongoClient = mongo;
if (is_Debug_Mode) {
  //mongo.define.name == 'MongoClient'
  /*
  if (mongo.hasOwnProperty("define")) {
    console.log("mongo.define.name:", mongo.define.name);
  } else {
    console.log("typeof mongo:", typeof(mongo));
  }
  */
}

if (input_args_list.length >= 3) {
  //first_Name = input_args_list[2].trim();
}

// %j work as JSON.stringify -> flatten object
//if (is_Debug_Mode) {console.log('MONGOLAB_URI is: %j', mongoLab_URI);}
if (is_Debug_Mode) {console.log('__dirname is:', __dirname);}

// best practice is
// to to turn off the header with the app.disable() method:
app.disable('x-powered-by');

app
  .route('/')
  .get(
    (req, res, next) => {
      /*
      res
        .send('Hello World!')
        .end()
      ;*/
      //res.end([data] [, encoding])

      ///res.render('index.html');
      //res.sendFile(path [, options] [, fn])
      var options = {
        root: __dirname// + '/public/'
        ,dotfiles: 'deny'
        ,headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
      };

      var fileName = __dirname + "/index.html";//req.params.name;
      /**/
      // async (? Promise ?)
      res
        // no need for app.use(express.static('/'));
        .sendFile(fileName
          ,null//options
          // If the callback function is specified and
          // an error occurs,
          // the callback function must
          // explicitly `handle` the response process
          // either by `ending` the request-response cycle, or
          // by passing control to the `next` route.
          ,(err) => {
            if (err) {
              if (is_Debug_Mode) {
                console.log(
                  ".sendFile(", fileName, ") error:", err);}
              res
                .status(err.status)
                // send headers
                .end()
              ;
              // after end() causes
              // Error: Can't set headers after they are sent.
              // for next routes
              //next();
            }
            else {
              if (is_Debug_Mode) {console.log('Sent:', fileName);}
              res
                // send headers
                .end();

              // use something one: .end() or next() -> not both simultaneously
              //next();
            }
          }
      )
      // TypeError: Cannot read property 'then' of undefined
      // ? so warper needed ?
      //.then(() => {if (is_Debug_Mode) {console.log(".sendFile() is \"thenable\"");}})
      //.catch((err) => {if (is_Debug_Mode) {console.log(".sendFile().catch(err):", err.message);}})
      ;/**/

      // if active fires / emits before .sendFile() is complete
      // and screw it in the process -> Error: Request aborted
      //next();
  }
);

// DONE make different POST routes for request handler
// DONE & for each of multer's parser methods -> single, array, fields
// DONE add limit to the uploaded file size, abort if bigger
// TODO create dedicated parser for request's form single file upload
//if (false) {
if (true) {
//> it works -> receives headers & file content
//> but how to
// TODO separate them in order to calculate right file size in bytes ?
app
  .post('/upload/custom_Parser'
    /*
    var parser = upload.fields([
      { name: 'empty', maxCount: 1 },
      { name: 'tiny0', maxCount: 1 }]);
    assert.equal(req.files['tiny0'][0].fieldname, 'tiny0')
    assert.equal(req.files['tiny0'][0].originalname, 'tiny0.dat')
    assert.equal(req.files['tiny0'][0].size, 122)
    assert.equal(req.files['tiny0'][0].buffer.length, 122)
    */
    //,upload.array()
    ,(req
    ,res
    ,next) => {
      ///>>> data accumulator <<<///
      //> for big data it must be Buffer or Array
      //var extracted_Content;
      var content_Str = "";
      //req.get("boundary");// | req.header("boundary")
      // from
      //{ 'content-type': 'multipart/form-data; boundary="file_Content_Boundary"', ... }
      var boundary_Key = req.get("content-type").split(';')[1];// -> "file_Content_Boundary";
      var parse_Stream_Results;// = {};
      var file_Content_Length = 0;

      if (is_Debug_Mode) {console.log(`.route(${req.route.path}) uploading file ...`);}
      if (is_Debug_Mode) {console.log(".route('/upload/custom_Parser').post(req.headers)", req.headers);}
      /*if (boundary_Key) {} else {
        boundary_Key = req.headers.boundary;//req.headers["boundary"];
      }*/
      //boundary_Key: undefined
      if (is_Debug_Mode) {console.log("boundary_Key:", boundary_Key);}
      //message.socket
      //socket.connect(options[, connectListener])
      req.socket
        .on("connect"
          ,() => {
            if (is_Debug_Mode) {console.log("req.socket \"connect\" event");}
          }
        )
      ;
      //socket.setEncoding()
      //readable.setEncoding('utf8');
      ///req.socket.setEncoding('utf8');
      req.setEncoding('utf8');
      /*
      This properly handles
      multi-byte characters
      that would otherwise be potentially mangled
      if you simply pulled the Buffers directly and
      called buf.toString(encoding) on them.
      If you want to read the data as strings,
      always use this method.
      */
      //readable.on('data', (chunk) => {
      //>>> switch to flowing mode <<<//
      req
        //.socket
        .on("data"
          ,(chunk) => {
            //> started from:
            /*
             --file_Content_Boundary
            Content-Disposition: form-data; name="upload_File"; filename="package.json"



            */
            //> TODO why started from ' ' & ended with 3 new line ?
            //> TODO does this chunk.includes("\r\n") ?
            if (is_Debug_Mode) {console.log("req.socket \"data\" event");}
            //if (is_Debug_Mode) {console.log("data chunk:", chunk);}
            if (is_Debug_Mode) {console.log("chunk.length:", chunk.length);}
            //content_Str += chunk;
            parse_Stream_Results = parse_Stream(chunk, parse_Stream_Results, boundary_Key, is_Debug_Mode);
            if (is_Debug_Mode) {console.log("parse_Stream_Results:\n", parse_Stream_Results);}
            //file_Content_Str += chunk;
            file_Content_Length += parse_Stream_Results.file_Length;
          }
        )
      ;
      req
        //.socket
        .on("end"
          ,(data) => {
            if (is_Debug_Mode) {console.log("req.socket \"end\" event");}
          }
        )
      ;
      req
        .socket
        .on("error"
          ,(err) => {
            if (is_Debug_Mode) {console.log("req.socket \"error\" event:", err.message);}
          }
        )
      ;

      //>>> switch to flowing mode <<<//
      //req.resume();
      req
        .once("end"
          //,(data) => {
          ,() => {
            var json_Obj = {};
            //req.once("end",(data) undefined
            //if (is_Debug_Mode) {console.log("req.once(\"end\",(data)", data);}
            /*
            req.body
            Contains key-value pairs of data
            submitted in the request body.
            By default, it is undefined, and
            is populated when
            you use body-parsing middleware
            such as body-parser and multer.
            */
            // req.get(field) Aliased as req.header(field)
            //req.body undefined
            //if (is_Debug_Mode) {console.log("req.body", req.body);}
            //res.json(req.files);
            //res.json(content_Str);
            json_Obj = {"file_Size": file_Content_Length};
            res.json(json_Obj);
            res.end();
        })
      ;
      //console.log(req.body);
      //res.json(req.body);
  })
;
}

if (false) {
app
  .route('/upload')
  //>>> app.post(path, callback [, callback ...])
  .post(//'/upload'
    (req, res, next) => {
      // 'content-type': 'application/x-www-form-urlencoded'
      if (is_Debug_Mode) {console.log(".route('/upload').post(req.headers)", req.headers);}
      req.resume();
      //request.end([data][, encoding][, callback])
      req
        .once("end"
          ,(data) => {
            if (is_Debug_Mode) {console.log("req.once(\"end\",(data)", data);}
            if (is_Debug_Mode) {console.log("req.body", req.body);}
        })
      ;

      res.set('Content-Type', 'text/html');
      //res.send("POST request to \"upload\" route");
      res.send("POST request to \"upload\" route");
      res.end();
    }
  )
;
}

if (true) {
//if (false) {
app
  .route('/upload/single_File')
  //>>> app.post(path, callback [, callback ...])
  .post(//'/upload'
    //upload.single('upload_File')
    // TODO dedicated error handler missing
    upload_Single
    ,(req, res, next) => {
      //>>> POST -> upload file from client <<<//
      var json_Obj = {};

      if (is_Debug_Mode) {console.log(`.route(${req.route.path}) uploading file ...`);}
      //upload(req
      //>>> .single(fieldname)
      //>>> Accept a single file
      //>>> with the name `field_Name`.
      //>>> The single `file` will be stored in 'req.file'.

      // Everything went fine
      //>>>
      // 'req.file' is the `upload_File` file
      // 'req.body' will hold the text fields, if there were any
      //>>> File information:
      // `fieldname` -> Field name specified in the form
      // `originalname` -> Name of the file on the user's computer
      // `size` -> Size of the file in bytes
      // `buffer` -> A Buffer of the entire file (in/for) MemoryStorage
      /*
      assert.equal(req.file.fieldname, 'small0')
      assert.equal(req.file.originalname, 'small0.dat')
      assert.equal(req.file.size, 1778)
      assert.equal(req.file.buffer.length, 1778)
      */
      //TypeError: Cannot read property 'fieldname' of undefined
      //if (is_Debug_Mode) {console.log("req.file.fieldname:", req.file.fieldname);}
      //if (is_Debug_Mode) {console.log("req.file.originalname:", req.file.originalname);}
      //if (is_Debug_Mode) {console.log("req.file.size:", req.file.size);}
      //if (is_Debug_Mode) {console.log("uploaded file size is:", req.file.buffer.length);}
      //if (is_Debug_Mode) {console.log("req.buffer.length:", req.buffer.length);}
      if (req.file) {
        json_Obj = {"file_Size": req.file.size};
      }
      //json_Obj = {"file_Size": req.buffer};
      //json_Obj = {"file_Size": req.body};
      res
        .status(200)
        .jsonp(json_Obj);


      return json_Obj.file_Size;
    }
  )
;
}

if (true) {
//if (false) {
app
  .route('/upload/array')
  //>>> app.post(path, callback [, callback ...])
  .post(//'/upload'
    (req, res, next) => {
      //>>> POST -> upload file from client <<<//
      //if (is_Debug_Mode) {console.log(".route('/upload') uploading file ...");}
      if (is_Debug_Mode) {console.log(`.route(${req.route.path}) uploading file ...`);}
      //upload(req
      //>>> .single(fieldname)
      //>>> Accept a single file
      //>>> with the name `field_Name`.
      //>>> The single `file` will be stored in 'req.file'.
      //upload
        //.single('upload_File')
        //TypeError: upload.single(...).then is not a function
        //.then((req

      // async block //
      upload_Array(req
        ,res
        ,(err) => {
          var json_Obj = {};

          if (err) {
            // An error occurred when uploading
            // Unexpected field
            json_Obj = {
              "error": err.code
              ,"status": "not OK"
              ,"message": "error for post " + req.route.path + ": " + err.message
            };
            res
              // 404 Not Found
              // 405 Method Not Allowed
              // 500 Internal Server Error
              .status(405)
              .jsonp(json_Obj);


            return err;
          } else {
            // Everything went fine
            if (is_Debug_Mode) {console.log("req.body:", req.body);}
            if (req.files) {
              // req.files.hasOwnProperty("0")
              if (Array.isArray(req.files)) {
                if (req.files.length > 0) {
                  json_Obj = {"file_Size": req.files[0].size};
                }
              }
              //json_Obj = {"file_Size": req.files};
            }
            res
              .status(200)
              .jsonp(json_Obj);


            return req.files;
          }
        })
      ;
      // async block end //
    }
  )
;
}

if (true) {
//if (false) {
app
  //.route('/upload')
  .route('/upload/fields')
  .post(//'/upload'
    (req, res, next) => {
      //>>> POST -> upload file from client <<<//
      // async block //
      //if (is_Debug_Mode) {console.log(".route('/upload') uploading file ...");}
      if (is_Debug_Mode) {console.log(`.route(${req.route.path}) uploading file ...`);}
      if (is_Debug_Mode) {console.log(".route('/upload').post(req.headers):", req.headers);}
      //req.get("boundary") | req.header("boundary")
      ///if (is_Debug_Mode) {console.log("req.get('boundary'):", req.get("boundary"));}
      if (is_Debug_Mode) {console.log("req.get('content-type'):", req.get("content-type"));}
      if (is_Debug_Mode) {console.log("boundary:", req.get("content-type").split(';')[1]);}
      ///if (is_Debug_Mode) {console.log("req.header('boundary'):", req.header("boundary"));}
      if (is_Debug_Mode) {console.log("req.header('content-type'):", req.header("content-type"));}
      parser(req
        ,res
        ,(err) => {
          var json_Obj = {};

          if (err) {
            // An error occurred when uploading
            json_Obj = {
              "error": err.code
              ,"status": "not OK"
              ,"message": "error for post " + req.route.path + ": " + err.message
            };
            res
              // 404 Not Found
              // 405 Method Not Allowed
              // 500 Internal Server Error
              .status(405)
              .jsonp(json_Obj);


            return err;
          } else {
            // Everything went fine
            if (req.files) {
              json_Obj = {"file_Size": req.files['upload_File'][0].size};
            }
            res
              .status(200)
              .jsonp(json_Obj);


            return req.files;
          }
        })
      ;
  })
;
}


options = {
  dotfiles: 'ignore'
  // Enable or disable etag generation
  ,etag: false//Default: true
  ,extensions: ['htm', 'html']
  // Let client errors fall-through as unhandled requests,
  // otherwise forward a client error.
  //,fallthrough: true
  ,index: false
  ,maxAge: '1d'
  ,redirect: false
  ,setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now());
  }
};

// ? so, Middleware work as defaults
// when specific handlers not defined explicitly ?
// Middleware functions are executed sequentially, therefore
//***>>>!!! the order of middleware inclusion is important. !!!<<<***//

// you need to add a middleware function
// at the very bottom of the stack (below all other functions)
// to handle a 404 response
app
  // a middleware function with no mount path.
  // The function is executed every time
  // the app receives a request.
  .use((req, res, next) => {
    var json_Obj = {
      "error": true//'message'
      ,"status": 404
      ,"message": "Custom 404 page. Sorry cant find that!"
    };

    if (is_Debug_Mode) {console.log('Time:', Date.now());}
    // GET 'http://www.example.com/admin/new'
    // '/admin/new'
    if (is_Debug_Mode) {console.log('Request URL(originalUrl):', req.originalUrl);}
    if (is_Debug_Mode) {console.log("req.baseUrl:", req.baseUrl);} // '/admin'
    if (is_Debug_Mode) {console.log("req.path:", req.path);} // '/new'
    if (is_Debug_Mode) {console.log("req.method", req.method);}
    if (is_Debug_Mode) {console.log("req.params:", req.params);}

    //res.send('Welcome');
    //res.render('special');
    //res.render('index');
    res
      .status(404)
      .jsonp(json_Obj)
      //.send("Custom 404 page. Sorry cant find that!")
      .end()
    ;

    //next();
  }
);
/**/
// define error-handling middleware in the same way as other middleware, except
// with four arguments instead of three;
// specifically with the signature (err, req, res, next):
app
  .use((err, req, res, next) => {
    // expected error -> Error: File too large
    if (is_Debug_Mode) {console.error("app.use((err)=>", err.message);}
    if (is_Debug_Mode) {console.error(err.stack);}
    var json_Obj = {};

    //> 413 Request Entity Too Large
    if (err.message == "File too large") {
      json_Obj = {
        "error": err.message
        ,"status": 413
        ,"message": "Request Entity Too Large"
      };

      res
        .status(413)
        //.send("Custom 500 page. Something broke!")
        .jsonp(json_Obj)
        //.json(json_Obj)
        .end()
      ;
    } else {
      json_Obj = {
        "error": true//'message'
        ,"status": 500
        ,"message": "Custom 500 page. Something broke!"
      };

      res
        .status(500)
        //.send("Custom 500 page. Something broke!")
        .jsonp(json_Obj)
        //.json(json_Obj)
        .end()
      ;
    }
    //next();
  }
);
/*##########################################################################*/
/* unit test */
// Start a UNIX socket server 
// listening for connections on the given path.
//http_Server
//app.listen(port, [hostname], [backlog], [callback])
server = app
  .listen(
    port_Number,
    () => {
      var address = server.address();
      var port = server.address().port;
    
      if (is_Debug_Mode) { console.log(
        //"server listening ... address: {", address, "}, port: {", port, "}");}
        "server listening ...", address);}
      //console.log('http_Server listening on port ' + port + '...');
    }
);

// provide both HTTP and HTTPS versions of 'app' with the same code base
//http.createServer(app).listen(80);
//https.createServer(options, app).listen(443);
server
  .on('error',
    (err) => {

      if (err.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');

        setTimeout(
          () => {
            server.close();
            server
            .listen(
              //PORT,
              //HOST
              //path.join(process.cwd()),
              function () {

                var port = server.address().port;

                console.log("App now running on port:", port);
                console
                .log('express_Server listening on port ' + port + '...');
              }
            );
          },
          1000
        );
      }
    }
);