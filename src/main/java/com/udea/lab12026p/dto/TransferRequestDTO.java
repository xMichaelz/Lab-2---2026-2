package com.udea.lab12026p.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TransferRequestDTO {

    @NotBlank(message = "La cuenta origen es obligatoria.")
    private String senderAccountNumber;

    @NotBlank(message = "La cuenta destino es obligatoria.")
    private String receiverAccountNumber;

    @NotNull(message = "El monto es obligatorio.")
    @Positive(message = "El monto debe ser mayor que cero.")
    private Double amount;

    public TransferRequestDTO() {
    }

    public TransferRequestDTO(String senderAccountNumber, String receiverAccountNumber, Double amount) {
        this.senderAccountNumber = senderAccountNumber;
        this.receiverAccountNumber = receiverAccountNumber;
        this.amount = amount;
    }

    public String getSenderAccountNumber() {
        return senderAccountNumber;
    }

    public void setSenderAccountNumber(String senderAccountNumber) {
        this.senderAccountNumber = senderAccountNumber;
    }

    public String getReceiverAccountNumber() {
        return receiverAccountNumber;
    }

    public void setReceiverAccountNumber(String receiverAccountNumber) {
        this.receiverAccountNumber = receiverAccountNumber;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }
}
