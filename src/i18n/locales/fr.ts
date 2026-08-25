// src/i18n/locales/fr.ts
// French overrides. Full coverage of the English catalogue.
//
// French distinguishes `_one` (0 and 1) from `_other` (everything else) for
// plural families, same shape as English though the boundary differs.
import type { Dictionary } from '../types';

export const fr: Dictionary = {
  // ── App shell ────────────────────────────────────────────────────────────
  'app.title': "Statistiques de l'immigration japonaise",
  'app.subtitle': 'Données de traitement des bureaux fournies par e-Stat, mises à jour à chaque publication',
  'app.skipToContent': 'Passer au contenu',
  'app.loadingData': "Analyse des données d'immigration en cours...",
  'app.loadingDashboard': 'Chargement du tableau de bord...',
  'app.retry': 'Réessayer',

  // ── Document metadata ────────────────────────────────────────────────────
  // Read at module scope by src/app/layout.tsx. The static export prerenders
  // one HTML document, so these can't vary per visitor — they live here to
  // keep one source of truth, and to be ready for per-locale routes.
  'meta.title': "Tableau de bord des statistiques de l'immigration japonaise",
  'meta.description':
    "Délais de traitement des visas, charge de travail des bureaux et un estimateur basé sur un modèle de file d'attente pour votre propre demande - fondé sur les statistiques officielles de l'Agence des services de l'immigration, mis à jour à chaque nouvelle publication d'e-Stat (généralement mensuelle).",
  'meta.keywords':
    "Délais de traitement des visas au Japon, statistiques des bureaux d'immigration, suivi de demande de visa, Agence des services de l'immigration, e-Stat",

  // ── Header and settings drawer ───────────────────────────────────────────
  'nav.version': 'v{version}',
  'nav.language': 'Langue',
  'nav.switchToLightTheme': 'Passer au thème clair',
  'nav.switchToDarkTheme': 'Passer au thème sombre',
  'nav.openSettings': 'Ouvrir le menu des paramètres',
  'nav.settings': 'Paramètres',
  'nav.theme': 'Thème',
  'nav.themeLight': 'Clair',
  'nav.themeDark': 'Sombre',
  'nav.about': 'À propos',
  'nav.changelog': 'Journal des modifications',
  'nav.sourceCode': 'Code source',

  // ── Dashboard chrome ─────────────────────────────────────────────────────
  'dashboard.dataCoverage': 'Données : {range}',
  'dashboard.coverageRange': '{from} – {to}',
  'dashboard.comparisonSuffix': '(comparaison)',
  'dashboard.expandEstimator': "Développer l'estimateur de délai de traitement",
  'dashboard.estimatorRail': 'Estimateur',

  // ── Filters ──────────────────────────────────────────────────────────────
  'filters.bureau': "Bureau d'immigration",
  'filters.appType': 'Type de demande',
  'filters.compare': 'Comparer avec',
  'filters.compareNone': 'Aucun',
  'filters.excludeAirports': 'Exclure les bureaux aéroportuaires',
  'filters.includeAirports': 'Inclure les bureaux aéroportuaires',
  'filters.reset': 'Réinitialiser les filtres',
  'filters.selectPlaceholder': 'Sélectionner',

  // ── Time range selector ──────────────────────────────────────────────────
  'period.label': 'Période',
  'period.latest': 'Dernier mois',
  'period.all': 'Toutes les données',
  'period.months_one': '{count} mois',
  'period.months_other': '{count} mois',

  // ── Stat tiles ───────────────────────────────────────────────────────────
  'stats.totalApplications': 'Total des demandes',
  'stats.totalApplications.short': 'Tot.',
  'stats.pending': 'En attente',
  'stats.granted': 'Accordées',
  'stats.denied': 'Refusées',
  'stats.approvalRate': "Taux d'acceptation",
  'stats.approvalRate.short': 'Acceptation',
  'stats.scopeWithType': '{bureau} ({type})',
  // "MoM" = month over month; the delta is already signed and formatted.
  'stats.momDelta': '{delta} m/m',

  // ── Shared vocabulary ────────────────────────────────────────────────────
  // Metric names reused across the table, chart legends, and hover cards.
  'metric.carriedOver': 'Reportées',
  'metric.pending': 'En attente (reportées)',
  'metric.received': 'Reçues',
  'metric.processed': 'Traitées',
  'metric.granted': 'Accordées',
  'metric.denied': 'Refusées',
  'metric.other': 'Autres',
  'metric.completion': 'Achèvement',
  'metric.applications': 'Demandes',
  'metric.population': 'Habitants',
  'metric.area': 'Superficie',
  'metric.density': 'Densité',
  'common.noDataForFilters': 'Aucune donnée pour cette combinaison de filtres.',

  // ── Data table ───────────────────────────────────────────────────────────
  'table.view': 'Afficher le tableau de données',
  'table.hide': 'Masquer le tableau de données',
  'table.downloadCsv': 'Télécharger le CSV',
  'table.caption': 'Statistiques mensuelles des demandes pour {bureau}',
  'table.month': 'Mois',

  // ── Estimator ────────────────────────────────────────────────────────────
  'estimator.title': 'Estimateur de délai',
  'estimator.description':
    "Estimation fondée sur un modèle de file d'attente, à partir du débit du bureau sur les six derniers mois.",
  'estimator.selectBureau': 'Sélectionner un bureau',
  'estimator.selectType': 'Sélectionner un type',
  'estimator.applicationDate': 'Date de la demande',
  'estimator.selectionSummary': '{bureau} · {type} · {date}',
  'estimator.editDetails': 'Modifier les détails de votre demande',
  'estimator.empty':
    'Sélectionnez votre bureau, le type de demande et la date de la demande pour estimer quand votre demande sera traitée.',
  'estimator.estimatedCompletion': 'Achèvement estimé',
  'estimator.queuePosition': "Position dans la file d'attente",
  'estimator.aheadOfYou': '≈ {count} devant vous',
  'estimator.howCalculated': 'Comment ce calcul est-il effectué ?',
  'estimator.showMath': 'Afficher le calcul',
  'estimator.hideMath': 'Masquer le calcul',
  // Header controls: the tooltip is terse, the aria-label names the panel so
  // it stands alone out of context.
  'estimator.reset': "Réinitialiser l'estimateur",
  'estimator.resetAria': 'Réinitialiser l’estimateur de délai de traitement',
  'estimator.collapse': "Réduire l'estimateur",
  'estimator.collapseAria': "Réduire l'estimateur de délai de traitement",
  'estimator.close': "Fermer l'estimateur",
  'estimator.closeAria': "Fermer l'estimateur de délai de traitement",
  'estimator.copyPermalink': 'Copier un lien permanent vers cette estimation',
  'estimator.copied': 'Copié !',
  // Result note, joined with " · ".
  'estimator.uncertaintyDays_one': '± {count} jour',
  'estimator.uncertaintyDays_other': '± {count} jours',
  'estimator.uncertaintyWeeks_one': '± {count} semaine',
  'estimator.uncertaintyWeeks_other': '± {count} semaines',
  'estimator.basedOnMonths_one': 'sur la base de {count} mois de débit',
  'estimator.basedOnMonths_other': 'sur la base de {count} mois de débit',
  // Warnings.
  'estimator.limitedDataTitle': 'Estimation fondée sur des données limitées :',
  'estimator.limitedDataBody_one':
    'La date de votre demande dépasse les données disponibles. Cette estimation repose sur des taux de traitement simulés à partir de {count} mois de données historiques et pourrait être moins précise.',
  'estimator.limitedDataBody_other':
    'La date de votre demande dépasse les données disponibles. Cette estimation repose sur des taux de traitement simulés à partir de {count} mois de données historiques et pourrait être moins précise.',
  'estimator.pastDueTitle': 'Possiblement en retard :',
  'estimator.pastDueBody':
    "Compte tenu des taux de traitement attendus, le traitement de cette demande pourrait être en retard. Si vous n'avez pas encore reçu de demande complémentaire ni de décision concernant cette demande, veuillez contacter le bureau pour plus d'informations.",
  // {emphasis} is the word "estimate", rendered bold and underlined.
  'estimator.disclaimer':
    "*Il s'agit d'une {emphasis} fondée sur les taux de traitement actuels, la position attendue dans la file d'attente et les demandes en attente. Le délai de traitement réel de votre demande peut varier.",
  'estimator.disclaimerEmphasis': 'estimation',

  // ── Estimator: the "Show the math" breakdown ─────────────────────────────
  'estimator.formula.step1': 'Débit de référence',
  'estimator.formula.step2': "File d'attente au dépôt",
  'estimator.formula.step3': 'Traité depuis le dépôt',
  'estimator.formula.step4': 'Position dans la file et jours restants',
  'estimator.formula.step5': 'Jours entiers et marge',
  'estimator.formula.explainAria': 'Expliquer les variables de la formule {title}',
  // Step 1 — throughput baseline.
  'estimator.formula.var.sigmaP.title': 'Total traité',
  'estimator.formula.var.sigmaP.description':
    "Demandes traitées sur la période échantillonnée, soit les six derniers mois publiés, ou moins si les données s'arrêtent avant.",
  'estimator.formula.var.sigmaN.title': 'Total reçu',
  'estimator.formula.var.sigmaN.description': 'Demandes reçues sur cette même période échantillonnée.',
  'estimator.formula.var.sigmaD.title': 'Total des jours',
  'estimator.formula.var.sigmaD.description':
    'Jours calendaires de la période échantillonnée, additionnés mois par mois.',
  'estimator.formula.var.rProc.title': 'Cadence de traitement',
  'estimator.formula.var.rProc.description':
    'Demandes traitées par jour, en moyenne sur toute la période échantillonnée.',
  'estimator.formula.var.rNew.title': 'Cadence de dépôt',
  'estimator.formula.var.rNew.description': 'Demandes reçues par jour, en moyenne sur cette même période.',
  // Step 2 — the queue on the application date.
  'estimator.formula.var.tPrev.title': 'Total du mois précédent',
  'estimator.formula.var.tPrev.description':
    'Ensemble des demandes en portefeuille le mois précédant le vôtre : le report plus les nouvelles arrivées.',
  'estimator.formula.var.pPrev.title': 'Traité le mois précédent',
  'estimator.formula.var.pPrev.description': 'Demandes traitées durant le mois précédant le vôtre.',
  'estimator.formula.var.cSeed.title': 'Point de départ de la simulation',
  'estimator.formula.var.cSeed.description':
    "Dernier report publié, utilisé comme point de départ lorsque le mois précédant le vôtre n'a pas de chiffres propres.",
  'estimator.formula.var.mSim.title': 'Mois simulés',
  'estimator.formula.var.mSim.description':
    'Nombre de mois sur lesquels le report a été projeté pour atteindre votre mois de dépôt.',
  'estimator.formula.var.cPrev.title': 'Report',
  'estimator.formula.var.cPrev.description':
    "Demandes encore en attente à l'ouverture de votre mois de dépôt. Reprise du mois précédent lorsqu'il est publié, sinon projetée mois après mois depuis le dernier mois chiffré.",
  'estimator.formula.var.nMonth.title': 'Reçu dans le mois',
  'estimator.formula.var.nMonth.description': "Demandes reçues sur l'ensemble de votre mois de dépôt.",
  'estimator.formula.var.pMonth.title': 'Traité dans le mois',
  'estimator.formula.var.pMonth.description': "Demandes traitées sur l'ensemble de votre mois de dépôt.",
  'estimator.formula.var.dMonth.title': 'Jours du mois',
  'estimator.formula.var.dMonth.description':
    'Jours calendaires de votre mois de dépôt, servant à répartir uniformément les totaux mensuels sur les jours.',
  'estimator.formula.var.aDay.title': 'Jour du dépôt',
  'estimator.formula.var.aDay.description':
    "Le quantième auquel vous avez déposé, c'est-à-dire jusqu'où la file s'était accumulée dans le mois.",
  'estimator.formula.var.nApp.title': 'Reçu avant vous',
  'estimator.formula.var.nApp.description':
    "Demandes reçues plus tôt dans votre mois de dépôt, calculées au prorata jusqu'au jour du dépôt.",
  'estimator.formula.var.pApp.title': 'Traité avant vous',
  'estimator.formula.var.pApp.description':
    'Demandes traitées plus tôt dans votre mois de dépôt, au prorata de la même façon.',
  'estimator.formula.var.qApp.title': 'File au dépôt',
  'estimator.formula.var.qApp.description': 'Nombre de demandes qui précédaient la vôtre le jour du dépôt.',
  // Step 3 — progress since the application date.
  'estimator.formula.var.pAfter.title': 'Traité les mois suivants',
  'estimator.formula.var.pAfter.description':
    'Demandes traitées durant les mois publiés qui suivent votre mois de dépôt.',
  'estimator.formula.var.tApp.title': 'Jours depuis le dépôt',
  'estimator.formula.var.tApp.description': "Jours calendaires entre votre date de dépôt et aujourd'hui.",
  'estimator.formula.var.tData.title': 'Jours depuis les données',
  'estimator.formula.var.tData.description': "Jours calendaires entre la fin du dernier mois publié et aujourd'hui.",
  'estimator.formula.var.cProc.title': 'Traité confirmé',
  'estimator.formula.var.cProc.description':
    'Demandes traitées depuis votre dépôt que les chiffres publiés couvrent déjà.',
  'estimator.formula.var.eProc.title': 'Traité projeté',
  'estimator.formula.var.eProc.description':
    "Demandes supposées traitées sur l'intervalle que les chiffres publiés ne couvrent pas encore. Devient négatif lorsque ces chiffres dépassent déjà ce que la cadence moyenne prévoyait.",
  'estimator.formula.var.sProc.title': 'Traité depuis',
  'estimator.formula.var.sProc.description':
    "Tout ce qui a été traité depuis votre dépôt : le confirmé et le projeté réunis, arrondis à l'unité.",
  // Step 4 — position in the queue, and how long it takes to clear.
  'estimator.formula.var.qPos.title': 'Position dans la file',
  'estimator.formula.var.qPos.description':
    "Nombre de demandes encore devant la vôtre. Zéro ou moins signifie que l'estimation est déjà dépassée.",
  'estimator.formula.var.dRem.title': 'Jours restants',
  'estimator.formula.var.dRem.description':
    'Jours nécessaires pour résorber le reste de la file à la cadence actuelle.',
  // Step 5 — the whole-day offset, and the spread around it.
  'estimator.formula.var.dEst.title': 'Jours entiers',
  'estimator.formula.var.dEst.description':
    "Les jours restants arrondis en s'éloignant de zéro : le décalage ajouté à aujourd'hui pour obtenir la date affichée plus haut.",
  'estimator.formula.var.sigmaR.title': 'Dispersion de la cadence',
  'estimator.formula.var.sigmaR.description':
    "Écart type des cadences mensuelles de traitement, c'est-à-dire l'ampleur des variations d'un mois sur l'autre.",
  'estimator.formula.var.rBar.title': 'Cadence mensuelle moyenne',
  'estimator.formula.var.rBar.description':
    'Moyenne des cadences mensuelles à poids égal par mois, et non pondérée par le volume.',
  'estimator.formula.var.uDays.title': 'Incertitude',
  'estimator.formula.var.uDays.description':
    "La marge ± affichée à côté du résultat : de combien l'estimation bouge si la cadence varie autant qu'elle l'a fait récemment.",

  // ── Charts: registry ─────────────────────────────────────────────────────
  // `.label` names the tab and the card heading, `.description` is the card
  // subtitle, `.aria` describes the graphic to a screen reader.
  'charts.intake.label': 'Réception et traitement',
  'charts.intake.description': 'Demandes reportées et reçues chaque mois, comparées au volume traité par les bureaux.',
  'charts.intake.aria': 'Barres empilées des demandes en attente et reçues par mois, avec le volume traité en courbe',
  'charts.types.label': 'Types de demandes',
  'charts.types.description':
    'Nouvelles soumissions mensuelles réparties par type de demande — cliquez sur une entrée de légende pour afficher ou masquer une série.',
  'charts.types.aria': 'Graphique linéaire des nouvelles soumissions mensuelles par type de demande',
  'charts.outcomes.label': 'Résultats',
  'charts.outcomes.description':
    'Ce que deviennent les demandes : le flux de chaque type vers les décisions accordées, refusées ou autres.',
  'charts.outcomes.aria': 'Diagramme de Sankey des types de demandes vers leurs résultats',
  'charts.share.label': 'Répartition par bureau',
  'charts.share.description':
    'Où les demandes ont été déposées : la part de chaque bureau dans le total des demandes reçues.',
  'charts.share.aria': 'Graphique en anneau de la part de chaque bureau dans les demandes reçues',
  'charts.mix.label': 'Répartition par catégorie',
  'charts.mix.description':
    'Toutes les demandes par type et par bureau — cliquez sur une catégorie pour zoomer sur sa répartition.',
  'charts.efficiency.label': 'Efficacité de traitement',
  'charts.efficiency.description':
    "Bureaux classés par taux de traitement — l'épaisseur du trait indique le volume reçu, avec le taux national comme référence.",
  'charts.efficiency.aria':
    "Bureaux classés par taux de traitement, avec le volume reçu représenté par l'épaisseur du trait",
  'charts.map.label': 'Carte régionale',
  'charts.map.description':
    "Zones de compétence des bureaux et densité de population, avec l'emplacement des bureaux et des bureaux aéroportuaires.",
  // Alternate views, kept swap-ready but not currently registered.
  'charts.mixSunburst.aria': 'Diagramme en soleil des demandes par type et par bureau ; exploration interactive',
  'charts.efficiencyQuadrant.aria':
    'Graphique en quadrants du taux de traitement en fonction du volume reçu par bureau ; la taille des bulles indique le volume traité',

  // ── Charts: shared ───────────────────────────────────────────────────────
  'chart.legendShow': 'Afficher {series}',
  'chart.legendHide': 'Masquer {series}',
  'chart.allSeriesHidden': 'Toutes les séries sont masquées — cliquez sur une entrée de légende pour en afficher une.',

  // ── Chart: Application Types ─────────────────────────────────────────────
  // Compact per-type series names. Deliberately separate from
  // `appType.*.compact` (the Sankey's one-word forms), which are shorter.
  'chart.types.series.acquisition': 'Obtention',
  'chart.types.series.extension': 'Prolongation',
  'chart.types.series.change': 'Changement de statut',
  'chart.types.series.activity': "Autorisation d'activité",
  'chart.types.series.reentry': 'Réadmission',
  'chart.types.series.permanent': 'Résidence permanente',

  // ── Chart: Outcomes ──────────────────────────────────────────────────────
  'chart.outcomes.otherWithdrawn': 'Autre / Retirée',
  'chart.outcomes.valueUnit': 'demandes',
  'chart.outcomes.tooltipValueLabel': 'Demandes',
  'chart.outcomes.tooltipFlowLabel': 'Flux',
  'chart.outcomes.approvalRate': 'Acceptation',
  'chart.outcomes.ofProcessed': 'sur {count} demandes traitées',
  'chart.outcomes.empty': 'Aucune demande traitée sur cette période.',

  // ── Chart: Bureau Share ──────────────────────────────────────────────────
  'chart.share.otherSlice': 'Autres ({count})',

  // ── Chart: Category Mix ──────────────────────────────────────────────────
  'chart.mix.root': 'Toutes les demandes',
  'chart.mix.breadcrumbAria': "Chemin d'exploration de la carte proportionnelle",
  'chart.mix.zoomInHint': 'Cliquez sur une catégorie pour zoomer',
  'chart.mix.zoomOutHint': "Cliquez sur l'arrière-plan (ou appuyez sur Échap) pour dézoomer",
  'chart.mix.zoomInHintTap': "Touchez une catégorie pour l'examiner, touchez à nouveau pour zoomer",
  'chart.mix.zoomOutHintTap': "Touchez l'arrière-plan pour dézoomer",
  'chart.mix.others': 'Autres',
  'chart.mix.categoryAria': '{category} : {count} demandes. Zoomer.',
  'chart.mix.tooltipValue': '{count} demandes · {percent} de {scope}',
  'chart.mix.scopeAll': "l'ensemble des demandes",
  'chart.mix.sunburstHint': '{trail} — {count} demandes ({percent} du total)',
  'chart.sunburst.hintClick': "Cliquez sur un segment pour zoomer · survolez pour l'examiner",
  'chart.sunburst.hintTap': 'Touchez un segment pour l\'examiner, touchez à nouveau pour zoomer',
  'chart.sunburst.zoomOutClick': 'Cliquez au centre pour dézoomer',
  'chart.sunburst.zoomOutTap': 'Touchez le centre pour dézoomer',

  // ── Chart: Processing Efficiency ─────────────────────────────────────────
  'chart.efficiency.branchOffice': 'bureau annexe',
  'chart.efficiency.receivedCount': '{count} reçues',
  'chart.efficiency.nationwide': 'National {rate}',
  'chart.efficiency.pointAria': '{bureau} : {rate} pour cent de traitement, {count} demandes reçues',
  'chart.efficiency.xAxis': 'Demandes reçues',
  'chart.efficiency.fullCompletion': '100 % des demandes reçues traitées',
  'chart.efficiency.quadrantKeepingPace': 'VOLUME ÉLEVÉ · RYTHME MAINTENU',
  'chart.efficiency.quadrantFallingBehind': 'VOLUME ÉLEVÉ · EN RETARD',

  // ── Chart: Regional Map ──────────────────────────────────────────────────
  'map.bureauMarkerAria': 'Bureau de {bureau}',
  'map.airportMarkerAria': 'Bureau aéroportuaire de {bureau}',
  'map.bureauSuffix': 'Bureau de {bureau}',
  'map.airportSuffix': 'Bureau aéroportuaire de {bureau}',
  'map.servicePopulation': 'Population desservie',
  'map.serviceArea': 'Zone de compétence',
  'map.serviceBureau': 'Bureau compétent',
  'map.portOfEntry': "Bureau de point d'entrée",
  'map.legendNote': 'Couleur = bureau compétent · intensité = densité de population',
  'map.bureau': 'Bureau terrestre',
  'map.airportOffice': 'Bureau aéroportuaire',
  'map.loadError': 'Impossible de charger les données de la carte. Essayez de recharger la page.',
  'map.loading': 'Chargement des données cartographiques...',
  'map.areaValue': '{value} km²',
  'map.densityValue': '{value} /km²',

  // ── Changelog ────────────────────────────────────────────────────────────
  'changelog.title': 'Journal des modifications',
  'changelog.loading': 'Chargement...',

  // ── Errors ───────────────────────────────────────────────────────────────
  'errors.dataTitle': 'Erreur de chargement des données',
  'errors.noData': 'Aucune donnée disponible',
  'errors.unknown': "Une erreur inconnue s'est produite",
  'errors.fetchFailed': 'Échec de la récupération des données',
  'errors.renderTitle': "Une erreur s'est produite",
  'errors.renderBody': "Une erreur s'est produite lors de l'affichage de l'application.",
  'errors.reload': 'Recharger la page',
  'errors.changelogUnavailable': 'Impossible de charger le journal des modifications.',

  // ── Screen-reader only ───────────────────────────────────────────────────
  'a11y.showingChart': 'Affichage de {chart} pour {bureau}',
  'a11y.showingChartWithType': 'Affichage de {chart} pour {bureau}, {type}',

  // ── Footer ───────────────────────────────────────────────────────────────
  'footer.attribution': "Statistiques officielles fournies par l'Agence des services de l'immigration du Japon",
  'footer.dataAcquisition': 'Acquisition des données assurée par {source}',
  'footer.fixtureNotice': 'affichage de données de test générées',
  'footer.builtBy': 'Créé par {author}',
  'footer.dataUpdated': 'données mises à jour le {date}',

  // ── Domain: immigration bureaus ──────────────────────────────────────────
  // Keyed by e-Stat bureau code. `.short` is the terminal-style abbreviation
  // shown on the stat tiles; leave it as the Latin code in most languages.
  'bureau.all': 'National',
  'bureau.all.short': 'ALL',
  'bureau.all.compact': 'National',
  'bureau.101010': 'Sapporo',
  'bureau.101010.short': 'CTS',
  'bureau.101010.compact': 'Sapporo',
  'bureau.101090': 'Sendai',
  'bureau.101090.short': 'SDJ',
  'bureau.101090.compact': 'Sendai',
  'bureau.101170': 'Shinagawa',
  'bureau.101170.short': 'SGW',
  'bureau.101170.compact': 'Shinagawa',
  'bureau.101190': 'Aéroport de Narita',
  'bureau.101190.short': 'NRT',
  'bureau.101190.compact': 'Aéroport de Narita',
  'bureau.101200': 'Aéroport de Haneda',
  'bureau.101200.short': 'HND',
  'bureau.101200.compact': 'Aéroport de Haneda',
  'bureau.101210': 'Yokohama',
  'bureau.101210.short': 'YOK',
  'bureau.101210.compact': 'Yokohama',
  'bureau.101350': 'Nagoya',
  'bureau.101350.short': 'NAG',
  'bureau.101350.compact': 'Nagoya',
  'bureau.101370': 'Aéroport du Chubu',
  'bureau.101370.short': 'NGO',
  'bureau.101370.compact': 'Aéroport du Chubu',
  'bureau.101460': 'Osaka',
  'bureau.101460.short': 'ITM',
  'bureau.101460.compact': 'Osaka',
  'bureau.101480': 'Aéroport du Kansai',
  'bureau.101480.short': 'KIX',
  'bureau.101480.compact': 'Aéroport du Kansai',
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
  'appType.all': 'Tous les types',
  'appType.all.short': 'ALL',
  'appType.all.compact': 'Tous',
  'appType.10': 'Acquisition de statut',
  'appType.10.short': 'ACQ',
  'appType.10.compact': 'Obtention',
  'appType.20': 'Prolongation de séjour',
  'appType.20.short': 'EXT',
  'appType.20.compact': 'Prolongation',
  'appType.30': 'Changement de statut',
  'appType.30.short': 'CHG',
  'appType.30.compact': 'Changement',
  'appType.40': "Autorisation d'activités",
  'appType.40.short': 'ACT',
  'appType.40.compact': 'Autorisation',
  'appType.50': 'Réadmission',
  'appType.50.short': 'RET',
  'appType.50.compact': 'Réadmission',
  'appType.60': 'Résidence permanente',
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
  'prefecture.13': 'Tokyo',
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
  'prefecture.26': 'Kyoto',
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
  'dataset.label': 'Jeu de données',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.aria': 'Choisissez le jeu de données à explorer',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing': 'Traitement des demandes',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.processing.compact': 'Traitement',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents': 'Population résidente étrangère',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residents.compact': 'Résidents',
  // ── Resident population dataset ─────────────────────────────────────────
  'dataset.residentsUnavailable':
    'Les données sur la population résidente étrangère sont indisponibles pour le moment.',
  'charts.growth.label': 'Croissance de la population',
  'charts.growth.description': 'L’ensemble de la population résidente étrangère, semestre par semestre, empilée par motif de séjour ou par région du monde.',
  'charts.growth.aria': 'Histogramme empilé du total des résidents étrangers par semestre, réparti par groupe de statut ou par région',
  'charts.origins.label': 'Origines dans le temps',
  'charts.origins.description':
    'Comment les principales nationalités ont progressé ou reculé sur chaque semestre couvert par les statistiques.',
  'charts.origins.aria': 'Graphique en aires empilées du nombre de résidents par nationalité au fil du temps',
  'charts.flows.label': 'Des origines aux statuts',
  'charts.flows.description': 'Des régions du monde aux motifs de séjour en passant par les pays — choisissez une région ou une nationalité pour suivre son profil.',
  'charts.flows.aria': 'Diagramme de Sankey des résidents allant des régions du monde, via les pays, vers les catégories de statut de résidence',
  'charts.statuses.label': 'Répartition des statuts de séjour',
  'charts.statuses.description':
    'Les titres de séjour détenus, regroupés par motif de séjour — cliquez sur un groupe pour le détailler.',
  'charts.statuses.aria': 'Graphique sunburst des résidents par groupe de statut de résidence et statut individuel',
  'charts.worldmap.label': 'Origines dans le monde',
  'charts.worldmap.description':
    'D’où viennent les résidents étrangers du Japon, en dégradé selon le nombre de ressortissants de chaque pays.',
  'charts.worldmap.aria': 'Carte du monde en dégradé selon le nombre de résidents originaires de chaque pays',
  'charts.movers.label': 'Plus fortes variations',
  'charts.movers.description':
    'Les hausses et les baisses les plus marquées entre deux périodes, par nationalité ou par statut de séjour.',
  'charts.movers.aria': 'Diagramme en barres divergentes des plus fortes hausses et baisses entre deux périodes',

  'filters.region': 'Région',
  'filters.allRegions': 'Toutes les régions',
  'filters.nationality': 'Nationalité',
  'filters.residenceStatus': 'Statut de séjour',
  'filters.allNationalities': 'Toutes les nationalités',
  'filters.allStatuses': 'Tous les statuts',
  'filters.allCategories': 'Toutes les catégories',

  'period.snapshotLabel': 'Période affichée',
  'period.latestPeriod': 'Dernière période',
  'period.years_one': '{count} an',
  'period.years_other': '{count} ans',

  'residents.total': 'Résidents étrangers',
  'residents.total.short': 'Résidents',
  'residents.delta': '{delta} p. r. au semestre précédent',
  'residents.populationShare': 'Part de la population',
  'residents.populationShare.short': 'Part de la pop.',
  'residents.populationShareOf': 'de la population du Japon ({population} personnes)',
  'residents.topNationality': 'Première nationalité',
  'residents.topNationality.short': 'Origine princ.',
  'residents.topStatus': 'Statut le plus fréquent',
  'residents.topStatus.short': 'Statut princ.',
  'residents.share': '{share} du total',
  'residents.scope': '{nationality} ({status})',
  'residents.otherNationalities': 'Autres nationalités',
  'residents.noMapArea': '{count} nationalités n’ont pas de territoire sur la carte et ne sont pas colorées.',
  'residents.legendScale': 'Résidents',
  'residents.discontinued': 'Série interrompue en {period} : la catégorie a été fusionnée ou renommée.',
  'residents.comparePeriod': 'p. r. à {period}',
  'residents.byNationality': 'Par nationalité',
  'residents.byStatus': 'Par statut de séjour',
  'residents.increase': 'Hausse',
  'residents.decrease': 'Baisse',
  'residents.asOf': 'Au {period}',
  'residents.noChange': 'Aucune variation mesurable entre ces deux périodes.',
  'residents.coverageRange': '{from} – {to}',
  'residents.stackByGroup': 'Par motif de séjour',
  'residents.stackByRegion': 'Par région du monde',
  'residents.stackByNationality': 'Par nationalité',
  'residents.growthTotal': 'Ensemble',
  'residents.viewAbsolute': 'Effectifs',
  'residents.viewIndexed': 'Croissance (indice)',
  'residents.indexedTooltip': '×{multiple}',
  'residents.flowsValueUnit': 'résidents',
  'residents.flowsTooltipValueLabel': 'Résidents',
  'residents.flowsTooltipFlowLabel': 'Flux',
  'residents.sunburstHint': '{trail} — {count} résidents ({percent} du total)',
  'residents.markerSsw.title': 'Lancement du visa Specified Skilled Worker',
  'residents.markerSsw.description': 'Le visa d’avril 2019 a ouvert plus d’une douzaine de secteurs aux travailleurs étrangers qualifiés.',
  'residents.markerCovid.title': 'Fermeture des frontières (COVID-19)',
  'residents.markerCovid.description': 'Les restrictions d’entrée ont gelé les nouvelles arrivées ; la population a reculé jusqu’à la mi-2022.',
  'residents.markerKoreaSplit.title': 'Scission statistique de la Corée',
  'residents.markerKoreaSplit.description': 'La Corée (combinée) est devenue deux séries distinctes, Corée du Sud et Corée (Chosen) — un changement de comptage, pas de population.',

  'statusGroup.work': 'Travail',
  'statusGroup.training': 'Formation',
  'statusGroup.study': 'Études',
  'statusGroup.family': 'Famille',
  'statusGroup.residency': 'Résidence',
  'statusGroup.other': 'Autres',
  // ── World regions. ICU is tried first, but Chrome ships no names for M49
  // macro-regions, so these are what actually renders there. ────────────────
  'region.1000': 'Asie',
  'region.2000': 'Europe',
  'region.3000': 'Afrique',
  'region.4000': 'Amérique du Nord',
  'region.5000': 'Amérique du Sud',
  'region.6000': 'Océanie',
  'region.7000': 'Apatride',
  // ── Nationalities with no ISO identity (everything else is ICU) ─────────
  'nationality.1120': 'Corée (Chosen)',
  'nationality.1130': 'Corée (regroupée)',
  'nationality.2290': 'Serbie-et-Monténégro',
  'nationality.2500': 'Yougoslavie',
  'nationality.7000': 'Apatride',
  // ── Residence statuses (e-Stat cat01) ───────────────────────────────────
  'status.1010': 'Ensemble',
  'status.1040': 'Professeur d’université',
  'status.1050': 'Artiste',
  'status.1060': 'Activités religieuses',
  'status.1070': 'Journaliste',
  'status.1080': 'Professionnel hautement qualifié',
  'status.1090': 'Professionnel hautement qualifié (i)(a)',
  'status.1100': 'Professionnel hautement qualifié (i)(b)',
  'status.1110': 'Professionnel hautement qualifié (i)(c)',
  'status.1120': 'Professionnel hautement qualifié (ii)',
  'status.1130': 'Investisseur / gérant d’entreprise',
  'status.1140': 'Gestion d’entreprise',
  'status.1150': 'Services juridiques et comptables',
  'status.1160': 'Professions médicales',
  'status.1170': 'Chercheur',
  'status.1180': 'Enseignant',
  'status.1190': 'Ingénieur',
  'status.1200': 'Spécialiste en sciences humaines / services internationaux',
  'status.1210': 'Ingénieur / sciences humaines / services internationaux',
  'status.1220': 'Mutation intragroupe',
  'status.1230': 'Aide à la personne',
  'status.1240': 'Artiste de spectacle',
  'status.1250': 'Travailleur qualifié',
  'status.1260': 'Travailleur à compétences spécifiées',
  'status.1270': 'Travailleur à compétences spécifiées (i)',
  'status.1280': 'Travailleur à compétences spécifiées (ii)',
  'status.1290': 'Stage technique',
  'status.1300': 'Stage technique (i)(a)',
  'status.1310': 'Stage technique (i)(b)',
  'status.1320': 'Stage technique (ii)(a)',
  'status.1330': 'Stage technique (ii)(b)',
  'status.1340': 'Stage technique (iii)(a)',
  'status.1350': 'Stage technique (iii)(b)',
  'status.1360': 'Activités culturelles',
  'status.1380': 'Étudiant',
  'status.1400': 'Stagiaire',
  'status.1410': 'Personne à charge',
  'status.1420': 'Activités désignées',
  'status.1430': 'Résident permanent',
  'status.1440': 'Conjoint ou enfant de ressortissant japonais',
  'status.1450': 'Conjoint ou enfant de résident permanent',
  'status.1460': 'Résident de long terme',
  'status.1470': 'Résident permanent spécial',
  'residents.mixRoot': 'Tous les résidents',
  'residents.mixScopeAll': 'l’ensemble des résidents',
  'residents.mixCategoryAria': '{category} : {count} résidents. Zoomer.',
  'residents.mixTooltipValue': '{count} résidents · {percent} de {scope}',
};
