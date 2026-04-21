/**
 * Agenda identifiers used in DICCIONARIO.agenda and as id_dict prefixes.
 *
 * `TARRAGONA` corresponds to the Agenda Metropolitana de Tarragona (6 líneas estratégicas),
 * replacing the legacy `AUE` agenda (10 AUE objetivos) in every rebuilt artifact.
 */
export const AGENDA_LE = 'TARRAGONA' as const;
export const AGENDA_LE_PREFIX = `${AGENDA_LE}-` as const;
