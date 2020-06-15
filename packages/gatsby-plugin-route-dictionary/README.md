# Gatsby plugin: Route Dictionary

Exports a json file with all known routes. We can read this this json in other tooling. The route will be available in **public/\_routes.json**

## Installation

You can simply install this plugin by installing it through [Gatsby recipes](https://www.gatsbyjs.org/blog/2020-04-15-announcing-gatsby-recipes/):

`gatsby recipes https://raw.githubusercontent.com/wardpeet/gatsby-plugin-performance-doctor/master/packages/gatsby-plugin-route-dictionary/recipe.md`

If you're more hardcore and want to install it manually, you can by:

1. Run `npm install --save-dev gatsby-plugin-route-dictionary`. You can also use yarn `yarn add --dev gatsby-plugin-route-dictionary`
1. Add the plugin to the plugins array in your `gatsby-config.js`

```js
// gatsby-config
module.exports = {
  // Other config
  plugins: [`gatsby-plugin-route-dictionary`]
};
```
