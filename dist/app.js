"use strict";
function validate(validateInput) {
    let isValid = true;
    if (validateInput.required) {
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }
    if (validateInput.minLength !== undefined &&
        typeof validateInput.value === "string") {
        isValid =
            isValid && validateInput.value.trim().length > validateInput.minLength;
    }
    if (validateInput.maxLength !== undefined &&
        typeof validateInput.value === "string") {
        isValid =
            isValid && validateInput.value.trim().length < validateInput.maxLength;
    }
    if (validateInput.min !== undefined &&
        typeof validateInput.value === "number") {
        isValid = isValid && validateInput.value >= validateInput.min;
    }
    if (validateInput.max !== undefined &&
        typeof validateInput.value === "number") {
        isValid = isValid && validateInput.value <= validateInput.max;
    }
    return isValid;
}
class ProjectList {
    constructor() {
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, descript, people] = userInput;
            console.log({ title, descript, people });
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
    gatherUserInput() {
        const enterTitle = this.titleInputElement.value;
        const enterDescription = this.descriptionInputElement.value;
        const enterPeople = this.peopleInputElement.value;
        const titleValidatable = {
            value: enterTitle,
            required: true,
        };
        const descriptionValidatable = {
            value: enterDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: +enterPeople,
            required: true,
            min: 1,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Invalid Input ");
        }
        else {
            this.clearInput();
            return [enterTitle, enterDescription, +enterPeople];
        }
    }
}
const prjInput = new ProjectInput();
//# sourceMappingURL=app.js.map