package com.dev.Backend.dto;

public class WppConnectQrCodeDTO {

    private String qrcode;

    public WppConnectQrCodeDTO() {
    }

    public WppConnectQrCodeDTO(String qrcode) {
        this.qrcode = qrcode;
    }

    public String getQrcode() {
        return qrcode;
    }

    public void setQrcode(String qrcode) {
        this.qrcode = qrcode;
    }
}
