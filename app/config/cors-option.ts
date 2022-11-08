const corsOptions = {
  origin: "https://ocr-poc-steel.vercel.app",
  methods: "OPTION, GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: "Authorization",
};

export default corsOptions;
