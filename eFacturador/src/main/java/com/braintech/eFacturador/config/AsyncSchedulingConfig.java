package com.braintech.eFacturador.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

/**
 * Habilita el procesamiento asíncrono de eventos (alertas de stock) y las tareas programadas
 * (alertas de vencimiento de lotes).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncSchedulingConfig {

  /**
   * Pool dedicado para los listeners de alertas de inventario. Separado del pool general para
   * evitar bloquear otros @Async del sistema.
   */
  @Bean(name = "alertasExecutor")
  public Executor alertasExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(5);
    executor.setQueueCapacity(100);
    executor.setThreadNamePrefix("alerta-inv-");
    executor.initialize();
    return executor;
  }
}
