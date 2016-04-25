"use strict";

/*
 `Encapsulation` `boundaries`
 must not appear within the `encapsulations`, and
 must be no longer than 70 characters,
 not counting the two leading `hyphens`.

The encapsulation `boundary`
following the last `body` `part` is
a distinguished `delimiter` that indicates
that no further `body` `parts` will follow.
Such a `delimiter` is
identical to the previous `delimiters`,
with the addition of
two more `hyphens` at the end of the line:
     --gc0p4Jq0M2Yt08jU534c0p--

As a very simple example,
the following `multipart` `message` has two `parts`,
both of them
`plain text`,
one of them
`explicitly` typed and
one of them
`implicitly` typed:

     From: Nathaniel Borenstein <nsb@bellcore.com>
     To:  Ned Freed <ned@innosoft.com>
     Subject: Sample message
     MIME-Version: 1.0
     Content-type: multipart/mixed; boundary="simple boundary"

     This is the preamble.  It is to be ignored, though it
     is a handy place for mail composers to include an
     explanatory note to non-MIME compliant readers.
     --simple boundary

     This is implicitly typed plain ASCII text.
     It does NOT end with a linebreak.
     --simple boundary
     Content-type: text/plain; charset=us-ascii

     This is explicitly typed plain ASCII text.
     It DOES end with a linebreak.

     --simple boundary--
     This is the epilogue.  It is also to be ignored.

The only mandatory parameter for the multipart Content-Type is
the `boundary` parameter,
which consists of 1 to 70 characters:
  boundary := 0*69<bchars> bcharsnospace

  bchars := bcharsnospace | " "

  bcharsnospace := DIGIT | ALPHA | "'" | "(" | ")" | "+"  | "_" | "," | "-" | "." | "/" | ":" | "=" | "?"

Overall, the body of a multipart entity may be specified as follows:
  multipart-body := preamble
                    1*encapsulation
                    close-delimiter
                    epilogue

  encapsulation := delimiter CRLF body-part

  delimiter := CRLF "--" boundary   ; taken from Content-Type field.
                                    ; when content-type is multipart
                                    ; There must be no space
                                    ; between "--" and boundary.

  close-delimiter := delimiter "--" ; Again, no space before "--"

  preamble :=  *text  ;  to be ignored upon receipt.

  epilogue :=  *text  ;  to be ignored upon receipt.

  body-part = <"message" as defined in RFC 822,
           with all `header` fields optional, and
           with the specified `delimiter`
           not occurring anywhere in the `message` `body`,
           either on a line by itself or
           as a substring anywhere.
           Note that
           the semantics of a `part` differ from
           the semantics of a `message`,
           as described in the text.>
*/
/* >> data format // var CRLF = '\r\n'; // CR+LF: CR (U+000D) followed by LF (U+000A)
"
------WebKitFormBoundaryRlQf1oHVfylrtnOJ\r\n  <- start tag, ends with CRLF
>>> == boundary <- req.get("boundary") | req.header("boundary")
>>> headers <<<
Content-Disposition: form-data;
name=\"upload_File\";
filename=\"index.html\"\r\n
Content-Type: text/html
\r\n\r\n  <- headers end tag (? double CRLF ?)
>>> headers end <<<
>>> file content / body <<<
>>> file content / body end <<<
\r\n  <- file content / body end tag (CRLF), before end tag == start tag
------WebKitFormBoundaryRlQf1oHVfylrtnOJ--\r\n <- end tag == start tag + '--' (? + CRLF ?)
"
*/
// helper
function extract_File_Content(
  is_Debug_Mode//: bool <- optional
) {// => Promise(obj) <- parse state
  "use strict";

  var result_Obj = {};

  //  .resolve(
  return result_Obj
  ;
}

