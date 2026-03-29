import api from "./api";

export const createOrder = (data) =>
  api.post("/orders", data);