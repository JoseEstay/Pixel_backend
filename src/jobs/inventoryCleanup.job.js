import { InventoryReservationModel } from '../models/inventoryReservation.model.js'

let intervalId = null

/**
 * Ejecuta la limpieza de reservas expiradas.
 */
export async function runInventoryCleanupNow () {
  try {
    const result = await InventoryReservationModel.releaseExpiredReservations()
    if (result.releasedReservationsCount > 0) {
      console.log(
        `🧹 [Cron Limpieza] Se liberaron ${result.releasedReservationsCount} reservas expiradas y se cancelaron ${result.cancelledOrdersCount} órdenes.`
      )
    }
    return result
  } catch (error) {
    console.error('❌ [Cron Limpieza] Error al ejecutar limpieza de reservas:', error.message)
    return null
  }
}

/**
 * Inicia la tarea programada periódica.
 * Por defecto se ejecuta cada 10 minutos (600.000 ms).
 */
export function startInventoryCleanupJob (intervalMs = 10 * 60 * 1000) {
  if (intervalId) return

  // Ejecuta una primera revisión tras 5 segundos de arrancar
  const initialTimeout = setTimeout(runInventoryCleanupNow, 5000)
  if (initialTimeout.unref) initialTimeout.unref()

  intervalId = setInterval(runInventoryCleanupNow, intervalMs)
  
  // .unref() permite que Node pueda cerrarse o terminar los tests sin quedar bloqueado por este timer
  if (intervalId.unref) {
    intervalId.unref()
  }

  console.log(`⏱️ [Cron Job] Tarea programada de liberación de stock iniciada (intervalo: ${intervalMs / 1000}s).`)
}

/**
 * Detiene la tarea programada.
 */
export function stopInventoryCleanupJob () {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

