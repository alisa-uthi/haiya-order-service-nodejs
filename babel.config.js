module.exports = {
    plugins: [
      [
        "module-resolver",
      ]
    ],
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            node: "current"
          }
        }
      ]
    ]
  }