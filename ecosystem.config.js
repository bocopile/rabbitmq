

const { port } = require("./config/config.json")

module.exports = {
    apps: [
        {
            name: "rabbitmq_test",
            script: "./app.js",
            instance : 1,
            exec_mode : "cluster",
            wait_ready : true,
            watch: true,
            listen_timeout: 1000,

            env: {
                PORT : port,
                NODE_ENV : "development"
            },
            env_production : {
                port : port,
                NODE_ENV: "production"
            },
        },
    ],
};