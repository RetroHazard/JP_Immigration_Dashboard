// src/i18n/locales/pt.ts
// Portuguese (European, pt-PT) overrides. Complete: every key English defines
// has a translation here.
//
// Portuguese uses the CLDR `one` / `other` plural categories for pt-PT (only
// the exact value 1 selects `one`), the same shape as English, so every
// plural family below carries both members.
import type { Dictionary } from '../types';

export const pt: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': 'Estatísticas de Imigração do Japão',
  'app.subtitle': 'Dados de processamento dos gabinetes fornecidos pelo e-Stat, atualizados a cada publicação',
  'app.skipToContent': 'Saltar para o conteúdo',
  'app.loadingData': 'A processar dados de imigração...',
  'app.loadingDashboard': 'A carregar o painel...',
  'app.retry': 'Tentar novamente',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': 'Painel de Estatísticas de Imigração do Japão',
  'meta.description':
    'Tempos de processamento de vistos, carga de trabalho dos gabinetes e um estimador baseado num modelo de fila para a sua candidatura - construído com estatísticas oficiais da Agência de Serviços de Imigração, atualizado sempre que o e-Stat publica novos dados (normalmente mensal).',
  'meta.keywords':
    'tempos de processamento de vistos no Japão, estatísticas dos gabinetes de imigração, acompanhamento de candidaturas de visto, Agência de Serviços de Imigração, e-Stat',

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Idioma',
  'nav.switchToLightTheme': 'Mudar para o tema claro',
  'nav.switchToDarkTheme': 'Mudar para o tema escuro',
  'nav.openSettings': 'Abrir o menu de definições',
  'nav.settings': 'Definições',
  'nav.theme': 'Tema',
  'nav.themeLight': 'Claro',
  'nav.themeDark': 'Escuro',
  'nav.about': 'Sobre',
  'nav.changelog': 'Registo de alterações',
  'nav.sourceCode': 'Código-fonte',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Dados: {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(comparação)',
  'dashboard.expandEstimator': 'Expandir o Estimador de Tempo de Processamento',
  'dashboard.estimatorRail': 'Estimador',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': 'Gabinete de Imigração',
  'filters.appType': 'Tipo de Candidatura',
  'filters.compare': 'Comparar Com',
  'filters.compareNone': 'Nenhum',
  'filters.excludeAirports': 'Excluir gabinetes aeroportuários',
  'filters.includeAirports': 'Incluir gabinetes aeroportuários',
  'filters.reset': 'Repor filtros',
  'filters.selectPlaceholder': 'Selecionar',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Intervalo de tempo',
  'period.latest': 'Último mês',
  'period.all': 'Todos os dados',
  'period.months_one': '{count} mês',
  'period.months_other': '{count} meses',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Total de Candidaturas',
  'stats.totalApplications.short': 'Tot.',
  'stats.pending': 'Pendentes',
  'stats.granted': 'Concedidas',
  'stats.denied': 'Recusadas',
  'stats.approvalRate': 'Taxa de Aprovação',
  'stats.approvalRate.short': 'Aprovação',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} m/m',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Transitadas',
  'metric.pending': 'Pendentes (transitadas)',
  'metric.received': 'Recebidas',
  'metric.processed': 'Processadas',
  'metric.granted': 'Concedidas',
  'metric.denied': 'Recusadas',
  'metric.other': 'Outras',
  'metric.approvalRate': 'Taxa de aprovação',
  'metric.completion': 'Conclusão',
  'metric.applications': 'Candidaturas',
  'metric.population': 'População',
  'metric.area': 'Área',
  'metric.density': 'Densidade',
  'common.noDataForFilters': 'Sem dados para esta combinação de filtros.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Ver tabela de dados',
  'table.hide': 'Ocultar tabela de dados',
  'table.downloadCsv': 'Transferir CSV',
  'table.month': 'Mês',
  'table.prefecture': 'Prefeitura',
  'table.shareOfTotal': 'Quota do total',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Estimador de Tempo de Processamento',
  'estimator.description':
    'Estimativa baseada num modelo de fila a partir do volume de processamento do gabinete nos últimos seis meses.',
  'estimator.selectBureau': 'Selecionar Gabinete',
  'estimator.selectType': 'Selecionar Tipo',
  'estimator.applicationDate': 'Data da Candidatura',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': 'Editar os dados do seu pedido',
  'estimator.empty':
    'Selecione o seu gabinete, o tipo de candidatura e a data da candidatura para estimar quando a sua candidatura será processada.',
  'estimator.estimatedCompletion': 'Conclusão estimada',
  'estimator.queuePosition': 'Posição na fila',
  'estimator.aheadOfYou': '≈ {count} à sua frente',
  'estimator.howCalculated': 'Como é feito este cálculo?',
  'estimator.showMath': 'Mostrar o cálculo',
  'estimator.hideMath': 'Ocultar o cálculo',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': 'Repor o estimador',
  'estimator.resetAria': 'Repor o Estimador de Tempo de Processamento',
  'estimator.collapse': 'Recolher o estimador',
  'estimator.collapseAria': 'Recolher o Estimador de Tempo de Processamento',
  'estimator.close': 'Fechar o estimador',
  'estimator.closeAria': 'Fechar o Estimador de Tempo de Processamento',
  'estimator.copyPermalink': 'Copiar uma hiperligação permanente para esta estimativa',
  'estimator.copied': 'Copiado!',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} dia',
  'estimator.uncertaintyDays_other': '± {count} dias',
  'estimator.uncertaintyWeeks_one': '± {count} semana',
  'estimator.uncertaintyWeeks_other': '± {count} semanas',
  'estimator.basedOnMonths_one': 'com base em {count} mês de volume processado',
  'estimator.basedOnMonths_other': 'com base em {count} meses de volume processado',
  // Warnings.
  'estimator.limitedDataTitle': 'Estimativa com dados limitados:',
  'estimator.limitedDataBody_one':
    'A data da sua candidatura está além dos dados disponíveis. Esta estimativa baseia-se em taxas de processamento simuladas a partir de {count} mês de dados históricos e pode ser menos precisa.',
  'estimator.limitedDataBody_other':
    'A data da sua candidatura está além dos dados disponíveis. Esta estimativa baseia-se em taxas de processamento simuladas a partir de {count} meses de dados históricos e pode ser menos precisa.',
  'estimator.pastDueTitle': 'Possivelmente em atraso:',
  'estimator.pastDueBody':
    'Com base nas taxas de processamento esperadas, a conclusão desta candidatura poderá estar em atraso. Se ainda não recebeu pedidos adicionais e/ou uma decisão sobre esta candidatura, contacte o gabinete para mais informações.',
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    '*Isto é uma {emphasis} baseada nas taxas de processamento atuais, na posição esperada na fila e nas candidaturas pendentes. O tempo real de processamento da sua candidatura pode variar.',
  'estimator.disclaimerEmphasis': 'estimativa',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Base de produtividade',
  'estimator.formula.step2': 'Fila na data do pedido',
  'estimator.formula.step3': 'Tratado desde o pedido',
  'estimator.formula.step4': 'Posição na fila e dias restantes',
  'estimator.formula.step5': 'Dias inteiros e margem',
  'estimator.formula.explainAria': 'Explicar as variáveis da fórmula {title}',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': 'Total tratado',
  'estimator.formula.var.sigmaP.description':
    'Pedidos concluídos no período amostrado, ou seja, os últimos seis meses publicados, ou menos se os dados terminarem antes.',
  'estimator.formula.var.sigmaN.title': 'Total recebido',
  'estimator.formula.var.sigmaN.description': 'Pedidos recebidos nesse mesmo período amostrado.',
  'estimator.formula.var.sigmaD.title': 'Total de dias',
  'estimator.formula.var.sigmaD.description': 'Dias de calendário do período amostrado, somados mês a mês.',
  'estimator.formula.var.rProc.title': 'Ritmo de tratamento',
  'estimator.formula.var.rProc.description':
    'Pedidos concluídos por dia, em média ao longo de todo o período amostrado.',
  'estimator.formula.var.rNew.title': 'Ritmo de entrada',
  'estimator.formula.var.rNew.description': 'Pedidos recebidos por dia, em média ao longo desse mesmo período.',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': 'Total do mês anterior',
  'estimator.formula.var.tPrev.description':
    'Todos os pedidos em carteira no mês anterior ao seu: o transporte mais as novas entradas.',
  'estimator.formula.var.pPrev.title': 'Tratado no mês anterior',
  'estimator.formula.var.pPrev.description': 'Pedidos concluídos durante o mês anterior ao seu.',
  'estimator.formula.var.cSeed.title': 'Início da simulação',
  'estimator.formula.var.cSeed.description':
    'O último transporte publicado, usado como ponto de partida quando o mês anterior ao seu não tem números próprios.',
  'estimator.formula.var.mSim.title': 'Meses simulados',
  'estimator.formula.var.mSim.description':
    'Quantos meses o transporte foi projetado até alcançar o mês do seu pedido.',
  'estimator.formula.var.cPrev.title': 'Transporte',
  'estimator.formula.var.cPrev.description':
    'Pedidos ainda à espera no início do mês do seu pedido. Retirado do mês anterior quando este está publicado e, caso contrário, projetado mês a mês a partir do último mês com números.',
  'estimator.formula.var.nMonth.title': 'Recebido no mês',
  'estimator.formula.var.nMonth.description': 'Pedidos recebidos ao longo de todo o mês do seu pedido.',
  'estimator.formula.var.pMonth.title': 'Tratado no mês',
  'estimator.formula.var.pMonth.description': 'Pedidos concluídos ao longo de todo o mês do seu pedido.',
  'estimator.formula.var.dMonth.title': 'Dias do mês',
  'estimator.formula.var.dMonth.description':
    'Dias de calendário do mês do seu pedido, usados para repartir os totais mensais por igual pelos dias.',
  'estimator.formula.var.aDay.title': 'Dia do pedido',
  'estimator.formula.var.aDay.description': 'Em que dia do mês apresentou, isto é, até onde a fila se tinha acumulado.',
  'estimator.formula.var.nApp.title': 'Recebido antes de si',
  'estimator.formula.var.nApp.description':
    'Pedidos recebidos mais cedo no mês do seu pedido, repartidos proporcionalmente até ao dia em que apresentou.',
  'estimator.formula.var.pApp.title': 'Tratado antes de si',
  'estimator.formula.var.pApp.description':
    'Pedidos concluídos mais cedo no mês do seu pedido, repartidos da mesma maneira.',
  'estimator.formula.var.qApp.title': 'Fila no pedido',
  'estimator.formula.var.qApp.description': 'Quantos pedidos estavam à frente do seu no dia em que apresentou.',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': 'Tratado nos meses seguintes',
  'estimator.formula.var.pAfter.description':
    'Pedidos concluídos nos meses publicados posteriores ao mês do seu pedido.',
  'estimator.formula.var.tApp.title': 'Dias desde o pedido',
  'estimator.formula.var.tApp.description': 'Dias de calendário entre a data do seu pedido e hoje.',
  'estimator.formula.var.tData.title': 'Dias desde os dados',
  'estimator.formula.var.tData.description': 'Dias de calendário entre o fim do último mês publicado e hoje.',
  'estimator.formula.var.cProc.title': 'Tratado confirmado',
  'estimator.formula.var.cProc.description':
    'Conclusões posteriores ao seu pedido que os números publicados já contemplam.',
  'estimator.formula.var.eProc.title': 'Tratado projetado',
  'estimator.formula.var.eProc.description':
    'Pedidos que se presumem concluídos no troço que os números publicados ainda não cobrem. Fica negativo quando esses números já ultrapassam o que o ritmo médio previa.',
  'estimator.formula.var.sProc.title': 'Tratado desde então',
  'estimator.formula.var.sProc.description':
    'Tudo o que foi despachado desde que apresentou: o confirmado e o projetado em conjunto, arredondados a pedidos inteiros.',
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': 'Posição na fila',
  'estimator.formula.var.qPos.description':
    'Quantos pedidos continuam à frente do seu. Zero ou menos significa que a estimativa já passou.',
  'estimator.formula.var.dRem.title': 'Dias restantes',
  'estimator.formula.var.dRem.description': 'Dias necessários para escoar o resto da fila ao ritmo atual.',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': 'Dias inteiros',
  'estimator.formula.var.dEst.description':
    'Os dias restantes arredondados afastando-se de zero: o desvio somado a hoje para dar a data mostrada acima.',
  'estimator.formula.var.sigmaR.title': 'Dispersão do ritmo',
  'estimator.formula.var.sigmaR.description':
    'Desvio-padrão dos ritmos mensais de tratamento, ou seja, quanto o passo varia de mês para mês.',
  'estimator.formula.var.rBar.title': 'Ritmo mensal médio',
  'estimator.formula.var.rBar.description':
    'A média dos ritmos mensais com peso igual por mês, e não ponderada pelo volume.',
  'estimator.formula.var.uDays.title': 'Incerteza',
  'estimator.formula.var.uDays.description':
    'A margem ± apresentada junto ao resultado: quanto a estimativa se desloca se o passo variar tanto como tem variado.',

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Entradas e Processamento',
  'charts.intake.description':
    'Candidaturas transitadas e recebidas em cada mês, face ao volume concluído pelos gabinetes e à parte desse volume que foi concedida.',
  'charts.intake.aria':
    'Barras empilhadas de candidaturas pendentes e recebidas por mês, com o volume processado representado por uma linha e a taxa de aprovação por uma segunda linha num eixo à direita de zero a cem por cento',
  'charts.types.label': 'Tipos de Candidatura',
  'charts.types.description':
    'Novas submissões mensais discriminadas por tipo de candidatura — clique numa entrada da legenda para ativar ou desativar uma série.',
  'charts.types.aria': 'Gráfico de linhas das novas submissões mensais por tipo de candidatura',
  'charts.outcomes.label': 'Resultados',
  'charts.outcomes.description':
    'Onde acabam as candidaturas: o fluxo de cada tipo para concedidas, recusadas ou outros resultados.',
  'charts.outcomes.aria': 'Diagrama de Sankey dos tipos de candidatura a fluir para os resultados',
  'charts.share.label': 'Quota por Gabinete',
  'charts.share.description': 'Onde as candidaturas foram submetidas: a quota de cada gabinete no total de entradas.',
  'charts.share.aria': 'Gráfico circular (donut) da quota de cada gabinete nas candidaturas recebidas',
  'charts.mix.label': 'Distribuição por Categoria',
  'charts.mix.description':
    'Todas as candidaturas por tipo e gabinete — clique numa categoria para ampliar a sua discriminação.',
  'charts.efficiency.label': 'Eficiência de Processamento',
  'charts.efficiency.description':
    'Gabinetes classificados pela taxa de conclusão — a espessura da haste representa o volume de entradas, com a taxa nacional como referência.',
  'charts.efficiency.aria':
    'Gabinetes classificados pela taxa de conclusão, com o volume de entradas representado pela espessura da haste',
  'charts.map.label': 'Mapa Regional',
  'charts.map.description':
    'Áreas de serviço dos gabinetes e densidade populacional, com a localização dos gabinetes e gabinetes aeroportuários.',
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria':
    'Gráfico sunburst de candidaturas por tipo e gabinete, com exploração interativa em profundidade',
  'charts.efficiencyQuadrant.aria':
    'Gráfico de quadrantes da taxa de conclusão face ao volume recebido por gabinete; o tamanho da bolha indica o volume processado',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Mostrar {series}',
  'chart.legendHide': 'Ocultar {series}',
  'chart.allSeriesHidden': 'Todas as séries ocultas — clique numa entrada da legenda para mostrar uma.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Aquisição',
  'chart.types.series.extension': 'Prorrogação',
  'chart.types.series.change': 'Mudança de Estatuto',
  'chart.types.series.activity': 'Autorização de Atividade',
  'chart.types.series.reentry': 'Reentrada',
  'chart.types.series.permanent': 'Residência Permanente',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Outro / Retirado',
  'chart.outcomes.valueUnit': 'candidaturas',
  'chart.outcomes.tooltipValueLabel': 'Candidaturas',
  'chart.outcomes.tooltipFlowLabel': 'Fluxo',
  'chart.outcomes.approvalRate': 'Aprovação',
  'chart.outcomes.ofProcessed': 'de {count} candidaturas processadas',
  'chart.outcomes.empty': 'Sem candidaturas processadas neste período.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Outros ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Todas as candidaturas',
  'chart.mix.breadcrumbAria': 'Caminho de exploração do treemap',
  'chart.mix.zoomInHint': 'Clique numa categoria para ampliar',
  'chart.mix.zoomOutHint': 'Clique no fundo (ou prima Esc) para reduzir',
  'chart.mix.zoomInHintTap': 'Toque numa categoria para a ver, toque novamente para ampliar',
  'chart.mix.zoomOutHintTap': 'Toque no fundo para reduzir',
  'chart.mix.others': 'Outros',
  'chart.mix.categoryAria': '{category}: {count} candidaturas. Ampliar.',
  'chart.mix.tooltipValue': '{count} candidaturas · {percent} de {scope}',
  'chart.mix.scopeAll': 'todas as candidaturas',
  'chart.mix.sunburstHint': '{trail} — {count} candidaturas ({percent} do total)',
  'chart.sunburst.hintClick': 'Clique num segmento para ampliar · passe o cursor para o ver',
  'chart.sunburst.hintTap': 'Toque num segmento para o ver, toque novamente para ampliar',
  'chart.sunburst.zoomOutClick': 'Clique no centro para reduzir',
  'chart.sunburst.zoomOutTap': 'Toque no centro para reduzir',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'sucursal',
  'chart.efficiency.receivedCount': '{count} recebidas',
  'chart.efficiency.nationwide': 'Nacional {rate}',
  'chart.efficiency.pointAria': '{bureau}: {rate} por cento de conclusão, {count} candidaturas recebidas',
  'chart.efficiency.xAxis': 'Candidaturas recebidas',
  'chart.efficiency.fullCompletion': '100% das entradas concluído',
  'chart.efficiency.quadrantKeepingPace': 'VOLUME ELEVADO · A ACOMPANHAR O RITMO',
  'chart.efficiency.quadrantFallingBehind': 'VOLUME ELEVADO · A FICAR PARA TRÁS',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Gabinete de {bureau}',
  'map.airportMarkerAria': 'Gabinete aeroportuário de {bureau}',
  'map.bureauSuffix': 'Gabinete de {bureau}',
  'map.airportSuffix': 'Gabinete Aeroportuário de {bureau}',
  'map.servicePopulation': 'População servida',
  'map.serviceArea': 'Área de serviço',
  'map.serviceBureau': 'Gabinete responsável',
  'map.portOfEntry': 'Posto de entrada',
  'map.legendNote': 'Cor = gabinete responsável · intensidade = densidade populacional',
  'map.bureau': 'Gabinete',
  'map.airportOffice': 'Gabinete aeroportuário',
  'map.loadError': 'Não foi possível carregar os dados do mapa. Tente recarregar a página.',
  'map.loading': 'A carregar os dados do mapa...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Registo de Alterações',
  'changelog.loading': 'A carregar...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Erro ao Carregar os Dados',
  'errors.noData': 'Sem dados disponíveis',
  'errors.unknown': 'Ocorreu um erro desconhecido',
  'errors.fetchFailed': 'Falha ao obter os dados',
  'errors.renderTitle': 'Algo correu mal',
  'errors.renderBody': 'Ocorreu um erro ao apresentar a aplicação.',
  'errors.reload': 'Recarregar Página',
  'errors.changelogUnavailable': 'Não foi possível carregar o registo de alterações.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'A mostrar {chart} para {bureau}',
  'a11y.showingChartWithType': 'A mostrar {chart} para {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': 'Estatísticas oficiais fornecidas pela Agência de Serviços de Imigração do Japão',
  'footer.dataAcquisition': 'Aquisição de dados fornecida por {source}',
  'footer.fixtureNotice': 'a mostrar dados fictícios gerados',
  'footer.builtBy': 'Criado por {author}',
  'footer.dataUpdated': 'dados atualizados em {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; leave it as the Latin code in most languages.
  'bureau.all': 'Nacional',
  'bureau.all.short': 'TODOS',
  'bureau.all.compact': 'Nacional',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Aeroporto de Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Aeroporto de Narita',
  'bureau.101200': 'Aeroporto de Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Aeroporto de Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Aeroporto de Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Aeroporto de Chubu',
  'bureau.101460': 'Osaca',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaca',
  'bureau.101480': 'Aeroporto de Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Aeroporto de Kansai',
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
  'appType.all': 'Todos os Tipos',
  'appType.all.short': 'TODOS',
  'appType.all.compact': 'Todos',
  'appType.10': 'Aquisição de Estatuto',
  'appType.10.short': 'AQU',
  'appType.10.compact': 'Aquisição',
  'appType.20': 'Prorrogação de Estadia',
  'appType.20.short': 'PRO',
  'appType.20.compact': 'Prorrogação',
  'appType.30': 'Mudança de Estatuto',
  'appType.30.short': 'MUD',
  'appType.30.compact': 'Mudança',
  'appType.40': 'Autorização de Atividades',
  'appType.40.short': 'ATV',
  'appType.40.compact': 'Autorização',
  'appType.50': 'Reentrada',
  'appType.50.short': 'REE',
  'appType.50.compact': 'Reentrada',
  'appType.60': 'Residência Permanente',
  'appType.60.short': 'RP',
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
  'prefecture.13': 'Tóquio',
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
  'prefecture.26': 'Quioto',
  'prefecture.27': 'Osaca',
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
  'dataset.label': 'Conjunto de dados',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Escolha o conjunto de dados a explorar',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Tratamento de pedidos',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Tratamento',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'População estrangeira residente',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Residentes',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable': 'Os dados da população estrangeira residente não estão disponíveis de momento.',
  'charts.growth.label': 'Crescimento da População',
  'charts.growth.description': 'A população estrangeira residente completa, semestre a semestre, empilhada por finalidade de permanência ou por região do mundo.',
  'charts.growth.aria': 'Gráfico de barras empilhadas do total de residentes estrangeiros por semestre, dividido por grupo de status ou região',
  'charts.origins.label': 'Origens ao longo do tempo',
  'charts.origins.description':
    'Como as principais nacionalidades cresceram ou diminuíram em cada semestre abrangido pelas estatísticas.',
  'charts.origins.aria': 'Gráfico de áreas empilhadas do número de residentes por nacionalidade ao longo do tempo',
  'charts.flows.label': 'Da Origem ao Status',
  'charts.flows.description': 'Regiões do mundo fluindo por países até as finalidades de permanência — escolha uma região ou nacionalidade para seguir o seu perfil.',
  'charts.flows.aria': 'Diagrama de Sankey de residentes fluindo das regiões do mundo, por países, até as categorias de status de residência',
  'charts.statuses.label': 'Composição dos estatutos de residência',
  'charts.statuses.description':
    'Que vistos os residentes possuem, agrupados por finalidade da estadia — clique num grupo para o desdobrar.',
  'charts.statuses.aria': 'Gráfico sunburst de residentes por grupo de status de residência e status individual',
  'charts.worldmap.label': 'Origens no mundo',
  'charts.worldmap.description':
    'De onde vêm os residentes estrangeiros no Japão, sombreado consoante quantos têm cada nacionalidade.',
  'charts.worldmap.aria': 'Mapa-múndi sombreado consoante o número de residentes de cada país de origem',
  'charts.movers.label': 'Maiores variações',
  'charts.movers.description':
    'Os maiores aumentos e quebras entre dois períodos, por nacionalidade ou por estatuto de residência.',
  'charts.movers.aria': 'Gráfico de barras divergentes com os maiores aumentos e quebras entre dois períodos',

  'filters.region': 'Região',
  'filters.allRegions': 'Todas as regiões',
  'filters.nationality': 'Nacionalidade',
  'filters.residenceStatus': 'Estatuto de residência',
  'filters.allNationalities': 'Todas as nacionalidades',
  'filters.allStatuses': 'Todos os estatutos',
  'filters.allCategories': 'Todas as categorias',

  'period.snapshotLabel': 'Período do retrato',
  'period.latestPeriod': 'Último período',
  'period.years_one': '{count} ano',
  'period.years_other': '{count} anos',

  'residents.total': 'Residentes estrangeiros',
  'residents.total.short': 'Residentes',
  'residents.delta': '{delta} face ao semestre anterior',
  'residents.populationShare': 'Parcela da População',
  'residents.populationShare.short': 'Parcela da pop.',
  'residents.populationShareOf': 'da população do Japão ({population} pessoas)',
  'residents.topNationality': 'Nacionalidade mais numerosa',
  'residents.topNationality.short': 'Maior origem',
  'residents.topStatus': 'Estatuto mais frequente',
  'residents.topStatus.short': 'Maior status',
  'residents.share': '{share} do total',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Outras nacionalidades',
  'residents.noMapArea': '{count} nacionalidades não têm território no mapa e ficam por sombrear.',
  'residents.legendScale': 'Residentes',
  'residents.discontinued': 'A série termina em {period}: a categoria foi fundida ou mudou de nome.',
  'residents.comparePeriod': 'face a {period}',
  'residents.byNationality': 'Por nacionalidade',
  'residents.byStatus': 'Por estatuto de residência',
  'residents.increase': 'Subida',
  'residents.decrease': 'Descida',
  'residents.asOf': 'A {period}',
  'residents.noChange': 'Não há variação apreciável entre estes dois períodos.',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': 'Por finalidade',
  'residents.stackByRegion': 'Por região do mundo',
  'residents.stackByNationality': 'Por nacionalidade',
  'residents.growthTotal': 'Total geral',
  'residents.viewAbsolute': 'Contagem',
  'residents.viewIndexed': 'Crescimento (indexado)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': 'residentes',
  'residents.flowsTooltipValueLabel': 'Residentes',
  'residents.flowsTooltipFlowLabel': 'Fluxo',
  'residents.sunburstHint': '{trail} — {count} residentes ({percent} do total)',
  'residents.markerSsw.title': 'Lançamento do visto Specified Skilled Worker',
  'residents.markerSsw.description': 'O visto de abril de 2019 abriu mais de uma dezena de setores a trabalhadores estrangeiros qualificados.',
  'residents.markerCovid.title': 'Fechamento de fronteiras na COVID-19',
  'residents.markerCovid.description': 'As restrições de entrada congelaram as novas chegadas; a população caiu até meados de 2022.',
  'residents.markerKoreaSplit.title': 'Separação estatística da Coreia',
  'residents.markerKoreaSplit.description': 'A Coreia (combinada) tornou-se séries separadas de Coreia do Sul e Coreia (Chosen) — mudança de registro, não de população.',

  'statusGroup.work': 'Trabalho',
  'statusGroup.training': 'Formação',
  'statusGroup.study': 'Estudos',
  'statusGroup.family': 'Família',
  'statusGroup.residency': 'Residência',
  'statusGroup.other': 'Outros',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'Ásia',
  'region.2000': 'Europa',
  'region.3000': 'África',
  'region.4000': 'América do Norte',
  'region.5000': 'América do Sul',
  'region.6000': 'Oceania',
  'region.7000': 'Apátrida',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': 'Coreia (Chosen)',
  'nationality.1130': 'Coreia (agregada)',
  'nationality.2290': 'Sérvia e Montenegro',
  'nationality.2500': 'Jugoslávia',
  'nationality.7000': 'Apátrida',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Total geral',
  'status.1040': 'Professor universitário',
  'status.1050': 'Artista',
  'status.1060': 'Atividades religiosas',
  'status.1070': 'Jornalista',
  'status.1080': 'Profissional altamente qualificado',
  'status.1090': 'Profissional altamente qualificado (i)(a)',
  'status.1100': 'Profissional altamente qualificado (i)(b)',
  'status.1110': 'Profissional altamente qualificado (i)(c)',
  'status.1120': 'Profissional altamente qualificado (ii)',
  'status.1130': 'Investidor / gestor de empresa',
  'status.1140': 'Gestão de empresa',
  'status.1150': 'Serviços jurídicos e de contabilidade',
  'status.1160': 'Serviços médicos',
  'status.1170': 'Investigação',
  'status.1180': 'Docente',
  'status.1190': 'Engenharia',
  'status.1200': 'Especialista em humanidades / serviços internacionais',
  'status.1210': 'Engenharia / humanidades / serviços internacionais',
  'status.1220': 'Transferência dentro da empresa',
  'status.1230': 'Cuidados de enfermagem',
  'status.1240': 'Artista de espetáculo',
  'status.1250': 'Trabalho especializado',
  'status.1260': 'Trabalhador com competências específicas',
  'status.1270': 'Trabalhador com competências específicas (i)',
  'status.1280': 'Trabalhador com competências específicas (ii)',
  'status.1290': 'Estágio técnico',
  'status.1300': 'Estágio técnico (i)(a)',
  'status.1310': 'Estágio técnico (i)(b)',
  'status.1320': 'Estágio técnico (ii)(a)',
  'status.1330': 'Estágio técnico (ii)(b)',
  'status.1340': 'Estágio técnico (iii)(a)',
  'status.1350': 'Estágio técnico (iii)(b)',
  'status.1360': 'Atividades culturais',
  'status.1380': 'Estudante',
  'status.1400': 'Estagiário',
  'status.1410': 'Familiar a cargo',
  'status.1420': 'Atividades designadas',
  'status.1430': 'Residente permanente',
  'status.1440': 'Cônjuge ou filho de cidadão japonês',
  'status.1450': 'Cônjuge ou filho de residente permanente',
  'status.1460': 'Residente de longa duração',
  'status.1470': 'Residente permanente especial',
  'residents.mixRoot': 'Todos os residentes',
  'residents.mixScopeAll': 'todos os residentes',
  'residents.mixCategoryAria': '{category}: {count} residentes. Ampliar.',
  'residents.mixTooltipValue': '{count} residentes · {percent} de {scope}',
};
