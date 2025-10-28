require("dotenv").config();

export default ({ config }) => ({
  ...config,
  extra: {
    API_BASE:
      process.env.ENV === "development" || process.env.ENV === "dev"
        ? process.env.API_BASE_DEV
        : process.env.API_BASE_PROD,
  },
});
