"use strict";
/*** config ***/
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
const mongoLab_URI = (
  // must be on `.env` file or
  // in heroku config
  // it is possible
  // to use the same config var
  // in both local and Heroku environments
  env.TEST_MONGODB.value ||
  process.env.TEST_MONGODB ||
  process.argv[3] ||
  "mongodb://localhost:27017/data_uri"
);
const is_Debug_Mode = (
  process.env.IS_DEBUG ||
  env.DEBUG_MODE.value ||
  process.argv[2]
  //true
  //false
);
//*** config end ***//

/*** Node.js modules ***/
// a core module
const assert = require('assert');

// npm module
//var
//const mongo_Client = require('mongodb').MongoClient;
/*** Node.js modules end ***/

//*** application modules ***//
//const db_Helpers = require('./db_Helpers.js');
//*** application modules end ***//

//*** helpers ***//
function helper(
  params//:int
) {// => list of obj
  "use strict";

  var result;
  var results = [];

  return results;
}

/*** helpers end ***/


/*** tests ***/
// TODO write at least one working test
var actual_Results;
var expected_Results;
// jshint esversion: 6, laxcomma: true
/* laxcomma: true */
var test_1_0 = function(description){
  "use strict";
  // curred
  return function(
    url//:str
    //,hostname//:str
    //,path//:str
    ,file_Name//:str
    ,expected_Result//:int
  ) {// => bool
    "use strict";
    console.log(description);

    var results = [];
    var result;
    /*
    req.protocol
    Contains the request protocol string:
    either http or
    (for TLS requests) https
    */
    const url_Parser = require('url');
    const fs = require('fs');
    var payLoad;//fs.createReadStream('file.txt');
    //readable.pipe(writable);
    //var request = require('request');
    //fs.createReadStream('file.json').pipe(request.put('http://mysite.com/obj.json'))
    var client = {};
    //url.parse(urlStr[, parseQueryString][, slashesDenoteHost])
    var url_Obj = url_Parser.parse(url);
    //var boundaryKey = Math.random().toString(16);
    var boundary_Key = "file_Content_Boundary";
    var options = {
      hostname: url_Obj.hostname//'www.google.com',
      //port: 80,
      ,path: url_Obj.pathname//'/upload',
      ,method: 'POST'
      ,headers: {
        'Content-Type': 'multipart/form-data' + '; boundary="' + boundary_Key + '"'
        //,'Content-Length': postData.length
      }
    };

    //>>> initializing <<<//
    if (
      //url.slice(0, 5) == 'https'
      url_Obj.protocol == 'https:'
    ) {
      client = require('https');
      //url = 'http' + url.slice(5);
    } else {//if (url.slice(0, 5) == 'http')
      client = require('http');
    }
    //>>> initializing end <<<//
    /*
    By default
    stream.end() is called on the `destination`
    when the `source` stream emits 'end',
    so that
    `destination` is no longer writable.
    Pass '{ end: false }' as `options` to
    keep the `destination` stream open.

    This keeps `writer` open
    so that
    "Goodbye" can be written at the end.
      reader.pipe(writer, { end: false });
      reader.on('end', () => {
        writer.end('Goodbye\n');
      });
    */
    /*request.write(
      '--' + boundary_Key + '\r\n'
      // "name" is the name of the form field
      // "filename" is the name of the original file
      + 'Content-Disposition: form-data; name="upload_File"; filename="' + file_Name + '"\r\n'
      // file's mime type, if known
      //+ 'Content-Type: application/octet-stream\r\n'
      //+ 'Content-Transfer-Encoding: binary\r\n\r\n'
      + '\r\n\r\n'
    );

    fs
      .createReadStream('./' + file_Name
        ,{ bufferSize: 4 * 1024 })
      .on('end'
        , () => {
          // mark the end of the only part
          // request.end() puts the `boundary` on a new line.
          request.end('\r\n--' + boundary_Key + '--');
        })
      .pipe(request, { end: false })
    ;
    */

    return Promise.resolve(
      //http.request(options[, callback])
      client
        .request(
          options,
          (response) => {

            var content_Type;

            console.log("Got response.statusCode:", response.statusCode);

            if (response.hasOwnProperty("getHeader")) {
              content_Type = response.getHeader('content-type');
            } else {
              content_Type = response.headers['content-type'];
            }

            console.log("content_Type:", content_Type);
            console.log("headers: ", response.headers);

            //readable
            //response.resume();
            // `explicitly` convert to `Strings`
            // rather than standard `Buffer` `objects`
            response.setEncoding('utf8');
            response
              .once(
                'data',
                (data) => {
                  // row data Buffer
                  console.log("data:", data);
                }
            );
            //response.end([data][, encoding][, callback])
            //response.body ? console.log("data:", data) : console.log("response.body:", response.body);
            //console.log("response.body:", response.body);

            // An alias of assert.ok()
            // Tests if value is truthy.
            // It is equivalent to -> assert.equal(!!value, true, message).
            assert(response.statusCode < expected_Result);
            //assert.equal(response.statusCode, expected_Result);
            //assert.deepEqual(results, expected_Results);

            //next();

            return content_Type;
          }
        )
        .on('error', (err) => {console.log("client.request error:", err.stack);}
      )
    );
  };
}("test 1.0: must return correct / expected 'file_Size' as response")
//>>> emulates:
//> curl -F "upload_File=@package.json;type=application/json" http://localhost:8080/upload/single_File
//> curl -F "upload_File=@package.json;type=application/json" https://api-file-metadata-microservice.herokuapp.com
("http://localhost:8080/upload/single_File", "package.json", 475)
//(null, "localhost", "/upload/single_File", "package.json", 475)
//("https://api-file-metadata-microservice.herokuapp.com/upload/single_File", "package.json", 475)
;

//}("test 1.1: must return error message if uploaded 'file_Size' exceeds the limit")
/*** tests end ***/

//***#####################################################################***//
/*** unit test (main) ***/
var run_Tests = [
  {"test": 1, "run": 0}
  ,{"test": 2, "run": 0}
];
