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
type listenerFn<T> = (projects: T[]) => void;

class State<T> {
  protected listeners: listenerFn<T>[] = [];
  addListener(listenerFn: listenerFn<T>) {
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
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
// Abstract classes are mainly for inheritance where other classes may derive from them.
// We cannot create an instance of an abstract class.
// An abstract class typically includes one or more abstract methods or property declarations.
// The class which extends the abstract class must define all the abstract methods.
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;
  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBeginning ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure?(): void; // ? optional
  abstract renderContent(): void;
}
//Project Item
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;
  constructor(hostId: string, project: Project) {
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

  configure() {}

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
//Project List
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: any[] = [];
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project: Project) => {
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
    const listEle = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEle.innerHTML = "";
    for (const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
    }
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

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
  configure() {
    this.element.addEventListener("submit", this.submitHandler.bind(this));
  }

  renderContent() {}

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
