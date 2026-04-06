// validate request
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const data = property === "query" ? req.query : req.body;
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        error: "ValidationError",
        details: error.details.map((d) => ({
          message: d.message,
          path: d.path,
        })),
      });
    }
    if (property === "query") {
      // Instead of reassigning req.query, we'll store the validated data in a custom property
      req.validatedQuery = value;
    } else {
      req.body = value;
    }
    next();
  };
};
