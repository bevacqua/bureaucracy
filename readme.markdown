# bureaucracy

> Pull files from hidden file inputs into text inputs with ease

If you want the hidden file inputs part, just absolutely position the file input behind a button skin. Many articles on the internet explain how to do this.

# install

```bash
npm i bureaucracy -S
```

# `create(options?)`

Creates a `bureaucrat` object that can submit files to an HTTP API endpoint. It takes a few options.

Option                 | Description
-----------------------|---------------------------------------------------------------------------------------
`validate`             | Function that receives a `File` object and should indicate whether that file is valid
`method`               | HTTP method to use when posting the files. Defaults to `PUT`
`endpoint`             | HTTP endpoint to post the files to. Defaults to `/api/files`

There are "common" `validate` functions for your convenience. These can be referenced by name on the `validate` option

Validator | Description
----------|---------------
`'image'` | Files are expected to have a MIME type of `image/gif`, `image/png`, `image/jpg`, or `image/jpeg`

## `bureaucrat.submit(files)`

The `files` parameter expects an array of `File` or a `FileList`, like the ones you can pull from `input.files`, where `input` is an input element of type `file`.

The files are uploaded using an `uploads` field key. Once your API has handled the uplaoded files, a JSON response should be returned. The only requirement here is a `results` property that's an array describing the success of each file upload.

```json
{
  "results": [
    "anything",
    { "can": "be_used"},
    ["as", "a", "result"]
  ]
}
```

This data can be useful for the front-end to react to successful file uploads on the `success` event.

```js
var bureaucrat = create();
bureaucrat.on('success', uploadSuccess);
bureaucrat.submit(uploadInput.files);

function uploadSuccess (results) {
  console.log('so many files were uploaded!');
}
```

The submission process emits a variety of events on the `bureaucrat` object, using the `contra` emitter API.

Event     | Arguments            | Description
----------|----------------------|-----------------------------------------------------------------------------
`invalid` | `allFiles`           | Submitted files were invalid, a request won't be made
`valid`   | `validFiles`         | At least one submitted file was valid, a request will be made
`error`   | `err`                | An error `err` occurred during the HTTP API request
`success` | `results, body`      | The file API call succeeded and yielded some results
`ended`   | `err, results, body` | The HTTP API request process ended, emitted after both `error` and `success`

# `setup(fileinput, options?)`

Reacts to `change` events on a file input by making a `PUT /api/files` request with the valid user-selected files as soon as the user is finished choosing their files.

# license

mit
