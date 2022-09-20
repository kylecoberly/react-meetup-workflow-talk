import express from "express";

const app = express();

app.get("/", (request, response) => {
  response.json({
    message: "Hi!",
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
