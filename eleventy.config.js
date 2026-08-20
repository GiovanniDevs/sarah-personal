module.exports = function (eleventyConfig) {
  // Copied through untouched. 
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/scripts");
  eleventyConfig.addPassthroughCopy("src/images");

  // Front matter dates are parsed
  // at UTC midnight, so this formats in UTC too — formatting in a zone behind UTC
  // would print the previous day.
  eleventyConfig.addFilter("postDate", (d) =>
    new Intl.DateTimeFormat("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d),
  );

  // The machine-readable half of <time datetime="…">.
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
