'use strict';

const bodyElement = document.body
const overlaySuccessfully = document.querySelector('#overlaySuccessfully')
const formElement = document.querySelector('[data-js-form]')
const inputEmailElement = document.getElementById('email')
const inputPassElement = document.getElementById('password')
const inputRepeatPassElement = document.getElementById('repeatPassword')
const inputElement = document.querySelector('[data-form-input]')
const buttonElement = document.querySelector('[data-js-form-button]');

function showSuccessOverlay() {
    overlaySuccessfully.classList.add('is-active')
    bodyElement.classList.add('has-overlay-active');
}

function hideSuccessOverlay() {
    overlaySuccessfully.classList.remove('is-active')
    bodyElement.classList.remove('has-overlay-active')
}

class FormsValidation {
    selectors = {
        form: '[data-js-form]',
        fieldErrors: '[data-js-form-field-errors]'
    }

    errorMessages = {
        valueMissing: () => 'Пожалуйста, заполните это поле',
        patternMismatch: ({title}) => title || 'Данные не соотвутствуют формату',
        tooShort: ({minLength}) => `Слишком короткое значение, минимум символов - ${minLength}`,
        tooLong: ({maxLength}) => `Слишком длинное значение, ограничение символов - ${maxLength}`,
        passwordMismatch: () => 'Пароли не совпадают'
    }

    constructor() {
        this.form = formElement
        this.bindEvents()
    }

    manageErrors(fieldControlElement, errorMessages) {
        const fieldErrorsElement = fieldControlElement.parentElement.querySelector(this.selectors.fieldErrors)

        fieldErrorsElement.innerHTML = errorMessages
            .map((message) => `<span class="field__error">${message}</span>`)
            .join('')
    }

    validateField(fieldControlElement) {
        const errors = fieldControlElement.validity
        const errorMessages = []

        // Сначала преобразуем объект в массив пар ключ-значение, затем итерируемся по этому массиву
        Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
            if (errors[errorType]) {
                errorMessages.push(getErrorMessage(fieldControlElement))
            }
        })

        this.manageErrors(fieldControlElement, errorMessages)
        fieldControlElement.ariaInvalid = errorMessages.length > 0;
        // console.log(errorMessages)
    }

    onBlur(event) {
        const { target } = event
        const isFormField = target.closest(this.selectors.form)
        const isRequired = target.required

        if (isFormField && isRequired) {
            this.validateField(target)
        }
    }

    bindEvents() {
        document.addEventListener('blur', (event) => {
            this.onBlur(event)
        }, {capture: true})
    }
}

new FormsValidation();

function newUser(event) {
    event.preventDefault();

    const emailValue = inputEmailElement.value;
    const passwordValue = inputPassElement.value;

    const newUser = {
        email: emailValue,
        password: passwordValue,
    }

    const userJson = localStorage.getItem('registeredUsers');
    let users = []

    if (userJson) {
        users = JSON.parse(userJson)
    }

    const emailExists = users.some((user) => {
        return user.email === emailValue
    })

    if (emailExists) {
        alert('Пользователь с таким email уже зарегистрирован.')
        return
    }

    users.push(newUser)

    const updatedUsersJson = JSON.stringify(users)
    localStorage.setItem('registeredUsers', updatedUsersJson)

    showSuccessOverlay();

    setTimeout(() => {
        hideSuccessOverlay();
    }, 3000)

    // localStorage.clear()
}

formElement.addEventListener('submit', newUser);