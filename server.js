const http = require('http');
const Koa = require('koa');
const koaBody = require('koa-body');
const app = new Koa();


class Tickets {
  constructor(id, name, description, status, created) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.status = status;
    this.created = created;
  }
}

let ticketFull = [
  new Tickets(0, 'Install new version', 'Install Windows 10, drivers for printer, MS Office, save documents and mediafiles', false, new Date().toString().slice(4,21)),
  new Tickets(1, 'Raplace cartridge', 'Replace cartridge for printer Samsung in cabinet #404', true, new Date().toString().slice(4,21)),
];

app.use(koaBody({
  urlencoded: true,
  multipart: true,
  text: true,
  json: true,
}));

app.use(async (ctx, next) => {
  const origin = ctx.request.get('Origin');
  if (!origin) {
    return await next();
  }

  const headers = { 'Access-Control-Allow-Origin': '*' };

  if (ctx.request.method === 'OPTIONS') {
    ctx.response.set({ ...headers });
  }

  if (ctx.request.method !== 'OPTIONS') {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get('Access-Control-Request-Method')) {
    ctx.response.set({
      ...headers,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH',
    });

    if (ctx.request.get('Access-Control-Request-Headers')) {
      ctx.response.set('Access-Control-Allow-Headers', ctx.request.get('Access-Control-Request-Headers'));
    }

    ctx.response.status = 204;
  }
});


app.use(async ctx => {
  const { method, id } = ctx.request.query;
  const { name, description, status } = ctx.request.body;

  switch (method) {
    case 'allTickets':
      ctx.response.body = ticketFull.map((item) => {
        return {
          id: item.id,
          name: item.name,
          status: item.status,
          created: item.created,
        };
      });
      break;
    case 'ticketById':
      if (id) {
        const ticket = ticketFull.find((item) => item.id === id);
        if (ticket) {
          ctx.response.body = ticket;
        } else {
          ctx.response.status = 404;
        }
      }
      break;
    case 'createTicket':
      const newId = ticketFull.length;
      const created = new Date();
      ticketFull.push(new Tickets(newId, name, description, false, created));
      ctx.response.body = ticketFull;
      break;
    case 'removeById':
      const index = ticketFull.findIndex((item) => item.id === id);
      ticketFull.splice(index, 1);
      ctx.response.body = true;
      break;
    case 'editTicket':
      if (id) {
        const index = ticketFull.findIndex((item) => item.id === id);
        ticketFull[index].name = name;
        ticketFull[index].description = description;
      }
      ctx.response.body = true;
      break;
    case 'checkTicket':
      if (id) {
        const index = ticketFull.findIndex((item) => item.id === id);
        ticketFull[index].status = status;
      }
      ctx.response.body = true;
      break;
    default:
      ctx.response.status = 404;
      break;
  }
});

const server = http.createServer(app.callback());
const port = process.env.PORT || 7070;
server.listen(port, () => console.log('Server started'));