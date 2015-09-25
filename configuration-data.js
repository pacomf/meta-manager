// Configuration data
var data = {
  address: 'localhost',
  port: 8080,
  views:{
    directory: "/views",
    engine: "jade"
  },
  language: {
    directory: "/locales",
    set: ["es","en"]
  },
  database: {
    user: "",
    password: ""
  },
  routes: {
    file: "./routes/routes"
  }
}

// Required line
exports.data = data;