// TODO custom parser function must:
// TODO - extract file content (as Buffer) from POST stream
// TODO - optional or separate at / as method:
// TODO -- check for stream current size limit
// TODO -- calculate file content size in bytes
// jshint esversion: 6, laxcomma: true
/* laxcomma: true */
// helper
function parse_Stream(
  data_Chunk//: str
  //>>> main data accumulator <<<//
  //,extracted_Content//: (obj | dictionary) | list of (obj | dictionary)
  ,parser_State//: obj | dictionary
  ,boundary//: str
  ,is_Debug_Mode//: bool <- optional
) {//: => Promise(obj) <- parse state
  "use strict";

  const CRLF = '\r\n';
  const HEADERS_END = CRLF + CRLF;
  const OPEN_TAG = '--' + boundary + CRLF;
  const CLOSE_TAG = '--' + boundary + '--';
  const ENCODINGS = ['ascii', 'utf8', 'utf16le', 'base64', 'binary', 'hex'];
  var result_Obj = {
    // states: empty -> (undefined | "") | partial -> "--" | complete -> "-- ... \r\n"
    //> 'ascii' - for 7-bit ASCII data
    "open_Tag": '--' + boundary + CRLF//------WebKitFormBoundaryRlQf1oHVfylrtnOJ\r\n
    //> 'ascii' - for 7-bit ASCII data
    ,"content_Headers": "Content-Disposition: form-data; ..."
    //> 'ascii' - for 7-bit ASCII data
    ,"headers_End": 2 * CRLF// <- 2-nd CRLF
    // chars after 'CRLF' and before "close_Tag"
    //> encoding method ? 'ascii' ? 'utf8' ? 'utf16le' ? 'base64' ? 'binary' ? 'hex' ?
    ,"extracted_Content": " ... "//  <- may be incomplete
    //> 'ascii' - for 7-bit ASCII data
    ,"close_Tag": '--' + boundary + "--"// <- may never being completed
  };
  var str_Item_Index = 0;
  var i = 0;
  var chunk_Length = data_Chunk.length;
  var boundary_Length = boundary.length;
  var open_Tag_Length = OPEN_TAG.length;
  var headers_End_Length = HEADERS_END.length;
  var close_Tag_Length = CLOSE_TAG.length;
  var current_Char = "";
  //>>> parser's state <<<///
  var open_Tag = "";
  var content_Headers = "";
  var headers_End = "";
  // ? Buffer ?
  // For octet streams in the context of TCP streams & file system operations
  // Buffer.concat([buf1, buf2, buf3], totalLength == buf1.length + buf2.length + buf3.length);
  // Buffer.from('this is a tést');
  // Buffer.from('7468697320697320612074c3a97374', 'hex');
  // new Buffer('7468697320697320612074c3a97374', 'hex');
  // TODO how to get / set file content encoding ?
  //> attempt to create Buffer.empty(<any>)
  var file_Buffer = Buffer.from('', 'utf8');
  var extracted_Content = '';
  var char_Buffer = Buffer.from('', 'utf8');
  var close_Tag = "";

  //*** defaults ***//
  if (is_Debug_Mode) {console.log("defaults:");}
  //if (is_Debug_Mode) {console.log("OPEN_TAG:", OPEN_TAG);}
  //if (is_Debug_Mode) {console.log("CLOSE_TAG:", CLOSE_TAG);}
  //*** defaults end ***//

  //*** initialization ***//
  if (is_Debug_Mode) {console.log("initialization:");}
  //if (is_Debug_Mode) {console.log("parser_State:", parser_State);}
  if (
    parser_State &&
    parser_State.open_Tag
  ) { // is not null | undefined & is a proper object
    //>>> ? guard ? <<<///
    /*if (close_Tag == CLOSE_TAG) {


      return parser_State;
    }*/
    //>>> set <<<//
    open_Tag = parser_State.open_Tag;
    content_Headers = parser_State.content_Headers;
    headers_End = parser_State.headers_End;
    extracted_Content = parser_State.extracted_Content;
    if (
      extracted_Content &&
      //typeof(extracted_Content) == 'object' &&
      extracted_Content.hasOwnProperty("length")
    ) {
      if (is_Debug_Mode) {console.log("extracted_Content.length:", extracted_Content.length);}
    } else {
      if (is_Debug_Mode) {console.log("extracted_Content was / is empty:", extracted_Content);}
      //extracted_Content = Buffer.from('', 'utf8');
      extracted_Content = '';
    }
    if (parser_State.file_Buffer) {file_Buffer = parser_State.file_Buffer;}
    close_Tag = parser_State.close_Tag;
  } else {
  }
  if (is_Debug_Mode) {console.log("content_Headers:", content_Headers);}
  //*** initialization end ***//

  //buf.toString([encoding[, start[, end]]])
  //Buffer.isEncoding(encoding)
  //> it works, but how this is helpful / how to use that info ?
  /*if (data_Chunk instanceof Buffer) {
    for (let value of ENCODINGS) {
      if (
        //data_Chunk
        Buffer.isEncoding(value)
      ) {
        console.log("data_Chunk encoding:", value);
      }
    }
  }*/

  //buf.values()
  //for (var value of buf.values()) {
  // or just
  //for (var value of buf) {
  for (;i < chunk_Length;i++) {

    current_Char = data_Chunk[i];

    if (
      open_Tag === "" ||
      open_Tag.length < open_Tag_Length ||
      open_Tag != OPEN_TAG
      ) {
      //>>> slide window
      open_Tag = (open_Tag + current_Char).slice(-open_Tag_Length);
      //>>> post check <<<//
      if (current_Char == '\n' && open_Tag == OPEN_TAG) {
        //>>> guard / margin / delimiter / skip char flag <<<//
        if (is_Debug_Mode) { console.log("open_Tag completed:", open_Tag);}
        current_Char = undefined;
      }
    }
    if (
      current_Char &&
      open_Tag == OPEN_TAG &&
      headers_End != HEADERS_END
    ) {
      content_Headers += current_Char;
      //>>> slide window
      headers_End = content_Headers.slice(-headers_End_Length);
      //>>> post check <<<//
      if (
        current_Char == '\n' &&
        content_Headers !== "" &&
        //content_Headers.slice(-2) == CRLF
        headers_End == HEADERS_END
      ) {
        //headers_End = CRLF;
        //content_Headers = content_Headers.slice(0, -2);
        if (is_Debug_Mode) { console.log("content_Headers extracted:", content_Headers);}
        // to prevent further chunk processing
        current_Char = undefined;
      } else {
      }
    }
    if (
      current_Char &&
      headers_End == HEADERS_END &&
      (close_Tag.length < close_Tag_Length ||
      close_Tag != CLOSE_TAG)
    ) {

      //> StringDecoder decodes a buffer to a string
      //char_Buffer = current_Char;
      char_Buffer = Buffer.from([current_Char], 'utf8');
      //RangeError: toString() radix argument must be between 2 and 36
      //current_Char = current_Char.toString(2);
      //current_Char = current_Char.toString(8);
      current_Char = current_Char.toString(16);
      //RangeError: Invalid code point NaN
      //current_Char = String.fromCodePoint(current_Char);
      //>>> slide window
      close_Tag = (close_Tag + current_Char).slice(-close_Tag_Length);
      //>>> post check <<<//
      if (
        current_Char == '-' &&
        //extracted_Content.length > 0 &&
        //"abc".endsWith("bc") -> true
        close_Tag == CLOSE_TAG
      ) {
        if (is_Debug_Mode) { console.log("extracted_Content extracted:");}
        //if (is_Debug_Mode) { console.log("close_Tag:", close_Tag, "== CLOSE_TAG:", CLOSE_TAG);}
        extracted_Content = extracted_Content.slice(0, -close_Tag_Length);
        if (is_Debug_Mode) { console.log("extracted_Content.length:", extracted_Content.length);}
        if (is_Debug_Mode) { console.log("file_Buffer.length:", file_Buffer.length);}
        if (is_Debug_Mode) { console.log("file_Buffer:", file_Buffer);}
        if (is_Debug_Mode) { console.log("file_Buffer.toString():", file_Buffer.toString());}
        //Buffer.byteLength(string[, encoding])
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of utf8 str):", Buffer.byteLength(file_Buffer.toString(), 'utf8'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of utf8 buf):", Buffer.byteLength(file_Buffer, 'utf8'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of hex str):", Buffer.byteLength(file_Buffer.toString(), 'hex'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of hex buf):", Buffer.byteLength(file_Buffer, 'hex'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of ascii str):", Buffer.byteLength(file_Buffer.toString(), 'ascii'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of ascii buf):", Buffer.byteLength(file_Buffer, 'ascii'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of base64 str):", Buffer.byteLength(file_Buffer.toString(), 'base64'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of base64 buf):", Buffer.byteLength(file_Buffer, 'base64'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of binary str):", Buffer.byteLength(file_Buffer.toString(), 'binary'));}
        if (is_Debug_Mode) { console.log("Buffer.byteLength(of binary buf):", Buffer.byteLength(file_Buffer, 'binary'));}
      } else {
        //TypeError('"value" argument must not be a number')
        //char_Buffer = Buffer.from(String(current_Char), 'utf8');
        //char_Buffer = Buffer.from([current_Char], 'utf8');
        //char_Buffer = Buffer(char_Buffer);
        extracted_Content += current_Char;
        file_Buffer = Buffer
          .concat(
            [file_Buffer, char_Buffer]
            ,file_Buffer.length + char_Buffer.length);
      }
    }
  }
  //>>> result <<<//
  if (is_Debug_Mode) {console.log("return value:");}
  //return Promise
  //  .resolve(
  return {
        //"extracted_Content": extracted_Content
        //"parser_State": {
          "open_Tag": open_Tag
          ,"content_Headers": content_Headers
          ,"headers_End": headers_End
          ,"extracted_Content": extracted_Content
          ,"file_Buffer": file_Buffer
          ,"close_Tag": close_Tag
        //}
      }
  //  )
  ;
}

/*##########################################################################*/
//extract_File_Content
exports.parse_Stream = parse_Stream;
