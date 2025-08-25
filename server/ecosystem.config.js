module.exports = {
  apps : [{
    name   : "survey-backend",
    script : "./index.js",
    env: {
      "NODE_ENV": "development",
    },
    env_production : {
       "NODE_ENV": "production"
    }
  }]
}
