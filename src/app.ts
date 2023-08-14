// Project State Management 

class ProjectState { 
    private listners: any[] = []
    private projects: any[]  = []; 
    private static instance: ProjectState

    private constructor() { 

    }

    static getInstance() { 
        if(this.instance) { 
            return this.instance
        }
        this.instance = new ProjectState() 
        return this.instance
    }

    addListner(liistnerFn: Function) { 
        this.listners.push(liistnerFn)
    }

    addProject (title: string, description: string, numOfPeople: number) { 
        const newProject =  { 
            id: Math.random().toString(), 
            title: title, 
            description: description, 
            people: numOfPeople
        }
        this.projects.push(newProject)
        for(const listnersFn of this.listners) { 
            listnersFn(this.projects.slice())
        }
    }
}

// global instance: 
const projectState = ProjectState.getInstance() 


// validation
interface Validatable { 
    value: string | number
    required?: boolean
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
}


function validate(ValidatableInput: Validatable) { 
    let isValid  = true 
    if(ValidatableInput.required) { 
        isValid = isValid && ValidatableInput.value.toString().trim().length !== 0 
    }
    if(
        ValidatableInput.minLength != null
        && 
        typeof ValidatableInput.value === 'string')
         { 
            isValid = isValid && ValidatableInput.value.length > ValidatableInput.minLength
        }
    if(
        ValidatableInput.maxLength != null
        && 
        typeof ValidatableInput.value === 'string')
         { 
            isValid = isValid && ValidatableInput.value.length < ValidatableInput.maxLength
        }

    if( ValidatableInput.min != null && typeof ValidatableInput.value === 'number') { 
        isValid  = isValid && ValidatableInput.value > ValidatableInput.min
    }
    if( ValidatableInput.max != null && typeof ValidatableInput.value === 'number') { 
        isValid  = isValid && ValidatableInput.value < ValidatableInput.max
    }
    return isValid
}


// autobind class
function autobind(
    _: any, 
    _2: string, 
    descriptor: PropertyDescriptor) 
    { 
        const originalMethod = descriptor.value
        const adjDescriptor: PropertyDescriptor =  {
            configurable: true, 
            get() { 
                const boundFn = originalMethod.bind(this)
                return boundFn
            }
         }  
         return adjDescriptor
    }
// Proect List Class
class projctList  { 
    templateElement : HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLElement
    assignedProjects: any[]
    
    constructor(private type: 'active' | 'finished') { 
        this.templateElement  = document.getElementById('project-list')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement
        this.assignedProjects = []

        const importedNode = document.importNode(this.templateElement.content, true)

        this.element = importedNode.firstElementChild as HTMLElement
        this.element.id = `${this.type}-projects`

        projectState.addListner( (projects: any[]) => { 
            this.assignedProjects = projects
            this.renderProjects() 
        }) 
        
        
        this.attach()
        this.renderContent()
    }
    
    private renderProjects()  { 
        const listEl  = document.getElementById(`${this.type}-projects-list`)!  as HTMLUListElement
        for(const prjItem of this.assignedProjects) { 
            const listItem = document.createElement('li')
            listItem.textContent = prjItem.title
            listEl.appendChild(listItem)
        }
    } 

    private renderContent() { 
        const listId = `${this.type}-projects-list`
        this.element.querySelector('ul')!.id = listId
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " Projects"

    }

    private attach() { 
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
}


// project input class

class ProjectInput { 

    templateElement : HTMLTemplateElement
    hostElement: HTMLDivElement
    element: HTMLFormElement
    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement


    constructor() { 
        this.templateElement  = document.getElementById('project-input')! as HTMLTemplateElement
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importedNode = document.importNode(this.templateElement.content, true)
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = 'user-input'

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement
        
        this.configure()
        this.attach()
        
    }

    private gatherUserInput(): [string, string, number] | void{ 
        const enterdTitle =  this.titleInputElement.value
        const enteredDescription =  this.descriptionInputElement.value
        const enteredPeople =  this.peopleInputElement.value

        const titleValidatable:  Validatable = {
            value: enterdTitle, 
            required: true, 

        }
        const descriptionValidatable: Validatable = { 
            value: enteredDescription, 
            required: true,
            minLength: 5
        }
        const pepoleValidable: Validatable = { 
            value: +enteredPeople, 
            required: true, 
            min: 1, 
            max: 5
        }

        if
        (
            !validate(titleValidatable) || 
            !validate(descriptionValidatable) || 
            !validate(pepoleValidable)
        ){ 
            alert('Invalid Input Please try again!!')
            return
        }else { 
            return [enterdTitle, enteredDescription, +enteredPeople]
        }

    }

    private clearInputs () { 
        this.titleInputElement.value = ''
        this.descriptionInputElement.value = ''
        this.peopleInputElement.value = ''
    }
    
    @autobind 
    private submitHandler(event: Event) { 
        event.preventDefault()
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput) ) { 
            const [title, desc, people] = userInput
            projectState.addProject(title, desc, people)
            console.log(title,desc, people)
            this.clearInputs()
        } 
    }

    private configure() { 
        this.element.addEventListener('submit', this.submitHandler.bind(this))
    }

    private attach() { 
        this.hostElement.insertAdjacentElement(`afterbegin`, this.element )
    }
}


const prjInput = new ProjectInput()
const activePrjList = new projctList('active')
const finishedPrjList = new projctList('finished')
