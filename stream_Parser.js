"use strict";

/* >> data format // var CRLF = '\r\n';
"
------WebKitFormBoundaryRlQf1oHVfylrtnOJ\r\n  <- start tag, ends with CRLF
>>> == boundary <- req.get("boundary") | req.header("boundary")
>>> headers <<<
Content-Disposition: form-data;
name=\"upload_File\";
filename=\"index.html\"\r\n
Content-Type: text/html
\r\n\r\n  <- headers end tag (double CRLF)
>>> headers end <<<
>>> file content / body <<<
>>> file content / body end <<<
\r\n  <- file content / body end tag (CRLF), before end tag == start tag
------WebKitFormBoundaryRlQf1oHVfylrtnOJ--\r\n <- end tag == start tag
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
// helper
function parse_Stream(
  data_Chunk//: str
  //>>> main data accumulator <<<//
  ,extracted_Tags//: (obj | dictionary) | list of (obj | dictionary)
  ,parser_State//: obj | dictionary
  //,current_Tag//: str
  //,open_Tags//: obj | dictionary
  //,processing_State//: obj | dictionary
  //,incomplete_Data//: str
  ,is_Debug_Mode//: bool <- optional
) {// => Promise(obj) <- parse state
  "use strict";

  var result_Obj = {
    // 3 chars after '<'
    // states: empty -> (undefined | "") | partial -> "di" | complete -> "DIV"
    "open_Tag": "DIV"//<div class="rg_meta">
    // 5 chars after ' ' after "open_Tag"
    ,"tag_Attribute_Name": "class"
    // 7 chars after '="' after "tag_Attribute_Name"
    ,"tag_Attribute_Value": "rg_meta"
    // chars after '">' after "tag_Attribute_Value" and before "close_Tag"
    ,"tag_Content": "{\"cl\":6,\"id\":\"JJ6AX2fz8h4wLM:\", ..."//  <- may be incomplete
    // 3 chars after '</' after "open_Tag"
    // no else / others inner tags & divs expected
    ,"close_Tag": "DIV"//</div> <- may never being completed
  };
  var str_Item_Index = 0;
  var i = 0;
  var chunk_Length = data_Chunk.length;
  var current_Char = "";
  //>>> parser's state <<<///
  var context_Start = "";// "/url?q="
  var context = "";// "http://www.catersnews.com/ ..."
  var context_End = "";// "&amp;"
  var thumbnail_Start = "";// 'src="'
  var thumbnail = "";// "https://encrypted-tbn1.gstatic.com/images?q=tbn:"
  var thumbnail_End = "";// '"'
  var snippet_Start = 0;//"";// '<br>', next after </cite> <- br_Counter = 2
  // TODO skip all in snippet "< ... >"
  var snippet = "";// "Adorable moment two tiny <b>mice</b>"
  var snippet_Tag = "";// "< ... >" <- [0] | .slice(0, 1) == "<" && .slice(-1) == ">"
  var snippet_End = "";// snippet_Tag == '<br>' <- br_Counter = 3

  //*** defaults ***//
  if (is_Debug_Mode) {console.log("defaults:");}
  //if (is_Debug_Mode) {console.log("extracted_Tags:", extracted_Tags);}
  if (extracted_Tags) {
    if (is_Debug_Mode) {console.log("extracted_Tags.length:", extracted_Tags.length);}
  } else {
    extracted_Tags = [];//{};
    if (is_Debug_Mode) {console.log("extracted_Tags is empty:", extracted_Tags);}
  }
  //*** defaults end ***//

  //*** initialization ***//
  if (is_Debug_Mode) {console.log("initialization:");}
  //if (is_Debug_Mode) {console.log("parser_State:", parser_State);}
  if (parser_State) { // is not null | undefined & is an proper object
    //>>> set <<<//
    context_Start = parser_State.context_Start;
    context = parser_State.context;
    context_End = parser_State.context_End;
    thumbnail_Start = parser_State.thumbnail_Start;
    thumbnail = parser_State.thumbnail;
    thumbnail_End = parser_State.thumbnail_End;
    snippet_Start = parser_State.snippet_Start;
    snippet = parser_State.snippet;
    snippet_Tag = parser_State.snippet_Tag;
  } else {
  }
  if (is_Debug_Mode) {console.log("context:", context);}
  if (is_Debug_Mode) {console.log("thumbnail:", thumbnail);}
  if (is_Debug_Mode) {console.log("snippet:", snippet);}
  //*** initialization end ***//

  for (;i < chunk_Length;i++) {

    current_Char = data_Chunk[i];

    if (
      context_Start == "" ||
      context_Start.length < 7 ||
      context_Start != "/url?q="
      ) {
      context_Start = (context_Start + current_Char).slice(-7);
      if (false) {
        console.log(
          "add to context_Start:", context_Start,
          ".length:", context_Start.length);}
      if (false && context_Start == "/url?q=") {
        process.stdout.write("\rcontext.length: ");
      }
    }
    if (
      (context_Start == "/url?q=") &&
      (context == "" ||
      //context.length < 15 ||
      //context != 'class="rg_meta"'
      context_End != '&amp;')
      ) {
      context += current_Char;
      //console.log("\r");console.log("\b\r12");console.log("\b\r345");
      if (false) {
        //console.log("\r");
        //console.log(
        //  "\b\r", context.length);}//, "add to context.length");}//, context);}
        //process.stdout.write("\rcontext.length: " + context.length);}
        process.stdout.write(context.length + ", ");}
    }
    if (
      context_Start == "/url?q=" &&
      (context_End == "" ||
      context_End.length < 5 ||
      context_End != '&amp;')
      ) {
      context_End = (context_End + current_Char).slice(-5);
      if (false) {
        console.log(
          "add to context_End:", context_End,
          ".length:", context_End.length);}
      //>>> post check <<<//
      if (current_Char == ';' && context_End == '&amp;') {
        // drop fist char from the same iteration as / when context_Start complete
        context = context.slice(1, -5);
        if (is_Debug_Mode) { console.log("\ncontext extracted:", context);}
      }
    }

    if (
      context_End == "&amp;" &&
      (thumbnail_Start == "" ||
      thumbnail_Start.length < 5 ||
      thumbnail_Start != 'src="')
      ) {
      thumbnail_Start = (thumbnail_Start + current_Char).slice(-5);
      //>>> guard / margin / delimiter / skip char flag <<<//
      if (thumbnail_Start == 'src="') {
        if (is_Debug_Mode) { console.log("thumbnail_Start completed:", thumbnail_Start);}
        current_Char = undefined;
      }
    }
    if (
      current_Char &&
      thumbnail_Start == 'src="' &&
      thumbnail_End != '"'
    ) {

      if (current_Char == '"' && thumbnail != "") {
        thumbnail_End = current_Char;//'"';
        if (is_Debug_Mode) { console.log("thumbnail extracted:", thumbnail);}
      } else {
        thumbnail += current_Char;
      }
    }

    if (
      thumbnail_End == '"' &&
      snippet_Start < 2
      //(snippet_Start == 0 ||
      //snippet_Start.length < 4 ||
      //snippet_Start != 2)
      ) {
      snippet_Tag = (snippet_Tag + current_Char).slice(-4);
      //>>> guard / margin / delimiter / skip char flag <<<//
      if (snippet_Tag == '<br>') {
        if (is_Debug_Mode) { console.log("snippet_Tag completed:", snippet_Tag);}
        snippet_Start += 1;
        //>>> reset <<<//
        snippet_Tag = "";
        current_Char = undefined;

        if (snippet_Start == 2) {
          if (is_Debug_Mode) { console.log("snippet_Start completed:", snippet_Start);}
        }
      }
    }
    if (
      current_Char &&
      snippet_Start == 2 &&
      snippet_Tag != '<br>'
      //snippet_End != '<br>'
    ) {

      if (current_Char == '<') {
        // possible tag start
        // TODO handle case <snippet_Start><not br tag>
        snippet_Tag = current_Char;//'"';
      } else if (current_Char == '>' && snippet_Tag != "") {
        // possible tag end
        snippet_Tag += current_Char;
        if (is_Debug_Mode) { console.log("snippet_Tag completed:", snippet_Tag);}
        //>>> post check <<<//
        if (snippet_Tag == '<br>') {
          //snippet = context.slice(1, -4);
          if (is_Debug_Mode) { console.log("snippet extracted:", snippet);}
        }
      } else if (
        snippet_Tag == "" ||
        (snippet_Tag.slice(-1) == '>' &&
        snippet_Tag != "<br>")
      ) {
        snippet += current_Char;
      } else {
        snippet_Tag += current_Char;
      }
    }

    if (snippet_Tag == '<br>') {

      extracted_Tags
        .push(
          {"context": context
          ,"thumbnail": thumbnail
          ,"snippet": snippet
          }
        )
      ;
      if (is_Debug_Mode) {console.log("push to extracted_Tags.length:", extracted_Tags.length);}
      //>>> reset <<<//
      context_Start = "";
      context = "";
      context_End = "";
      thumbnail_Start = "";
      thumbnail = "";
      thumbnail_End = "";
      snippet_Start = 0;//"";
      snippet = "";
      snippet_Tag = "";

    } else {
    }
  }
  //>>> result <<<//
  if (is_Debug_Mode) {console.log("return value:");}
  if (is_Debug_Mode) {console.log("context:", context);}
  if (is_Debug_Mode) {console.log("thumbnail:", thumbnail);}
  if (is_Debug_Mode) {console.log("snippet:", snippet);}
  //return Promise
  //  .resolve(
  return {
        "extracted_Tags": extracted_Tags
        ,"parser_State": {
          "context_Start": context_Start
          ,"context": context
          ,"context_End": context_End
          ,"thumbnail_Start": thumbnail_Start
          ,"thumbnail": thumbnail
          ,"thumbnail_End": thumbnail_End
          ,"snippet_Start": snippet_Start
          ,"snippet": snippet
          ,"snippet_Tag": snippet_Tag
        }
      }
  //  )
  ;
}

/*##########################################################################*/
//extract_File_Content
exports.parse_Stream = parse_Stream;
