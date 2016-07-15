'use strict';

var xhr = require('xhr');
var crossvent = require('crossvent');
var emitter = require('contra/emitter');
var validators = {
  image: isItAnImageFile
};
var rimagemime = /^image\/(gif|png|p?jpe?g)$/i;

function setup (fileinput, options) {
  var bureaucrat = create(options);
  crossvent.add(fileinput, 'change', handler, false);

  return bureaucrat;

  function handler (e) {
    stop(e);
    if (fileinput.files.length) {
      bureaucrat.submit(fileinput.files);
    }
    fileinput.value = '';
    fileinput.value = null;
  }
}

function create (options) {
  var o = options || {};
  var bureaucrat = emitter({
    submit: submit
  });
  return bureaucrat;

  function submit (rawFiles) {
    bureaucrat.emit('started', rawFiles);
    var allFiles = Array.prototype.slice.call(rawFiles);
    var validFiles = filter(allFiles);
    if (!validFiles) {
      bureaucrat.emit('invalid', allFiles);
      return;
    }
    bureaucrat.emit('valid', validFiles);
    var form = new FormData();
    var req = {
      'Content-Type': 'multipart/form-data',
      headers: {
        Accept: 'application/json'
      },
      method: o.method || 'PUT',
      url: o.endpoint || '/api/files',
      body: form
    };

    validFiles.forEach(appendFile);
    xhr(req, handleResponse);

    function appendFile (file) {
      form.append('uploads', file, file.name);
    }

    function handleResponse (err, res, body) {
      console.log(err);
      res.body = body = getData(body);
      console.log(body);
      var results = body && body.results && Array.isArray(body.results) ? body.results : [];
      console.log(results,res.statusCode,err,body instanceof Error, body);
      if (err || res.statusCode < 200 || res.statusCode > 299 || body instanceof Error) {
        console.log("bureaucrat.emit('error',", err);
        bureaucrat.emit('error', err);
      } else {
        console.log("bureaucrat.emit('success',", results, body);
        bureaucrat.emit('success', results, body);
      }
        console.log("bureaucrat.emit('ended',", err, results, body);
      bureaucrat.emit('ended', err, results, body);
    }
  }

  function filter (files) {
    return o.validate ? files.filter(whereValid) : files;
    function whereValid (file) {
      var validator = validators[o.validate] || o.validate;
      return validator(file);
    }
  }
}

function stop (e) {
  e.stopPropagation();
  e.preventDefault();
}

function isItAnImageFile (file) {
  return rimagemime.test(file.type);
}

function getData (body) {
  try {
    return JSON.parse(body);
  } catch (err) {
    return err;
  }
}

module.exports = {
  create: create,
  setup: setup
};
