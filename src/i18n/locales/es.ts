// src/i18n/locales/es.ts
// Spanish overrides. A complete translation: every key English defines has a
// Spanish counterpart, including both members of every plural family Spanish
// needs (`_one` and `_other` — Spanish, like English, resolves counts to one
// of those two CLDR categories).
import type { Dictionary } from '../types';

export const es: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Estadísticas de Inmigración de Japón',
  'app.subtitle': 'Estadísticas de tramitación de solicitudes y de población residente extranjera, obtenidas de e-Stat',
  'app.skipToContent': 'Saltar al contenido',
  'app.loadingData': 'Procesando datos de inmigración...',
  'app.loadingDashboard': 'Cargando panel...',
  'app.retry': 'Reintentar',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': 'Panel de Estadísticas de Inmigración de Japón',
  'meta.description':
    'Tiempos de tramitación de visados, carga de trabajo de las oficinas, evolución de la población residente extranjera y un estimador basado en un modelo de colas para tu propia solicitud, elaborado con estadísticas oficiales de la Agencia de Servicios de Inmigración y actualizado a medida que e-Stat publica nuevos datos.',
  'meta.keywords':
    'tiempos de tramitación de visados en Japón, estadísticas de oficinas de inmigración, seguimiento de solicitudes de visado, Agencia de Servicios de Inmigración, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Idioma',
  'nav.switchToLightTheme': 'Cambiar al tema claro',
  'nav.switchToDarkTheme': 'Cambiar al tema oscuro',
  'nav.openSettings': 'Abrir el menú de ajustes',
  'nav.settings': 'Ajustes',
  'nav.theme': 'Tema',
  'nav.themeLight': 'Claro',
  'nav.themeDark': 'Oscuro',
  'nav.about': 'Acerca de',
  'nav.changelog': 'Registro de cambios',
  'nav.sourceCode': 'Código fuente',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Datos: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(comparación)',
  'dashboard.expandEstimator': 'Expandir el estimador de tiempo de tramitación',
  'dashboard.estimatorRail': 'Estimador',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Oficina de inmigración',
  'filters.appType': 'Tipo de solicitud',
  'filters.compare': 'Comparar con',
  'filters.compareNone': 'Ninguno',
  'filters.excludeAirports': 'Excluir oficinas aeroportuarias',
  'filters.includeAirports': 'Incluir oficinas aeroportuarias',
  'filters.reset': 'Restablecer filtros',
  'filters.selectPlaceholder': 'Seleccionar',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Intervalo de tiempo',
  'period.latest': 'Último mes',
  'period.all': 'Todos los datos',
  'period.months_one': '{count} mes',
  'period.months_other': '{count} meses',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Total de solicitudes',
  'stats.totalApplications.short': 'Tot.',
  'stats.pending': 'Pendientes',
  'stats.granted': 'Concedidas',
  'stats.denied': 'Denegadas',
  'stats.approvalRate': 'Tasa de aprobación',
  'stats.approvalRate.short': 'Aprobación',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} m/m',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Arrastradas',
  'metric.pending': 'Pendientes (arrastradas)',
  'metric.received': 'Recibidas',
  'metric.processed': 'Tramitadas',
  'metric.granted': 'Concedidas',
  'metric.denied': 'Denegadas',
  'metric.other': 'Otras',
  'metric.approvalRate': 'Tasa de aprobación',
  'metric.efficiency': 'Eficiencia',
  'metric.applications': 'Solicitudes',
  'metric.population': 'Población',
  'metric.area': 'Superficie',
  'metric.density': 'Densidad',
  'common.noDataForFilters': 'No hay datos para esta combinación de filtros.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Ver tabla de datos',
  'table.hide': 'Ocultar tabla de datos',
  'table.downloadCsv': 'Descargar CSV',
  'table.month': 'Mes',
  'table.prefecture': 'Prefectura',
  'table.shareOfTotal': 'Porcentaje del total',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Estimador de tiempo',
  'estimator.description':
    'Estimación basada en un modelo de colas a partir del rendimiento de la oficina en los últimos seis meses.',
  'estimator.selectBureau': 'Seleccionar oficina',
  'estimator.selectType': 'Seleccionar tipo',
  'estimator.applicationDate': 'Fecha de solicitud',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': 'Editar los datos de su solicitud',
  'estimator.empty':
    'Selecciona tu oficina, el tipo de solicitud y la fecha de solicitud para estimar cuándo se tramitará tu solicitud.',
  'estimator.estimatedCompletion': 'Finalización estimada',
  'estimator.queuePosition': 'Posición en la cola',
  'estimator.aheadOfYou': '≈ {count} por delante de ti',
  'estimator.howCalculated': '¿Cómo se calcula esto?',
  'estimator.showMath': 'Mostrar los cálculos',
  'estimator.hideMath': 'Ocultar los cálculos',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'Restablecer el estimador',
  'estimator.resetAria': 'Restablecer el estimador de tiempo de tramitación',
  'estimator.collapse': 'Contraer el estimador',
  'estimator.collapseAria': 'Contraer el estimador de tiempo de tramitación',
  'estimator.close': 'Cerrar el estimador',
  'estimator.closeAria': 'Cerrar el estimador de tiempo de tramitación',
  'estimator.copyPermalink': 'Copiar un enlace permanente a esta estimación',
  'estimator.copied': '¡Copiado!',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} día',
  'estimator.uncertaintyDays_other': '± {count} días',
  'estimator.uncertaintyWeeks_one': '± {count} semana',
  'estimator.uncertaintyWeeks_other': '± {count} semanas',
  'estimator.basedOnMonths_one': 'basado en {count} mes de rendimiento',
  'estimator.basedOnMonths_other': 'basado en {count} meses de rendimiento',
  // Warnings.
  'estimator.limitedDataTitle': 'Estimado con datos limitados:',
  'estimator.limitedDataBody_one':
    'La fecha de tu solicitud está fuera del rango de datos disponibles. Esta estimación se basa en tasas de tramitación simuladas a partir de {count} mes de datos históricos y puede ser menos precisa.',
  'estimator.limitedDataBody_other':
    'La fecha de tu solicitud está fuera del rango de datos disponibles. Esta estimación se basa en tasas de tramitación simuladas a partir de {count} meses de datos históricos y puede ser menos precisa.',
  'estimator.pastDueTitle': 'Posiblemente atrasada:',
  'estimator.pastDueBody':
    'Según las tasas de tramitación previstas, la finalización de esta solicitud podría estar atrasada. Si aún no has recibido solicitudes adicionales de información ni una decisión sobre esta solicitud, ponte en contacto con la oficina para obtener más información.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*Esto es una {emphasis} basada en las tasas de tramitación actuales, la posición prevista en la cola y las solicitudes pendientes. El tiempo real de tramitación de tu solicitud puede variar.',
  'estimator.disclaimerEmphasis': 'estimación',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Base de rendimiento',
  'estimator.formula.step2': 'Cola al presentar',
  'estimator.formula.step3': 'Tramitado desde la solicitud',
  'estimator.formula.step4': 'Posición en la cola y días restantes',
  'estimator.formula.step5': 'Días enteros y margen',
  'estimator.formula.explainAria': 'Explicar las variables de la fórmula {title}',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': 'Total tramitado',
  'estimator.formula.var.sigmaP.description':
    'Solicitudes resueltas en el periodo muestreado, es decir los seis últimos meses publicados, o menos si los datos terminan antes.',
  'estimator.formula.var.sigmaN.title': 'Total recibido',
  'estimator.formula.var.sigmaN.description': 'Solicitudes recibidas en ese mismo periodo muestreado.',
  'estimator.formula.var.sigmaD.title': 'Total de días',
  'estimator.formula.var.sigmaD.description': 'Días naturales del periodo muestreado, sumados mes a mes.',
  'estimator.formula.var.rProc.title': 'Ritmo de tramitación',
  'estimator.formula.var.rProc.description':
    'Solicitudes resueltas al día, promediadas sobre todo el periodo muestreado.',
  'estimator.formula.var.rNew.title': 'Ritmo de entrada',
  'estimator.formula.var.rNew.description': 'Solicitudes recibidas al día, promediadas sobre ese mismo periodo.',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': 'Total del mes anterior',
  'estimator.formula.var.tPrev.description':
    'Todas las solicitudes en cartera el mes anterior al suyo: el arrastre más las nuevas entradas.',
  'estimator.formula.var.pPrev.title': 'Tramitado el mes anterior',
  'estimator.formula.var.pPrev.description': 'Solicitudes resueltas durante el mes anterior al suyo.',
  'estimator.formula.var.cSeed.title': 'Inicio de la simulación',
  'estimator.formula.var.cSeed.description':
    'El último arrastre publicado, usado como punto de partida cuando el mes anterior al suyo no tiene cifras propias.',
  'estimator.formula.var.mSim.title': 'Meses simulados',
  'estimator.formula.var.mSim.description':
    'Cuántos meses se ha proyectado el arrastre hasta llegar a su mes de solicitud.',
  'estimator.formula.var.cPrev.title': 'Arrastre',
  'estimator.formula.var.cPrev.description':
    'Solicitudes aún pendientes al comenzar su mes de solicitud. Se toma del mes anterior cuando está publicado y, si no, se proyecta mes a mes desde el último mes con cifras.',
  'estimator.formula.var.nMonth.title': 'Recibido en el mes',
  'estimator.formula.var.nMonth.description': 'Solicitudes recibidas a lo largo de todo su mes de solicitud.',
  'estimator.formula.var.pMonth.title': 'Tramitado en el mes',
  'estimator.formula.var.pMonth.description': 'Solicitudes resueltas a lo largo de todo su mes de solicitud.',
  'estimator.formula.var.dMonth.title': 'Días del mes',
  'estimator.formula.var.dMonth.description':
    'Días naturales de su mes de solicitud, empleados para repartir los totales mensuales por igual entre los días.',
  'estimator.formula.var.aDay.title': 'Día de la solicitud',
  'estimator.formula.var.aDay.description':
    'Qué día del mes presentó, es decir hasta dónde se había acumulado la cola.',
  'estimator.formula.var.nApp.title': 'Recibido antes que usted',
  'estimator.formula.var.nApp.description':
    'Solicitudes recibidas antes en su mes de solicitud, prorrateadas hasta el día en que presentó.',
  'estimator.formula.var.pApp.title': 'Tramitado antes que usted',
  'estimator.formula.var.pApp.description':
    'Solicitudes resueltas antes en su mes de solicitud, prorrateadas del mismo modo.',
  'estimator.formula.var.qApp.title': 'Cola al presentar',
  'estimator.formula.var.qApp.description': 'Cuántas solicitudes iban por delante de la suya el día en que presentó.',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': 'Tramitado en meses posteriores',
  'estimator.formula.var.pAfter.description':
    'Solicitudes resueltas en los meses publicados posteriores a su mes de solicitud.',
  'estimator.formula.var.tApp.title': 'Días desde la solicitud',
  'estimator.formula.var.tApp.description': 'Días naturales entre su fecha de solicitud y hoy.',
  'estimator.formula.var.tData.title': 'Días desde los datos',
  'estimator.formula.var.tData.description': 'Días naturales entre el final del último mes publicado y hoy.',
  'estimator.formula.var.cProc.title': 'Tramitado confirmado',
  'estimator.formula.var.cProc.description':
    'Resoluciones posteriores a su solicitud que las cifras publicadas ya recogen.',
  'estimator.formula.var.eProc.title': 'Tramitado previsto',
  'estimator.formula.var.eProc.description':
    'Solicitudes que se suponen resueltas en el tramo que las cifras publicadas aún no cubren. Se vuelve negativo cuando esas cifras ya superan lo que preveía el ritmo medio.',
  'estimator.formula.var.sProc.title': 'Tramitado desde entonces',
  'estimator.formula.var.sProc.description':
    'Todo lo resuelto desde que presentó: lo confirmado y lo previsto juntos, redondeados a solicitudes enteras.',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': 'Posición en la cola',
  'estimator.formula.var.qPos.description':
    'Cuántas solicitudes siguen por delante de la suya. Cero o menos significa que la estimación ya ha pasado.',
  'estimator.formula.var.dRem.title': 'Días restantes',
  'estimator.formula.var.dRem.description': 'Días necesarios para despejar el resto de la cola al ritmo actual.',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': 'Días enteros',
  'estimator.formula.var.dEst.description':
    'Los días restantes redondeados alejándose de cero: el desplazamiento que se suma a hoy para dar la fecha mostrada arriba.',
  'estimator.formula.var.sigmaR.title': 'Dispersión del ritmo',
  'estimator.formula.var.sigmaR.description':
    'Desviación típica de los ritmos mensuales de tramitación, esto es cuánto varía el paso de un mes a otro.',
  'estimator.formula.var.rBar.title': 'Ritmo mensual medio',
  'estimator.formula.var.rBar.description':
    'La media de los ritmos mensuales con igual peso por mes, no ponderada por volumen.',
  'estimator.formula.var.uDays.title': 'Incertidumbre',
  'estimator.formula.var.uDays.description':
    'El margen ± que aparece junto al resultado: cuánto se mueve la estimación si el paso varía tanto como lo ha hecho últimamente.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Entrada y tramitación',
  'charts.intake.description':
    'Solicitudes arrastradas y recibidas cada mes, frente al volumen que completaron las oficinas y a la parte de ese volumen que se concedió.',
  'charts.intake.aria':
    'Barras apiladas de solicitudes pendientes y recibidas por mes, con el volumen tramitado como línea y la tasa de aprobación como segunda línea en un eje derecho de cero a cien por ciento',
  'charts.types.label': 'Tipos de solicitud',
  'charts.types.description':
    'Nuevas presentaciones mensuales desglosadas por tipo de solicitud — haz clic en una entrada de la leyenda para mostrar u ocultar una serie.',
  'charts.types.aria': 'Gráfico de líneas de nuevas presentaciones mensuales por tipo de solicitud',
  'charts.outcomes.label': 'Resultados',
  'charts.outcomes.description':
    'Dónde terminan las solicitudes: el flujo de cada tipo hacia los resultados de concedida, denegada u otro.',
  'charts.outcomes.aria': 'Diagrama de Sankey de los tipos de solicitud que fluyen hacia los resultados',
  'charts.share.label': 'Reparto por oficina',
  'charts.share.description': 'Dónde se presentaron las solicitudes: la parte de cada oficina en el total de entradas.',
  'charts.share.aria': 'Gráfico de anillos de la parte de cada oficina en las solicitudes recibidas',
  'charts.mix.label': 'Combinación de categorías',
  'charts.mix.description':
    'Todas las solicitudes por tipo y oficina — haz clic en una categoría para ampliar su desglose.',
  'charts.efficiency.label': 'Eficiencia de tramitación',
  'charts.efficiency.description':
    'Oficinas clasificadas por tasa de finalización — el grosor del tallo representa el volumen de entrada, con la tasa nacional como referencia.',
  'charts.efficiency.aria':
    'Oficinas clasificadas por tasa de finalización, con el volumen de entrada como grosor del tallo',
  'charts.map.label': 'Mapa regional',
  'charts.map.description':
    'Áreas de servicio de las oficinas y densidad de población, con la ubicación de oficinas y oficinas aeroportuarias.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Gráfico solar de solicitudes por tipo y oficina; navegación interactiva en profundidad',
  'charts.efficiencyQuadrant.aria':
    'Gráfico de cuadrantes de la tasa de finalización frente al volumen recibido por oficina; el tamaño de la burbuja muestra el volumen tramitado',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Mostrar {series}',
  'chart.legendHide': 'Ocultar {series}',
  'chart.allSeriesHidden': 'Todas las series están ocultas — haz clic en una entrada de la leyenda para mostrar una.',

  // ── Chart: Intake & Processing — policy event markers ────────────────────
  'policy.eventsShow': 'Mostrar eventos normativos',
  'policy.eventsHide': 'Ocultar eventos normativos',
  'policy.ssw2019.title': 'Creación de Trabajador Cualificado',
  'policy.ssw2019.description': 'Un estatus para sectores con escasez; la agencia de inmigración nació ese mismo día.',
  'policy.covidClosure.title': 'Restricciones de entrada por la pandemia',
  'policy.covidClosure.description': 'La denegación de entrada se amplió a casi todo el mundo.',
  'policy.covidSuspension.title': 'Entradas nuevas suspendidas en todo el mundo',
  'policy.covidSuspension.description':
    'Desde finales de diciembre nadie pudo entrar por primera vez, con visado o sin él.',
  'policy.covidOmicron.title': 'Reapertura revertida por ómicron',
  'policy.covidOmicron.description': 'La entrada reabierta el 8 de noviembre se cerró de nuevo tres semanas después.',
  'policy.covidResume.title': 'Vuelven estudiantes y trabajadores',
  'policy.covidResume.description': 'Se reabre la entrada para estudio, trabajo y negocios, con un cupo diario.',
  'policy.covidVisaFree.title': 'Vuelve el viaje sin visado',
  'policy.covidVisaFree.description': 'Regresaron las exenciones de visado y se eliminó el cupo diario de llegadas.',
  'policy.covidCoe.title': 'Validez de los certificados ampliada',
  'policy.covidCoe.description': 'Los certificados atrapados por el cierre siguieron válidos mucho más de tres meses.',
  'policy.covidEnd.title': 'Fin de las medidas fronterizas',
  'policy.covidEnd.description':
    'Se acabaron las pruebas y los certificados de vacunación; la enfermedad pasó a clase 5.',
  'policy.act2023.title': 'Reforma de la ley de inmigración',
  'policy.act2023.description': 'Añadió medidas de supervisión en lugar de internamiento y protección complementaria.',
  'policy.digitalNomad.title': 'Estatus para nómadas digitales',
  'policy.digitalNomad.description': 'Un estatus de seis meses para teletrabajadores y sus familias.',
  'policy.sswExpansion.title': 'Ampliación de Trabajador Cualificado',
  'policy.sswExpansion.description': 'Un acuerdo del Consejo de Ministros añadió cuatro sectores y fijó nuevas cuotas.',
  'policy.act2023Effect.title': 'Entran en vigor las normas de expulsión',
  'policy.act2023Effect.description': 'Las disposiciones principales de la reforma de 2023 entraron en vigor.',
  'policy.act2024.title': 'Sustitución de las prácticas técnicas',
  'policy.act2024.description': 'Desde 2027, la formación laboral sustituye al programa de prácticas técnicas.',
  'policy.feeRevision2025.title': 'Subida de las tasas de solicitud',
  'policy.feeRevision2025.description': 'Las prórrogas suben a 6.000 yenes y la residencia permanente a 10.000.',
  'policy.businessManager2025.title': 'Reglas de gestión más estrictas',
  'policy.businessManager2025.description': 'Se exige más capital, un empleado a jornada completa y un plan validado.',
  'policy.residenceCard2026.title': 'La tarjeta de residencia se une a My Number',
  'policy.residenceCard2026.description': 'Entraron en servicio las tarjetas combinadas de residencia y My Number.',
  'policy.act2026.title': 'Tope legal de tasas elevado',
  'policy.act2026.description': 'La reforma de 2026 elevó el tope legal de las tasas de residencia.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Adquisición',
  'chart.types.series.extension': 'Extensión',
  'chart.types.series.change': 'Cambio de estatus',
  'chart.types.series.activity': 'Permiso de actividad',
  'chart.types.series.reentry': 'Reingreso',
  'chart.types.series.permanent': 'Residencia permanente',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Otro / Retirada',
  'chart.outcomes.valueUnit': 'solicitudes',
  'chart.outcomes.tooltipValueLabel': 'Solicitudes',
  'chart.outcomes.tooltipFlowLabel': 'Flujo',
  'chart.outcomes.approvalRate': 'Aprobación',
  'chart.outcomes.ofProcessed': 'de {count} solicitudes tramitadas',
  'chart.outcomes.empty': 'No hay solicitudes tramitadas en este período.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Otros ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Todas las solicitudes',
  'chart.mix.breadcrumbAria': 'Ruta de navegación del mapa de árbol',
  'chart.mix.zoomInHint': 'Haz clic en una categoría para ampliar',
  'chart.mix.zoomOutHint': 'Haz clic en el fondo (o pulsa Esc) para reducir',
  'chart.mix.zoomInHintTap': 'Toca una categoría para verla, toca de nuevo para ampliar',
  'chart.mix.zoomOutHintTap': 'Toca el fondo para reducir',
  'chart.mix.others': 'Otros',
  'chart.mix.categoryAria': '{category}: {count} solicitudes. Ampliar.',
  'chart.mix.tooltipValue': '{count} solicitudes · {percent} de {scope}',
  'chart.mix.scopeAll': 'todas las solicitudes',
  'chart.mix.sunburstHint': '{trail} — {count} solicitudes ({percent} del total)',
  'chart.sunburst.hintClick': 'Haz clic en un segmento para ampliar · pasa el cursor para verlo',
  'chart.sunburst.hintTap': 'Toca un segmento para verlo, toca de nuevo para ampliar',
  'chart.sunburst.zoomOutClick': 'Haz clic en el centro para reducir',
  'chart.sunburst.zoomOutTap': 'Toca el centro para reducir',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'oficina sucursal',
  'chart.efficiency.receivedCount': '{count} recibidas',
  'chart.efficiency.nationwide': 'Nacional {rate}',
  'chart.efficiency.pointAria': '{bureau}: {rate} por ciento de finalización, {count} solicitudes recibidas',
  'chart.efficiency.xAxis': 'Solicitudes recibidas',
  'chart.efficiency.fullCompletion': '100 % de las entradas completado',
  'chart.efficiency.quadrantKeepingPace': 'ALTO VOLUMEN · AL RITMO',
  'chart.efficiency.quadrantFallingBehind': 'ALTO VOLUMEN · CON RETRASO',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Oficina de {bureau}',
  'map.airportMarkerAria': 'Oficina aeroportuaria de {bureau}',
  'map.bureauSuffix': 'Oficina de {bureau}',
  'map.airportSuffix': 'Oficina Aeroportuaria de {bureau}',
  'map.servicePopulation': 'Población atendida',
  'map.serviceArea': 'Área de servicio',
  'map.serviceBureau': 'Oficina responsable',
  'map.portOfEntry': 'Oficina de puerto de entrada',
  'map.legendNote': 'Color = oficina responsable · intensidad = densidad de población',
  'map.bureau': 'Oficina',
  'map.airportOffice': 'Oficina aeroportuaria',
  'map.loadError': 'No se pudieron cargar los datos del mapa. Intenta recargar la página.',
  'map.loading': 'Cargando datos del mapa...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value}/km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Registro de cambios',
  'changelog.loading': 'Cargando...',
  'changelog.expandAll': 'Expandir todo',
  'changelog.collapseAll': 'Contraer todo',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Error al cargar los datos',
  'errors.noData': 'No hay datos disponibles',
  'errors.unknown': 'Se produjo un error desconocido',
  'errors.fetchFailed': 'No se pudieron obtener los datos',
  'errors.renderTitle': 'Algo salió mal',
  'errors.renderBody': 'Se produjo un error al renderizar la aplicación.',
  'errors.reload': 'Recargar página',
  'errors.changelogUnavailable': 'No se pudo cargar el registro de cambios.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Mostrando {chart} de {bureau}',
  'a11y.showingChartWithType': 'Mostrando {chart} de {bureau}, {type}',
  'a11y.policyEvents': 'Eventos normativos mostrados en este gráfico',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Estadísticas oficiales proporcionadas por la Agencia de Servicios de Inmigración de Japón',
  'footer.dataAcquisition': 'Adquisición de datos proporcionada por {source}',
  'footer.fixtureNotice': 'mostrando datos de prueba generados',
  'footer.builtBy': 'Creado por {author}',
  'footer.dataUpdated': 'datos actualizados el {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; leave it as the Latin code in most languages.
  'bureau.all': 'Todo el país',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': 'Todo el país',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Aeropuerto de Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Aeropuerto de Narita',
  'bureau.101200': 'Aeropuerto de Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Aeropuerto de Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Aeropuerto de Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Aeropuerto de Chubu',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaka',
  'bureau.101480': 'Aeropuerto de Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Aeropuerto de Kansai',
  'bureau.101490': 'Kobe',
  'bureau.101490.short': 'UKB',
  'bureau.101490.compact': 'Kobe',
  'bureau.101580': 'Hiroshima',
  'bureau.101580.short': 'HIJ',
  'bureau.101580.compact': 'Hiroshima',
  'bureau.101670': 'Takamatsu',
  'bureau.101670.short': 'TAK',
  'bureau.101670.compact': 'Takamatsu',
  'bureau.101720': 'Fukuoka',
  'bureau.101720.short': 'FUK',
  'bureau.101720.compact': 'Fukuoka',
  'bureau.101740': 'Naha',
  'bureau.101740.short': 'OKA',

  'bureau.101740.compact': 'Naha',
  // ── Domain: application types ────────────────────────────────────────────
  // Keyed by e-Stat application type code. `.short` is the stat-tile
  // abbreviation; `.compact` is the one-word form the narrow Sankey uses.
  'appType.all': 'Todos los tipos',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'Todos',
  'appType.10': 'Adquisición de estatus',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Adquisición',
  'appType.20': 'Extensión de estancia',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Extensión',
  'appType.30': 'Cambio de estatus',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Cambio',
  'appType.40': 'Permiso de actividades',
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Permiso',
  'appType.50': 'Reingreso',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Reingreso',
  'appType.60': 'Residencia permanente',
  'appType.60.short': 'PR',
  'appType.60.compact': 'Permanente',

  // ── Domain: prefectures ──────────────────────────────────────────────────
  // Keyed by JIS prefecture code (1 Hokkaido … 47 Okinawa).
  'prefecture.1': 'Hokkaido',
  'prefecture.2': 'Aomori',
  'prefecture.3': 'Iwate',
  'prefecture.4': 'Miyagi',
  'prefecture.5': 'Akita',
  'prefecture.6': 'Yamagata',
  'prefecture.7': 'Fukushima',
  'prefecture.8': 'Ibaraki',
  'prefecture.9': 'Tochigi',
  'prefecture.10': 'Gunma',
  'prefecture.11': 'Saitama',
  'prefecture.12': 'Chiba',
  'prefecture.13': 'Tokio',
  'prefecture.14': 'Kanagawa',
  'prefecture.15': 'Niigata',
  'prefecture.16': 'Toyama',
  'prefecture.17': 'Ishikawa',
  'prefecture.18': 'Fukui',
  'prefecture.19': 'Yamanashi',
  'prefecture.20': 'Nagano',
  'prefecture.21': 'Gifu',
  'prefecture.22': 'Shizuoka',
  'prefecture.23': 'Aichi',
  'prefecture.24': 'Mie',
  'prefecture.25': 'Shiga',
  'prefecture.26': 'Kioto',
  'prefecture.27': 'Osaka',
  'prefecture.28': 'Hyogo',
  'prefecture.29': 'Nara',
  'prefecture.30': 'Wakayama',
  'prefecture.31': 'Tottori',
  'prefecture.32': 'Shimane',
  'prefecture.33': 'Okayama',
  'prefecture.34': 'Hiroshima',
  'prefecture.35': 'Yamaguchi',
  'prefecture.36': 'Tokushima',
  'prefecture.37': 'Kagawa',
  'prefecture.38': 'Ehime',
  'prefecture.39': 'Kochi',
  'prefecture.40': 'Fukuoka',
  'prefecture.41': 'Saga',
  'prefecture.42': 'Nagasaki',
  'prefecture.43': 'Kumamoto',
  'prefecture.44': 'Oita',
  'prefecture.45': 'Miyazaki',
  'prefecture.46': 'Kagoshima',
  'prefecture.47': 'Okinawa',

  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.label': 'Conjunto de datos',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Elige qué conjunto de datos explorar',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Tramitación de solicitudes',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Tramitación',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'Población extranjera residente',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Residentes',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': 'Los datos de población extranjera residente no están disponibles en este momento.',
  'charts.growth.label': 'Crecimiento de la Población',
  'charts.growth.description':
    'La población extranjera residente completa, semestre a semestre, apilada por finalidad de estancia o por región del mundo.',
  'charts.growth.aria':
    'Gráfico de barras apiladas del total de residentes extranjeros por semestre, dividido por grupo de estatus o región',
  'charts.origins.label': 'Orígenes a lo largo del tiempo',
  'charts.origins.description':
    'Cómo han crecido o disminuido las principales nacionalidades en cada semestre que cubren las estadísticas.',
  'charts.origins.aria': 'Gráfico de áreas apiladas del número de residentes por nacionalidad a lo largo del tiempo',
  'charts.flows.label': 'Del Origen al Estatus',
  'charts.flows.description':
    'Regiones del mundo fluyendo por países hasta las finalidades de estancia — elige una región o nacionalidad para seguir su perfil.',
  'charts.flows.aria':
    'Diagrama de Sankey de residentes fluyendo de las regiones del mundo, por países, a las categorías de estatus de residencia',
  'charts.statuses.label': 'Composición por estatus de residencia',
  'charts.statuses.description':
    'Qué visados tienen los residentes, agrupados por finalidad de la estancia: haz clic en un grupo para desglosarlo.',
  'charts.statuses.aria': 'Gráfico sunburst de residentes por grupo de estatus de residencia y estatus individual',
  'charts.worldmap.label': 'Orígenes en el mundo',
  'charts.worldmap.description':
    'De dónde proceden los residentes extranjeros de Japón, sombreado según cuántos tienen cada nacionalidad.',
  'charts.worldmap.aria': 'Mapamundi sombreado según el número de residentes de cada país de origen',
  'charts.movers.label': 'Mayores variaciones',
  'charts.movers.description':
    'Los mayores aumentos y descensos entre dos periodos, por nacionalidad o por estatus de residencia.',
  'charts.movers.aria': 'Gráfico de barras divergentes con los mayores aumentos y descensos entre dos periodos',

  'filters.region': 'Región',
  'filters.allRegions': 'Todas las regiones',
  'filters.nationality': 'Nacionalidad',
  'filters.residenceStatus': 'Estatus de residencia',
  'filters.allNationalities': 'Todas las nacionalidades',
  'filters.allStatuses': 'Todos los estatus',
  'filters.allCategories': 'Todas las categorías',

  'period.snapshotLabel': 'Periodo de la instantánea',
  'period.latestPeriod': 'Último periodo',
  'period.years_one': '{count} año',
  'period.years_other': '{count} años',

  'residents.total': 'Residentes extranjeros',
  'residents.total.short': 'Residentes',
  'residents.delta': '{delta} respecto al semestre anterior',
  'residents.populationShare': 'Proporción de la Población',
  'residents.populationShare.short': 'Prop. de población',
  'residents.populationShareOf': 'de la población de Japón ({population} personas)',
  'residents.topNationality': 'Nacionalidad más numerosa',
  'residents.topNationality.short': 'Mayor origen',
  'residents.topStatus': 'Estatus más frecuente',
  'residents.topStatus.short': 'Mayor estatus',
  'residents.share': '{share} del total',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Otras nacionalidades',
  'residents.noMapArea': '{count} nacionalidades no tienen territorio en el mapa y no aparecen sombreadas.',
  'residents.legendScale': 'Residentes',
  'residents.discontinued': 'La serie termina en {period}: la categoría se fusionó o cambió de nombre.',
  'residents.comparePeriod': 'frente a {period}',
  'residents.byNationality': 'Por nacionalidad',
  'residents.byStatus': 'Por estatus de residencia',
  'residents.increase': 'Aumento',
  'residents.decrease': 'Descenso',
  'residents.asOf': 'A {period}',
  'residents.noChange': 'No hay variación apreciable entre estos dos periodos.',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': 'Por finalidad',
  'residents.stackByRegion': 'Por región del mundo',
  'residents.stackByNationality': 'Por nacionalidad',
  'residents.growthTotal': 'Total general',
  'residents.viewAbsolute': 'Recuento',
  'residents.viewIndexed': 'Crecimiento (indexado)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': 'residentes',
  'residents.flowsTooltipValueLabel': 'Residentes',
  'residents.flowsTooltipFlowLabel': 'Flujo',
  'residents.sunburstHint': '{trail} — {count} residentes ({percent} del total)',
  'residents.markerResidenceCard.title': 'Comienza la tarjeta de residencia',
  'residents.markerResidenceCard.description':
    'La tarjeta sustituyó al registro de extranjeros; el recuento arranca ahí.',
  'residents.markerReopening.title': 'Fronteras reabiertas',
  'residents.markerReopening.description':
    'El viaje sin visado volvió en octubre de 2022 y la población retomó su crecimiento.',
  'residents.markerTraining.title': 'Sustitución de las prácticas técnicas',
  'residents.markerTraining.description':
    'La reforma de 2024 crea la nueva formación y endurece la residencia permanente.',
  'residents.markerBusinessManager.title': 'Reglas de gestión más estrictas',
  'residents.markerBusinessManager.description':
    'Desde octubre de 2025 se exige más capital, un empleado fijo y un plan validado.',
  'residents.markerSsw.title': 'Lanzamiento del visado Specified Skilled Worker',
  'residents.markerSsw.description':
    'El visado de abril de 2019 abrió más de una docena de sectores a trabajadores extranjeros cualificados.',
  'residents.markerCovid.title': 'Cierre de fronteras por COVID-19',
  'residents.markerCovid.description':
    'Las restricciones de entrada congelaron las nuevas llegadas; la población cayó hasta mediados de 2022.',
  'residents.markerKoreaSplit.title': 'División estadística de Corea',
  'residents.markerKoreaSplit.description':
    'Corea (combinada) pasó a ser series separadas de Corea del Sur y Corea (Chosen) — un cambio de registro, no de población.',

  'statusGroup.work': 'Trabajo',
  'statusGroup.training': 'Formación',
  'statusGroup.study': 'Estudios',
  'statusGroup.family': 'Familia',
  'statusGroup.residency': 'Residencia',
  'statusGroup.other': 'Otros',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'Asia',
  'region.2000': 'Europa',
  'region.3000': 'África',
  'region.4000': 'América del Norte',
  'region.5000': 'América del Sur',
  'region.6000': 'Oceanía',
  'region.7000': 'Apátrida',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': 'Corea (Chosen)',
  'nationality.1130': 'Corea (agrupada)',
  'nationality.2290': 'Serbia y Montenegro',
  'nationality.2500': 'Yugoslavia',
  'nationality.7000': 'Apátrida',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Total general',
  'status.1040': 'Profesorado universitario',
  'status.1050': 'Artista',
  'status.1060': 'Actividades religiosas',
  'status.1070': 'Periodista',
  'status.1080': 'Profesional altamente cualificado',
  'status.1090': 'Profesional altamente cualificado (i)(a)',
  'status.1100': 'Profesional altamente cualificado (i)(b)',
  'status.1110': 'Profesional altamente cualificado (i)(c)',
  'status.1120': 'Profesional altamente cualificado (ii)',
  'status.1130': 'Inversor / gerente de empresa',
  'status.1140': 'Gestión empresarial',
  'status.1150': 'Servicios jurídicos y contables',
  'status.1160': 'Servicios médicos',
  'status.1170': 'Investigación',
  'status.1180': 'Docente',
  'status.1190': 'Ingeniería',
  'status.1200': 'Especialista en humanidades / servicios internacionales',
  'status.1210': 'Ingeniería / humanidades / servicios internacionales',
  'status.1220': 'Traslado dentro de la empresa',
  'status.1230': 'Cuidados de enfermería',
  'status.1240': 'Artista de espectáculos',
  'status.1250': 'Trabajo especializado',
  'status.1260': 'Trabajador con cualificación específica',
  'status.1270': 'Trabajador con cualificación específica (i)',
  'status.1280': 'Trabajador con cualificación específica (ii)',
  'status.1290': 'Prácticas técnicas',
  'status.1300': 'Prácticas técnicas (i)(a)',
  'status.1310': 'Prácticas técnicas (i)(b)',
  'status.1320': 'Prácticas técnicas (ii)(a)',
  'status.1330': 'Prácticas técnicas (ii)(b)',
  'status.1340': 'Prácticas técnicas (iii)(a)',
  'status.1350': 'Prácticas técnicas (iii)(b)',
  'status.1360': 'Actividades culturales',
  'status.1380': 'Estudiante',
  'status.1400': 'Aprendiz',
  'status.1410': 'Familiar a cargo',
  'status.1420': 'Actividades designadas',
  'status.1430': 'Residente permanente',
  'status.1440': 'Cónyuge o hijo de nacional japonés',
  'status.1450': 'Cónyuge o hijo de residente permanente',
  'status.1460': 'Residente de larga duración',
  'status.1470': 'Residente permanente especial',
  'residents.mixRoot': 'Todos los residentes',
  'residents.mixScopeAll': 'todos los residentes',
  'residents.mixCategoryAria': '{category}: {count} residentes. Ampliar.',
  'residents.mixTooltipValue': '{count} residentes · {percent} de {scope}',
};
