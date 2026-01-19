export function getRequiredForms(matter: any) {
  const forms = ['P1', 'P2', 'P9'];
  if (matter.hadWill) {
    forms.push('P3');
  } else {
    forms.push('P5');
  }
  forms.push('P10');
  return forms;
}
export function validateEstateData(matter: any) {
  const errors = [];
  if (!matter.decFullName) errors.push('Missing deceased name');
  if (!matter.decDateOfDeath) errors.push('Missing date of death');
  if (!matter.exFullName) errors.push('Missing executor name');
  return errors;
}
