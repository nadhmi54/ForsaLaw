package com.forsalaw.messengerManagement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;

/**
 * Scan antivirus optionnel via ClamAV (clamd). Si desactive, aucun scan reseau.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ClamAvScanService {

    @Value("${forsalaw.messenger.attachments.clamav.enabled:false}")
    private boolean enabled;

    @Value("${forsalaw.messenger.attachments.clamav.host:127.0.0.1}")
    private String host;

    @Value("${forsalaw.messenger.attachments.clamav.port:3310}")
    private int port;

    @Value("${forsalaw.messenger.attachments.clamav.timeout-ms:5000}")
    private int timeoutMs;

    /**
     * @return true si le fichier est considere comme sain, false si infecte ou erreur de scan.
     */
    public boolean scanBytes(byte[] data) {
        if (!enabled) {
            return true;
        }
        if (data == null || data.length == 0) {
            return true;
        }
        try {
            return scanInstream(data);
        } catch (Exception e) {
            log.error("ClamAV scan failed", e);
            return false;
        }
    }

    /**
     * Protocole INSTREAM ClamAV.
     */
    private boolean scanInstream(byte[] data) throws IOException {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            socket.setSoTimeout(timeoutMs);
            try (OutputStream out = socket.getOutputStream();
                 InputStream in = socket.getInputStream()) {
                out.write("zINSTREAM\0".getBytes(StandardCharsets.US_ASCII));
                ByteBuffer lenBuf = ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN);
                lenBuf.putInt(data.length);
                out.write(lenBuf.array());
                out.write(data);
                ByteBuffer end = ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN);
                end.putInt(0);
                out.write(end.array());
                out.flush();
                byte[] response = in.readAllBytes();
                String s = new String(response, StandardCharsets.UTF_8).trim();
                log.debug("ClamAV response: {}", s);
                if (s.contains("FOUND")) {
                    return false;
                }
                return s.contains("OK") && !s.contains("ERROR");
            }
        }
    }
}
