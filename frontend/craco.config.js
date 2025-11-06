module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  devServer: {
    allowedHosts: "all",
    client: {
      webSocketURL: 'auto://0.0.0.0:0/ws'
    }
  }
};

