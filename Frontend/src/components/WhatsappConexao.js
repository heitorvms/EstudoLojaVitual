import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { WhatsappStatusService } from "../services/WhatsappStatusService";

const POLL_INTERVAL_MS = 10000;
const QR_COUNTDOWN_SECONDS = 60;

const statusConfig = {
  CONNECTED: {
    label: "Conectado",
    severity: "success",
    icon: "pi pi-check-circle",
    hint: "WhatsApp pronto para envio de mensagens.",
  },
  DISCONNECTED: {
    label: "Aguardando conexão — escaneie o QR Code",
    severity: "warning",
    icon: "pi pi-qrcode",
    hint: "Clique em Conectar WhatsApp para gerar o QR Code.",
  },
  QRCODE: {
    label: "Aguardando conexão — escaneie o QR Code",
    severity: "warning",
    icon: "pi pi-qrcode",
    hint: "Escaneie o QR Code no aplicativo WhatsApp.",
  },
  OFFLINE: {
    label: "Servidor WhatsApp offline",
    severity: "danger",
    icon: "pi pi-times-circle",
    hint: "Verifique se o WPPConnect está rodando em localhost:21465.",
  },
};

const WhatsappConexao = () => {
  const toast = useRef(null);
  const service = useRef(new WhatsappStatusService()).current;
  const countdownRef = useRef(null);
  const conectandoRef = useRef(false);

  const [status, setStatus] = useState("OFFLINE");
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [conectando, setConectando] = useState(false);
  const [desconectando, setDesconectando] = useState(false);
  const [qrcode, setQrcode] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [qrExpirado, setQrExpirado] = useState(false);

  const pararCountdown = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setCountdown(0);
  }, []);

  const iniciarCountdown = useCallback(() => {
    pararCountdown();
    setQrExpirado(false);
    setCountdown(QR_COUNTDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          setQrExpirado(true);
          setQrcode(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [pararCountdown]);

  const carregarStatus = useCallback(async () => {
    try {
      const data = await service.getStatus();
      const novoStatus = data?.status || "OFFLINE";
      setStatus(novoStatus);
      if (novoStatus === "CONNECTED") {
        setQrcode(null);
        setQrExpirado(false);
        pararCountdown();
      }
    } catch {
      setStatus("OFFLINE");
    } finally {
      setLoadingStatus(false);
    }
  }, [service, pararCountdown]);

  useEffect(() => {
    carregarStatus();
    const interval = setInterval(carregarStatus, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      pararCountdown();
    };
  }, [carregarStatus, pararCountdown]);

  const handleConectar = async () => {
    if (conectandoRef.current) {
      return;
    }
    conectandoRef.current = true;
    setConectando(true);
    setQrExpirado(false);
    try {
      const data = await service.conectar();
      if (data?.qrcode) {
        setQrcode(data.qrcode);
        setStatus("QRCODE");
        iniciarCountdown();
      } else {
        toast.current?.show({
          severity: "warn",
          summary: "Aviso",
          detail: "QR Code não retornado. Tente novamente.",
          life: 4000,
        });
      }
    } catch (error) {
      toast.current?.show({
        severity: "error",
        summary: "Erro",
        detail: error.response?.data?.message || "Falha ao gerar QR Code.",
        life: 5000,
      });
    } finally {
      conectandoRef.current = false;
      setConectando(false);
    }
  };

  const handleDesconectar = () => {
    confirmDialog({
      message: "Deseja desconectar a sessão WhatsApp?",
      header: "Confirmar desconexão",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Desconectar",
      rejectLabel: "Cancelar",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setDesconectando(true);
        try {
          const data = await service.desconectar();
          setQrcode(null);
          setQrExpirado(false);
          pararCountdown();
          await carregarStatus();
          toast.current?.show({
            severity: "success",
            summary: "Sucesso",
            detail: data?.mensagem || "Desconectado com sucesso.",
            life: 3000,
          });
        } catch (error) {
          toast.current?.show({
            severity: "error",
            summary: "Erro",
            detail: error.response?.data?.message || "Falha ao desconectar.",
            life: 5000,
          });
        } finally {
          setDesconectando(false);
        }
      },
    });
  };

  const cfg = statusConfig[status] || statusConfig.OFFLINE;
  const mostrarBotaoConectar = status !== "CONNECTED" && !conectando;
  const mostrarQr = qrcode && !qrExpirado && status !== "CONNECTED";

  return (
    <Card
      title="Status da conexão WhatsApp"
      style={{ marginBottom: "1.5rem" }}
    >
      <ConfirmDialog />
      <Toast ref={toast} />

      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", marginBottom: "12px" }}>
        {loadingStatus ? (
          <ProgressSpinner style={{ width: "28px", height: "28px" }} />
        ) : (
          <Tag
            value={cfg.label}
            severity={cfg.severity}
            icon={cfg.icon}
            style={{ fontSize: "0.95rem", padding: "0.5rem 0.75rem" }}
          />
        )}
        <span style={{ color: "#64748b", fontSize: "0.9rem" }}>{cfg.hint}</span>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: mostrarQr ? "16px" : 0 }}>
        {mostrarBotaoConectar && (
          <Button
            label={conectando ? "Gerando QR Code..." : "Conectar WhatsApp"}
            icon={conectando ? "pi pi-spin pi-spinner" : "pi pi-whatsapp"}
            onClick={handleConectar}
            disabled={conectando || status === "OFFLINE"}
            loading={conectando}
          />
        )}
        {status === "CONNECTED" && (
          <Button
            label={desconectando ? "Desconectando..." : "Desconectar"}
            icon="pi pi-sign-out"
            severity="danger"
            outlined
            onClick={handleDesconectar}
            disabled={desconectando}
            loading={desconectando}
          />
        )}
      </div>

      {mostrarQr && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            padding: "16px",
            background: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <img
            src={qrcode}
            alt="QR Code WhatsApp"
            style={{ width: "240px", height: "240px", borderRadius: "8px" }}
          />
          <span style={{ fontWeight: 600, color: countdown <= 10 ? "#dc2626" : "#334155" }}>
            Expira em {countdown}s
          </span>
        </div>
      )}

      {qrExpirado && status !== "CONNECTED" && (
        <div style={{ marginTop: "12px" }}>
          <Button
            label="Gerar novo QR Code"
            icon="pi pi-refresh"
            onClick={handleConectar}
            disabled={conectando || status === "OFFLINE"}
          />
        </div>
      )}
    </Card>
  );
};

export default WhatsappConexao;
