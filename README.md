API Basejump: File Metadata (size) Microservice
===
> ###Objective: 
Build a full stack JavaScript app
that is functionally similar to
this [reference case](https://cryptic-ridge-9197.herokuapp.com)
and
deploy it to Heroku.
> ###User story:  
  1. user can
  _submit_ a FormData object
  that includes a **file upload**.
  2. after submission,
  user will receive
  the **file size** in _bytes_
  within the JSON _response_.
  
Live demo:
---
  * [https://api-file-metadata-microservice.herokuapp.com/](https://api-file-metadata-microservice.herokuapp.com/)
> ###Usage example:
  * image search results:
  input:
    `package.json`
  output:
    ```json
    {
      "file_Size": 475
    }
    ```
