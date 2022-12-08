var EmployeeOrgApp = /** @class */ (function () {
    function EmployeeOrgApp(ceo) {
        this.employeesRelationById = {};
        this.employeesMoveHistory = [];
        this.historyPointer = 1;
        this.ceo = ceo;
        // Initial record never gonna be executed
        this.employeesMoveHistory.push({
            movedEmployee: ceo,
            oldSupervisor: ceo,
            newSupervisor: ceo,
            oldSubordinates: []
        });
        this.employeesRelationById[ceo.uniqueId] = { employee: ceo, supervisor: null };
        var queue = [ceo];
        while (queue.length > 0) {
            var employee = queue.shift();
            for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
                var subordinate = _a[_i];
                this.employeesRelationById[subordinate.uniqueId] = {
                    employee: subordinate,
                    supervisor: employee
                };
            }
            queue.push.apply(queue, employee.subordinates);
        }
    }
    EmployeeOrgApp.prototype.move = function (employeeID, supervisorID) {
        var _a = this.employeesRelationById[employeeID], employee = _a.employee, supervisor = _a.supervisor;
        var newSupervisor = this.employeesRelationById[supervisorID].employee;
        var historyChange = {
            movedEmployee: employee,
            oldSupervisor: supervisor,
            newSupervisor: newSupervisor,
            oldSubordinates: employee.subordinates
        };
        this.moveEmployee(employee, newSupervisor);
        if (this.historyPointer > 1) {
            this.employeesMoveHistory.splice((this.historyPointer - 1) * -1);
            this.historyPointer = 1;
        }
        this.employeesMoveHistory.push(historyChange);
    };
    EmployeeOrgApp.prototype.moveEmployee = function (employee, newSupervisor) {
        var employeeRelation = this.employeesRelationById[employee.uniqueId];
        var currentSupervisor = employeeRelation.supervisor;
        if (currentSupervisor === null) {
            throw new Error("Cannot move the root employee (ceo)");
        }
        /**
         * Moves employee subordinates, to subordinates of his currentSupervisor.
         */
        for (var _i = 0, _a = employee.subordinates; _i < _a.length; _i++) {
            var subordinate = _a[_i];
            var subordinateRelation = this.employeesRelationById[subordinate.uniqueId];
            subordinateRelation.supervisor = currentSupervisor;
            currentSupervisor.subordinates.push(subordinate);
        }
        employee.subordinates = [];
        this.addEmployeeToSupervisor(employee, newSupervisor);
    };
    EmployeeOrgApp.prototype.removeEmployeeFromSupervisor = function (employee, supervisor) {
        var subordinateIndex = supervisor.subordinates.indexOf(employee);
        supervisor.subordinates.splice(subordinateIndex, 1);
    };
    EmployeeOrgApp.prototype.addEmployeeToSupervisor = function (employee, supervisor) {
        var employeeRelation = this.employeesRelationById[employee.uniqueId];
        this.removeEmployeeFromSupervisor(employee, employeeRelation.supervisor);
        employeeRelation.supervisor = supervisor;
        supervisor.subordinates.push(employee);
    };
    EmployeeOrgApp.prototype.redo = function () {
        if (this.historyPointer === 1) {
            throw new Error("Cannot redo, no further changes available.");
        }
        var _a = this.employeesMoveHistory[((this.historyPointer - 1) * -1) + this.employeesMoveHistory.length], movedEmployee = _a.movedEmployee, newSupervisor = _a.newSupervisor;
        this.moveEmployee(movedEmployee, newSupervisor);
        this.historyPointer--;
    };
    EmployeeOrgApp.prototype.undo = function () {
        if (this.employeesMoveHistory.length <= this.historyPointer) {
            throw new Error("Cannot undo, no further changes available.");
        }
        var _a = this.employeesMoveHistory[(this.historyPointer * -1) + this.employeesMoveHistory.length], movedEmployee = _a.movedEmployee, oldSupervisor = _a.oldSupervisor, oldSubordinates = _a.oldSubordinates;
        this.moveEmployee(movedEmployee, oldSupervisor);
        for (var _i = 0, oldSubordinates_1 = oldSubordinates; _i < oldSubordinates_1.length; _i++) {
            var oldSubordinate = oldSubordinates_1[_i];
            this.addEmployeeToSupervisor(oldSubordinate, movedEmployee);
        }
        this.historyPointer++;
    };
    return EmployeeOrgApp;
}());
var ceo = {
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
                                    subordinates: []
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
                    subordinates: []
                },
                {
                    uniqueId: 8,
                    name: 'George',
                    subordinates: []
                },
                {
                    uniqueId: 9,
                    name: 'Gary',
                    subordinates: []
                },
            ]
        },
        {
            uniqueId: 4,
            name: 'Bruce',
            subordinates: []
        },
        {
            uniqueId: 5,
            name: 'Georgina',
            subordinates: [
                {
                    uniqueId: 10,
                    name: 'Sophie',
                    subordinates: []
                },
            ]
        },
    ]
};
var app = new EmployeeOrgApp(ceo);
app.move(11, 5);
console.log(ceo);
console.log(ceo.subordinates[3]);
