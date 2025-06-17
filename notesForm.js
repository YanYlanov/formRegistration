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

    // Объект, сопоставляющий различные типы ошибок валидации (подобные тем, что находятся в ValidityState)
    errorMessages = {
        valueMissing: () => 'Пожалуйста, заполните это поле',
        patternMismatch: ({title}) => title || 'Данные не соотвутствуют формату',
        tooShort: ({minLength}) => `Слишком короткое значение, минимум символов - ${minLength}`,
        tooLong: ({maxLength}) => `Слишком длинное значение, ограничение символов - ${maxLength}`,
        passwordMismatch: () => 'Пароли не совпадают'
    }

    constructor() {
        this.form = formElement
        // Вызывает метод bindEvents настройки слушателей событий
        this.bindEvents()
    }


    // Этот метод отвечает за отображение или очистку сообщений об ошибках для одного поля формы.
    // fieldControlElement: Конкретный элемент ввода (например, inputEmailElement), для которого управляются ошибки.
    manageErrors(fieldControlElement, errorMessages) {
        // parentElement для этого input будет его непосредственный родительский элемент, то есть <div class="form__field">
        const fieldErrorsElement = fieldControlElement.parentElement.querySelector(this.selectors.fieldErrors)
        /*
        fieldErrorsElement.innerHTML: Эта объединённая HTML-строка затем вставляется в fieldErrorsElement, отображая сообщения об ошибках.
        */
        fieldErrorsElement.innerHTML = errorMessages
            // проходит по массиву массиву errorMessages. Для каждого сообщения он создает <span> с классом field__error содержащий сообщение.join()
            .map((message) => `<span class="field__error">${message}</span>`)
            .join('')
    }

    // fieldControlElement: Конкретный элемент ввода (например, inputEmailElement)
    validateField(fieldControlElement) {
        // Извлекает объект ValidityState для fieldControlElement.
        const errors = fieldControlElement.validity
        // Пустой массив для сбора всех соответствующих сообщений об ошибках.
        const errorMessages = []

        /*
        Сначала преобразуем объект в массив пар ключ-значение, затем итерируемся по этому массиву
         Синтаксис ([errorType, getErrorMessage]) говорит: "Возьми массив, который ты сейчас обрабатываешь (['valueMissing', функция]), и распакуй его:
         первый элемент (ключ) помести в новую переменную errorType, а второй элемент (значение ) помести в новую переменную getErrorMessage".
         */
        Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
            // errors — это объект ValidityState, который содержит булевы свойства
            // errorType: Это переменная, которая в каждой итерации цикла принимает значение ключа из вашего объекта this.errorMessages.
            if (errors[errorType]) {
                errorMessages.push(getErrorMessage(fieldControlElement))
            }
        })
        // manageErrors отвечает за отображение или скрытие сообщений об ошибках для конкретного поля формы.
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