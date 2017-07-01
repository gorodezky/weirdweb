'use strict';

const Hapi = require('hapi');
const Path = require('path');
const Nunjucks = require('nunjucks');

const controllers = {};
controllers.index = require('./controllers/index.js');


// Create a server with a host and port
const server = new Hapi.Server();
server.connection({ 
    host: process.env.HOST || '0.0.0.0', 
    port: process.env.PORT || 8000
});

server.register({  
  register: require('inert')
}, function(err) {
  if (err) throw err
})

server.register(require('vision'), (err) => {
  if (err) {
    throw err;
  }
  server.views({
    engines: {
      html: {
        compile(src, options) {
          const template = Nunjucks.compile(src, options.environment);
          return context => template.render(context);
        },
        prepare(options, next) {
          options.compileOptions.environment = Nunjucks.configure(options.path, {
            watch: false,
          });
          return next();
        },
      },
    },
    path: Path.join(__dirname, 'views'),
  });
});

// Add the route
server.route({
    method: 'GET',
    path:'/helloworld', 
    handler: function (request, reply) {

        return reply('Hello world. Works.');
    }
});

server.route({
    method: 'GET',
    path:'/', 
    handler: controllers.index.index,
});

server.route({  
  method: 'GET',
  path: '/views/{file*}',
  handler: {
    directory: { 
      path: 'views/',
      listing: true
    }
  }
})

server.route({
    method: 'GET',
    path:'/protected',
    handler: function (request, reply) {

        return reply('This is protected.').code(401);
    }
});

//test3
server.route({
    method: 'GET',
    path:'/strings/upper',
    handler: function (request, reply) {

  var params = request.query.value;
        return reply(params.toUpperCase());
    }
});

//test4
server.route({
    method: 'GET',
    path:'/strings/reverse',
    handler: function (request, reply) {

        var params = request.query.value;
  function reverseString(str) {
    var splitStr = str.split("");
    var reverseArray = splitStr.reverse();
    var joinArray = reverseArray.join("");
    return joinArray;
  }
        return reply(reverseString(params));
    }
});

//test5
server.route({
    method: 'GET',
    path:'/strings/concatenate',
    handler: function (request, reply) {
        var value = request.query.value;
  var times = request.query.times;
  var conc = ""
        for (var i = 0; i < times; i++) {
    conc = conc + value;
  }
        return reply(conc);
    }
});

// Start the server
server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
