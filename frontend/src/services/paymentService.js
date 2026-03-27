import api from "./api";

export const paymentService = {
  async payForAppointment(payload) {
    const { data } = await api.post("/payments/pay", payload);
    return data;
  },

  async getMyPayments() {
    const { data } = await api.get("/payments/my");
    return data;
  },

  async getPaymentByAppointment(appointmentId) {
    const { data } = await api.get(`/payments/appointment/${appointmentId}`);
    return data;
  }
};
