//autobind decorator
//validation
// Project State Management
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus = ProjectStatus.Active
  ) {}
}
type listenerFn = (projects: Project[]) => void;
class ProjectState {
  private listeners: listenerFn[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }
  addListener(listenerFn: listenerFn) {
    this.listeners.push(listenerFn);
  }
  addProject(title: string, description: string, numOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople
    );

    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validateInput: Validatable) {
  let isValid = true;
  // debugger;
  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  }

  if (
    validateInput.minLength !== undefined &&
    typeof validateInput.value === "string"
  ) {
    isValid =
      isValid && validateInput.value.trim().length > validateInput.minLength;
  }
  if (
    validateInput.maxLength !== undefined &&
    typeof validateInput.value === "string"
  ) {
    isValid =
      isValid && validateInput.value.trim().length < validateInput.maxLength;
  }
  if (
    validateInput.min !== undefined &&
    typeof validateInput.value === "number"
  ) {
    isValid = isValid && validateInput.value >= validateInput.min;
  }
  if (
    validateInput.max !== undefined &&
    typeof validateInput.value === "number"
  ) {
    isValid = isValid && validateInput.value <= validateInput.max;
  }
  return isValid;
}

//Project List
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[] = [];
  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    projectState.addListener((projects: any[]) => {
      const relevantProjects = projects.filter((project:Project) => {
        if(this.type ==='active'){
          return project.status ===ProjectStatus.Active;
        }
        return project.status ===ProjectStatus.Finished;
      })
      this.assignedProjects = relevantProjects;
      this.renderProject();
    });
    this.attach();
    this.renderContent();
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }

  private renderProject() {
    const listEle = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEle.innerHTML = "";
    for(const project of this.assignedProjects){
      const listItem = document.createElement('li');
      listItem.textContent = project.title;
      listEle.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
    this.attach();
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
      this.clearInput();
    }
  }
  private configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  private gatherUserInput(): [string, string, number] | void {
    const enterTitle = this.titleInputElement.value;
    const enterDescription = this.descriptionInputElement.value;
    const enterPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enterTitle,
      required: true,
    };
    const descriptionValidatable: Validatable = {
      value: enterDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: +enterPeople,
      required: true,
      min: 1,
    };
    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid Input ");
    } else {
      // this.clearInput();
      return [enterTitle, enterDescription, +enterPeople];
    }
  }
}
const prjInput = new ProjectInput();

const activeList = new ProjectList("active");
const finishList = new ProjectList("finished");
