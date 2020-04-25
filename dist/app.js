"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status = ProjectStatus.Active) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople);
        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
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
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBeginning) {
        this.hostElement.insertAdjacentElement(insertAtBeginning ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjectItem extends Component {
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    get persons() {
        if (this.project.people === 1) {
            return "1 person";
        }
        return `${this.project.people} persons`;
    }
    configure() { }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent = this.persons + " assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.configure();
        this.renderContent();
    }
    configure() {
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                return project.status === ProjectStatus.Finished;
            });
            this.assignedProjects = relevantProjects;
            this.renderProject();
        });
    }
    renderProject() {
        const listEle = document.getElementById(`${this.type}-projects-list`);
        listEle.innerHTML = "";
        for (const project of this.assignedProjects) {
            new ProjectItem(this.element.querySelector("ul").id, project);
        }
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type.toUpperCase() + " PROJECTS";
    }
}
class ProjectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.configure();
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInput();
        }
    }
    configure() {
        this.element.addEventListener("submit", this.submitHandler.bind(this));
    }
    renderContent() { }
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
            return [enterTitle, enterDescription, +enterPeople];
        }
    }
}
const prjInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishList = new ProjectList("finished");
//# sourceMappingURL=app.js.map