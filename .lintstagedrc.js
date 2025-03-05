const buildEslintCommand = (filenames) => `eslint --fix ${filenames.join(" ")}`;

const buildPrettierCommand = (filenames) =>
  `prettier ${filenames.join(" ")} -w`;

export default {
  "!(dist)/**/*.{js,ts,jsx,tsx}": [buildEslintCommand],
  "!(dist)/**/*.{js,ts,jsx,tsx,md,html,css}": [buildPrettierCommand],
};
