'use strict';

const SchemaObject = require("schema-object");
const NotEmptyString = { type: String, minLength: 1 };

const FileUploadApi = new SchemaObject(
    {
        url: NotEmptyString,
    }
);

module.exports = FileUploadApi;