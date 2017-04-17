
```javascript
// server/main.js
const { authorize, token, refresh} = require('@procore/js-sdk');
const Hapi = require('hapi');
const Joi = require('joi');
const Session = require('yar');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/my_database');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const User = new Schema({
  email: String,
  active: Boolean
})

const AuthorizationCode = new Schema({
    auth_token: String,
    refresh_token: String,
    user: { ref: 'User', type: ObjectId }
});

const clientId = process.env.PROCORE_CLIENT_ID;
const clientSecret = process.env.PROCORE_CLIENT_SECRET;
const redirectUri = process.env.PROCORE_REDIRECT_URI;

const server = new Hapi.Server();

server.connection({ port: 8080 });

server.register([Session], () => {
  server.route({
    method: 'GET',
    path: '/sessions/create',
    handler: (req, reply) => {
      reply.redirect(authorize({ id: clientId, uri: redirectUri })
    }  
  });

  server.route({
    method: 'GET',
    path: '/oauth/procore/consume',
    config: {
      auth: false,
      validate: { query: { code: Joi.string() } },
      handler: (req, reply) => {
        token({ id: clientId, secret: clientSecret, uri: redirectUri, code: req.query.code })
          .then(({ auth_token, refresh_token }) => {
            client(oauth(auth_token))
              .get(me())
              .then(res => res.json())
              .then(({ id }) => {
                request.yar.set("user_id", id)

                const authorizationCode = new AuthorizationCode({
                  auth_token,
                  refresh_token,
                  user_id: id
                });

                authorizationCode.save(
                  (err, authCode)=> {
                  request.yar.set('auth_token', auth.token);

                  reply.redirect('/')
                });
              })
          })
          .catch(err => reply(err))
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/oauth/procore/refresh',
    handler: (request, reply) => {
      AuthorizationCode.findOne({ auth_token: request.yar.get("auth_token") }, (err, auth) => {
        refresh({
          id: clientId,
          secret: clientSecret,
          uri: redirectUri,
          token: auth.auth_token,
          refresh: auth.refresh_token
        })
        .then(res => res.json())
        .then(({ auth_token, refresh_token }) => {
          auth.auth_token = auth_token

          auth.refresh_token = refresh_token

          auth.save(() => {
            reply({ auth_token })
          });
        });
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      handler: (request, reply) => {
        reply.view('App', { auth_token: request.yar.get('auth_token') })
      }
    }
  })

  server.start();
});
```
