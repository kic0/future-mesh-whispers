module.exports = {
  apps : [{
    name   : "frontend",
    script : "npm",
    args   : "run dev",
    env: {
      "NODE_ENV": "development",
    }
  }]
}
