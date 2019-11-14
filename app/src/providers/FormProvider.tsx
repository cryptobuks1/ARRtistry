import * as React from 'react';
import Form from 'react-bootstrap/Form';
import _ from 'lodash';

export interface TextFields {
  title: string;
  artistId: string;
  description: string;
  edition: string;
  artifactCreationDate: string;
  medium: string;
  width: string;
  height: string;
}

export interface FormStatus {
  validated: boolean;
  submitted: boolean;
}

export type ErrorMessages = {
  [K in keyof TextFields]: React.ReactElement | null;
}

export const DEFAULT_TEXT_FIELDS: TextFields = {
  title: '',
  artistId: '',
  description: '',
  edition: '',
  artifactCreationDate: '',
  medium: '',
  width: '',
  height: '',
};

export const DEFAULT_ERRORS: ErrorMessages = {
  title: null,
  artistId: null,
  description: null,
  edition: null,
  artifactCreationDate: null,
  medium: null,
  width: null,
  height: null,
};

export const DEFAULT_FORM_STATUS: FormStatus = {
  validated: false,
  submitted: false,
};

type SetField = (name: string, value: string) => void;

export interface FormControl {
  status: FormStatus;
  setField: SetField;
  clear: VoidFunction;
}

const TextFieldContext = React.createContext<TextFields>(DEFAULT_TEXT_FIELDS);
const FormControlContext = React.createContext<FormControl>({
  status: DEFAULT_FORM_STATUS,
  setField: console.warn,
  clear: console.warn,
});
const ErrorsContext = React.createContext<ErrorMessages>(DEFAULT_ERRORS);

type formOnSubmit = (fields: TextFields) => void;

export interface FormProviderProps {
  validator: (textFields: TextFields) => ErrorMessages;
  onSubmit: formOnSubmit;
  onClear?: VoidFunction;
}

export const FormProvider: React.FC<FormProviderProps> = ({ onSubmit, validator, onClear, children }) => {
  const [textFields, setTextFields] = React.useState<TextFields>(DEFAULT_TEXT_FIELDS);
  const [errors, setErrors] = React.useState<ErrorMessages>(DEFAULT_ERRORS);
  const [formStatus, setFormStatus] = React.useState<FormStatus>(DEFAULT_FORM_STATUS);

  const _setField = (id: string, value: string): void => {
    setTextFields({
      ...textFields,
      [id]: value,
    });
  };

  const _validate = (): ErrorMessages => {
    const errors = validator(textFields);
    const foundErrors = _.pickBy(errors, (b: any) => !!b);
    const hasErrors = Object.keys(foundErrors).length > 0;
    if (hasErrors) {
      return errors;
    }
    setFormStatus({ ...formStatus, validated: true });
    return DEFAULT_ERRORS;
  };

  const clearForm = (): void => {
    setTextFields(DEFAULT_TEXT_FIELDS);
    setErrors(DEFAULT_ERRORS);
    setFormStatus(DEFAULT_FORM_STATUS);
    onClear && onClear();
  };

  const _onSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    setFormStatus({ ...formStatus, submitted: true });
    const errors = _validate();
    setErrors(errors);
    onSubmit(textFields);
    clearForm();
  };

  return (
    <TextFieldContext.Provider value={textFields}>
      <FormControlContext.Provider value={{ status: formStatus, setField: _setField, clear: clearForm }}>
        <ErrorsContext.Provider value={errors}>
          <Form
            noValidate
            validated={formStatus.validated}
            onSubmit={_onSubmit}
          >
            { children }
          </Form>
        </ErrorsContext.Provider>
      </FormControlContext.Provider>
    </TextFieldContext.Provider>
  );
};

export const useTextFieldsContext = (): TextFields => React.useContext<TextFields>(TextFieldContext);
export const useFormControlContext = (): FormControl => React.useContext<FormControl>(FormControlContext);
export const useErrorsContext = (): ErrorMessages => React.useContext<ErrorMessages>(ErrorsContext);