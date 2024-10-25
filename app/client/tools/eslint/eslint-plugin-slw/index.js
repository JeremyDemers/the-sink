const { readdirSync } = require('node:fs');

const rulesDir = `${__dirname}/rules`;

module.exports = {
  rules: readdirSync(rulesDir, { withFileTypes: true }).reduce(
    (accumulator, item) => {
      if (item.isFile() && !item.name.includes('.test.') && !item.name.includes('.d.')) {
        const filenameParts = item.name.split('.');
        // Drop the extension.
        filenameParts.pop();

        // eslint-disable-next-line import/no-dynamic-require, global-require
        accumulator[filenameParts.join('-')] = require(`${rulesDir}/${item.name}`);
      }

      return accumulator;
    },
    {},
  ),
};
