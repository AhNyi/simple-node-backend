const app = require('./app');
const { PORT } = require('./config/env_config');

const on_port = PORT || 3000;

app.listen(on_port, () => {
  console.log('server running at :' + on_port);
});
