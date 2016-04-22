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
  const OPEN_TAG = boundary + CRLF;
  const CLOSE_TAG = boundary + '--';
  var result_Obj = {
    // states: empty -> (undefined | "") | partial -> "--" | complete -> "-- ... \r\n"
    "open_Tag": boundary + CRLF//------WebKitFormBoundaryRlQf1oHVfylrtnOJ\r\n
    ,"content_Headers": "Content-Disposition: form-data; ..."
    ,"headers_End": CRLF// <- 2-nd CRLF
    // chars after 'CRLF' and before "close_Tag"
    ,"extracted_Content": " ... "//  <- may be incomplete
    ,"close_Tag": boundary + "--"// <- may never being completed
  };
  var str_Item_Index = 0;
  var i = 0;
  var chunk_Length = data_Chunk.length;
  var boundary_Length = boundary.length;
  var open_Tag_Length = OPEN_TAG.length;
  var close_Tag_Length = CLOSE_TAG.length;
  var current_Char = "";
  //>>> parser's state <<<///
  var open_Tag = "";
  var content_Headers = "";
  var headers_End = "";
  // ? Buffer ?
  // Buffer.concat([buf1, buf2, buf3], totalLength == buf1.length + buf2.length + buf3.length);
  // Buffer.from('this is a tést');
  // Buffer.from('7468697320697320612074c3a97374', 'hex');
  // new Buffer('7468697320697320612074c3a97374', 'hex');
  // TODO how to get / set file content encoding ?
  var extracted_Content = Buffer.from('', 'utf8');
  var char_Buffer = Buffer.from('', 'utf8');
  var close_Tag = "";

  //*** defaults ***//
  if (is_Debug_Mode) {console.log("defaults:");}
  //*** defaults end ***//

  //*** initialization ***//
  if (is_Debug_Mode) {console.log("initialization:");}
  //if (is_Debug_Mode) {console.log("parser_State:", parser_State);}
  if (
    parser_State &&
    parser_State.open_Tag
  ) { // is not null | undefined & is a proper object
    //>>> set <<<//
    open_Tag = parser_State.open_Tag;
    content_Headers = parser_State.content_Headers;
    headers_End = parser_State.headers_End;
    extracted_Content = parser_State.extracted_Content;
    if (
      extracted_Content &&
      typeof(extracted_Content) == 'object' &&
      extracted_Content.hasOwnProperty("length")
    ) {
      if (is_Debug_Mode) {console.log("extracted_Content.length:", extracted_Content.length);}
    } else {
      extracted_Content = Buffer.from('', 'utf8');
      if (is_Debug_Mode) {console.log("extracted_Content is empty:", extracted_Content);}
    }
    close_Tag = parser_State.close_Tag;
  } else {
  }
  if (is_Debug_Mode) {console.log("content_Headers:", content_Headers);}
  //*** initialization end ***//

  for (;i < chunk_Length;i++) {

    current_Char = data_Chunk[i];

    if (
      open_Tag === "" ||
      open_Tag.length < open_Tag_Length ||
      open_Tag != OPEN_TAG
      ) {
      open_Tag += current_Char;
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
      headers_End != CRLF
    ) {
      content_Headers += current_Char;
      headers_End = content_Headers.slice(-2);
      //>>> post check <<<//
      if (
        current_Char == '\n' &&
        content_Headers !== "" &&
        //content_Headers.slice(-2) == CRLF
        headers_End == CRLF
      ) {
        //headers_End = CRLF;
        //content_Headers = content_Headers.slice(0, -2);
        if (is_Debug_Mode) { console.log("content_Headers extracted:", content_Headers);}
      } else {
        // to prevent further chunk processing
        current_Char = undefined;
      }
    }
    if (
      current_Char &&
      headers_End == CRLF &&
      (close_Tag.length < close_Tag_Length ||
      close_Tag != CLOSE_TAG)
    ) {
      close_Tag = (close_Tag + current_Char).slice(-close_Tag_Length);
      //>>> post check <<<//
      if (
        current_Char == '-' &&
        //extracted_Content.length > 0 &&
        close_Tag == CLOSE_TAG
      ) {
        if (is_Debug_Mode) { console.log("extracted_Content extracted:");}
        if (is_Debug_Mode) { console.log("extracted_Content.length:", extracted_Content.length);}
      } else {
        char_Buffer = Buffer.from(current_Char, 'utf8');
        extracted_Content = Buffer
          .concat(
            [extracted_Content, char_Buffer]
            ,extracted_Content.length + char_Buffer.length);
      }
    }
  }
  //>>> result <<<//
  if (is_Debug_Mode) {console.log("return value:");}
  //return Promise
  //  .resolve(
  return {
        //"extracted_Content": extracted_Content
        "parser_State": {
          "open_Tag": open_Tag
          ,"content_Headers": content_Headers
          ,"headers_End": headers_End
          ,"extracted_Content": extracted_Content
          ,"close_Tag": headers_End
        }
      }
  //  )
  ;
}

/*##########################################################################*/
//extract_File_Content
exports.parse_Stream = parse_Stream;
