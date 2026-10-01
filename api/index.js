const app = require('../server/app');

module.exports = (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const route = url.searchParams.get('__buildspec_route');
  if (!route || !/^(api|uploads)\/[a-zA-Z0-9/_-]+(?:\.[a-zA-Z0-9]+)?$/.test(route)) {
    response.statusCode = 404;
    return response.end();
  }
  url.searchParams.delete('__buildspec_route');
  request.url = `/${route}${url.search}`;
  return app(request, response);
};
