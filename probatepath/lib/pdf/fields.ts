import { PDFName, type PDFForm } from "pdf-lib";

export function setTextField(form: PDFForm, name: string, value?: string | number | null) {
  if (value === undefined || value === null) return;
  const text = String(value).trim();
  if (!text) return;
  try {
    form.getTextField(name).setText(text);
  } catch {
    // Missing field; ignore.
  }
}

type CheckBoxOptions = {
  onValue?: string;
};

export function setCheckBox(form: PDFForm, name: string, checked: boolean, options: CheckBoxOptions = {}) {
  try {
    const field = form.getCheckBox(name);
    if (checked) {
      if (options.onValue) {
        field.acroField.setValue(PDFName.of(options.onValue));
      } else {
        field.check();
      }
    } else {
      field.uncheck();
    }
  } catch {
    // ignore missing checkbox
  }
}

export function setRadioGroupValue(form: PDFForm, name: string, value?: string | null) {
  try {
    const group = form.getRadioGroup(name);
    if (!value) {
      group.clear();
      return;
    }
    const option = group
      .getOptions()
      .find((opt) => opt.toLowerCase() === value.toLowerCase());
    if (option) {
      group.select(option);
    }
  } catch {
    // ignore missing radio
  }
}
