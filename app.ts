interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  /**
   * Moves the employee with employeeID (uniqueId) under a supervisor
   (another employee) that has supervisorID (uniqueId).
   * E.g. move Bob (employeeID) to be subordinate of Georgina
   (supervisorID). * @param employeeID
   * @param supervisorID
   */
  move(employeeID: number, supervisorID: number): void;
  /** Undo last move action */
  undo(): void;
  /** Redo last undone action */
  redo(): void;
}

type EmployeeSupervisorRelation = {
  employee: Employee,
  supervisor: Employee|null
};

type MovedEmployeeRecord = {
  movedEmployee: Employee,
  oldSupervisor: Employee,
  newSupervisor: Employee,
  oldSubordinates: Array<Employee>
};

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;

  employeesRelationById: {[k: number]: EmployeeSupervisorRelation } = {}

  employeesMoveHistory: Array<MovedEmployeeRecord> = [];
  historyPointer: number = 1;

  constructor(ceo: Employee) {
    this.ceo = ceo;
    // Initial record never gonna be executed
    this.employeesMoveHistory.push({
      movedEmployee: ceo,
      oldSupervisor: ceo,
      newSupervisor: ceo,
      oldSubordinates: [],
    })
    this.employeesRelationById[ceo.uniqueId] = {employee: ceo, supervisor: null};
    let queue: Array<Employee> = [ceo];

    while (queue.length > 0) {
      let employee = queue.shift()!;

      for (const subordinate of employee.subordinates) {
        this.employeesRelationById[subordinate.uniqueId] = {
          employee: subordinate,
          supervisor: employee
        };
      }

     queue.push(...employee.subordinates);
    }

  }

  move(employeeID: number, supervisorID: number): void {

    const {employee, supervisor} = this.employeesRelationById[employeeID];
    const newSupervisor = this.employeesRelationById[supervisorID].employee;

    const historyChange = {
      movedEmployee: employee,
      oldSupervisor: supervisor!,
      newSupervisor: newSupervisor,
      oldSubordinates: employee.subordinates
    };

    this.moveEmployee(employee, newSupervisor);

    if (this.historyPointer > 1) {
      this.employeesMoveHistory.splice((this.historyPointer -1) * -1);
      this.historyPointer = 1;
    }

    this.employeesMoveHistory.push(historyChange);
  }

  private moveEmployee(employee: Employee, newSupervisor: Employee) {
    let employeeRelation  = this.employeesRelationById[employee.uniqueId];
    let currentSupervisor = employeeRelation.supervisor;

    if (currentSupervisor === null) {
      throw new Error("Cannot move the root employee (ceo)");
    }

    /**
     * Moves employee subordinates, to subordinates of his currentSupervisor.
     */
    for (const subordinate of employee.subordinates) {
      let subordinateRelation = this.employeesRelationById[subordinate.uniqueId];
      subordinateRelation.supervisor = currentSupervisor;
      currentSupervisor.subordinates.push(subordinate);
    }

    employee.subordinates = [];

    this.addEmployeeToSupervisor(employee, newSupervisor);
  }

  private removeEmployeeFromSupervisor(employee: Employee, supervisor: Employee) {
    let subordinateIndex = supervisor.subordinates.indexOf(employee);
    supervisor.subordinates.splice(subordinateIndex,1);
  }

  private addEmployeeToSupervisor(employee: Employee, supervisor: Employee) {
    let employeeRelation = this.employeesRelationById[employee.uniqueId];

    this.removeEmployeeFromSupervisor(employee, employeeRelation.supervisor!);

    employeeRelation.supervisor = supervisor;
    supervisor.subordinates.push(employee);
  }

  redo(): void {
    if (this.historyPointer === 1) {
      throw new Error("Cannot redo, no further changes available.");
    }

    let {movedEmployee, newSupervisor} = this.employeesMoveHistory[
      ((this.historyPointer - 1) * -1) + this.employeesMoveHistory.length
    ];

    this.moveEmployee(movedEmployee, newSupervisor);

    this.historyPointer--;
  }

  undo(): void {
    if (this.employeesMoveHistory.length <= this.historyPointer) {
      throw new Error("Cannot undo, no further changes available.");
    }

    let {movedEmployee, oldSupervisor, oldSubordinates} = this.employeesMoveHistory[
      (this.historyPointer * -1) + this.employeesMoveHistory.length
    ];

    this.moveEmployee(movedEmployee, oldSupervisor);

    for (const oldSubordinate of oldSubordinates) {
      this.addEmployeeToSupervisor(oldSubordinate, movedEmployee);
    }

    this.historyPointer++;

  }

}

const ceo = {
  uniqueId: 1,
  name: 'Mark',
  subordinates: [
    {
      uniqueId: 2,
      name: 'Sarah',
      subordinates: [
        {
          uniqueId: 6,
          name: 'Cassandra',
          subordinates: [
            {
              uniqueId: 11,
              name: 'Bob',
              subordinates: [
                {
                  uniqueId: 12,
                  name: 'Tina',
                  subordinates: [
                    
                  ]
                },
              ]
            },
          ]
        },
      ]
    },
    {
      uniqueId: 3,
      name: 'Tyler',
      subordinates: [
        {
          uniqueId: 7,
          name: 'Harry',
          subordinates: [
            
          ]
        },
        {
          uniqueId: 8,
          name: 'George',
          subordinates: [
            
          ]
        },
        {
          uniqueId: 9,
          name: 'Gary',
          subordinates: [
            
          ]
        },
      ]
    },
    {
      uniqueId: 4,
      name: 'Bruce',
      subordinates: [
        
      ]
    },
    {
      uniqueId: 5,
      name: 'Georgina',
      subordinates: [
        {
          uniqueId: 10,
          name: 'Sophie',
          subordinates: [
            
          ]
        },
      ]
    },
  ]
}

const app = new EmployeeOrgApp(ceo)

app.move(11, 5);


console.log(ceo)

console.log(ceo.subordinates[3])