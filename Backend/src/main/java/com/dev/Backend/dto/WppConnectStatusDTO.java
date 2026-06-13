package com.dev.Backend.dto;

public class WppConnectStatusDTO {

    private String status;

    public WppConnectStatusDTO() {
    }

    public WppConnectStatusDTO(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
