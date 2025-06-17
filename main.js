'use strict';

const bodyElement = document.body;
const overlaySuccessfully = document.querySelector('#overlaySuccessfully');
const formElement = document.querySelector('[data-js-form]');
const inputEmailElement = document.getElementById('email');
const inputPassElement = document.getElementById('password');
const inputRepeatPassElement = document.getElementById('repeatPassword');
const inputElement = document.querySelector('[data-form-input]');
const buttonElement = document.querySelector('[data-js-form-button]');

function showSuccessOverlay() {
    overlaySuccessfully.classList.add('is-active');
    bodyElement.classList.add('has-overlay-active');
}

function hideSuccessOverlay() {
    overlaySuccessfully.classList.remove('is-active');
    bodyElement.classList.remove('has-overlay-active');
}

class FormsValidation {
    selectors = {
        form: '[data-js-form]',
        fieldErrors: '[data-js-form-field-errors]'
    };

    errorMessages = {
        valueMissing: () => 'Пожалуйста, заполните это поле',
        patternMismatch: ({ title }) => title || 'Данные не соотвутствуют формату',
        tooShort: ({ minLength }) => `Слишком короткое значение, минимум символов - ${minLength}`,
        tooLong: ({ maxLength }) => `Слишком длинное значение, ограничение символов - ${maxLength}`,
        passwordMismatch: () => 'Пароли не совпадают'
    };

    constructor() {
        this.form = formElement;
        this.bindEvents();
    }

    manageErrors(fieldControlElement, errorMessages) {
        const fieldErrorsElement = fieldControlElement.parentElement.querySelector(this.selectors.fieldErrors);
        if (!fieldErrorsElement) {
            return
        }

        fieldErrorsElement.innerHTML = errorMessages
            .map((message) => `<span class="field__error">${message}</span>`)
            .join('');

        if (errorMessages.length > 0) {
            fieldControlElement.classList.add('is-invalid')
        } else {
            fieldControlElement.classList.remove('is-invalid')
        }
    }

    validateField(fieldControlElement) {
        fieldControlElement.setCustomValidity('');
        const errors = fieldControlElement.validity;
        const errorMessages = [];

        for (const errorType in this.errorMessages) {
            if (errorType === 'passwordMismatch') {
                if (fieldControlElement.id === 'repeatPassword') {
                    if (inputPassElement.value !== '' && inputRepeatPassElement.value !== '') {
                        if (inputPassElement.value !== inputRepeatPassElement.value) {
                            fieldControlElement.setCustomValidity('passwordMismatch')
                        } else {
                            fieldControlElement.setCustomValidity('')
                        }
                    }
                }
            }

            if (errorType === 'passwordMismatch') {
                if (errors.customError && fieldControlElement.validationMessage === 'passwordMismatch') {
                    errorMessages.push(this.errorMessages.passwordMismatch())
                }
            } else if (errors[errorType]) {
                errorMessages.push(this.errorMessages[errorType](fieldControlElement))
            }
        }

        this.manageErrors(fieldControlElement, errorMessages);
        fieldControlElement.ariaInvalid = errorMessages.length > 0;
    }

    onBlur(event) {
        const { target } = event;
        const isFormField = target.closest(this.selectors.form);

        if (target.id === 'password') {
            if (target.required || target.value !== '') {
                this.validateField(target)
            } else if (target.value === '') {
                this.manageErrors(target, [])
                target.ariaInvalid = false
                target.classList.remove('is-invalid')
            }

            if (inputRepeatPassElement && inputRepeatPassElement.value !== '') {
                this.validateField(inputRepeatPassElement)
            }
            return
        }

       if (target.required || target.value !== '') {
           this.validateField(target)
       } else if (target.value === '') {
           this.manageErrors(target, [])
           target.ariaInvalid = false
           target.classList.remove('is-invalid')
       }
    }

    bindEvents() {
        document.addEventListener('blur', (event) => {
            this.onBlur(event);
        }, { capture: true });
    }

    validateAllFormFields() {
        let formIsValid = true
        const formControls = this.form.querySelectorAll('input, select, textarea')

        formControls.forEach((field) => {
            this.validateField(field)

            if (field.validity.valid === false) {
                formIsValid = false
            }
        })
        return formIsValid
    }

}

const formsValidator = new FormsValidation();

function newUser(event) {
    event.preventDefault();

    const isFormValid =  formsValidator.validateAllFormFields()

    if (!isFormValid) {
        const firstInvalidField = formsValidator.form.querySelector(':invalid')
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
        return;
    }

    const emailValue = inputEmailElement.value;
    const passwordValue = inputPassElement.value;

    const newUser = {
        email: emailValue,
        password: passwordValue,
    };

    const userJson = localStorage.getItem('registeredUsers');
    let users = [];

    if (userJson) {
        users = JSON.parse(userJson);
    }

    const emailExists = users.some((user) => {
        return user.email === emailValue;
    });

    if (emailExists) {
        alert('Пользователь с таким email уже зарегистрирован.');
        return;
    }

    users.push(newUser);

    const updatedUsersJson = JSON.stringify(users);
    localStorage.setItem('registeredUsers', updatedUsersJson);

    showSuccessOverlay();

    setTimeout(() => {
        hideSuccessOverlay();
    }, 3000);

    // localStorage.clear();
}

formElement.addEventListener('submit', newUser);
