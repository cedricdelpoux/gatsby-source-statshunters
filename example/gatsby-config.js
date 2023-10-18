require("dotenv").config()

module.exports = {
  pathPrefix: "/gatsby-source-statshunters",
  plugins: [
    {
      // resolve: "gatsby-source-google-mymaps",
      resolve: require.resolve(`..`),
      options: {
        api_key: process.env.STATSHUNTERS_KEY,
        debug: true,
      },
    },
  ],
}
