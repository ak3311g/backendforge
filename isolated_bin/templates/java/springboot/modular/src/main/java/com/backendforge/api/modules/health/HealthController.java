package com.backendforge.api.modules.health;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "uptime", uptimeSeconds + "s",
                "timestamp", Instant.now().toString()
        ));
    }
}