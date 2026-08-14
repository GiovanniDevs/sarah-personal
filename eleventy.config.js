module.exports = function (eleventyConfig) {
  // Copied through untouched. Eleventy strips the input dir from the path, so
  // these land at _site/fonts and _site/styles.
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
