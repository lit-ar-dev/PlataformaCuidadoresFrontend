require("dotenv").config();
export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE: process.env.API_BASE,
  },
});
