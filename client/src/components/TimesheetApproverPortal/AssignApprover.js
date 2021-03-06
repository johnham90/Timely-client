import React, { Component } from "react";
import { Button } from "@material-ui/core/";
import MUIDatatable from "mui-datatables";
import agent from "../../api/agent.js";
import Alert from "../Alert/Alert";
import {
  withStyles,
  ThemeProvider,
  createMuiTheme,
  MuiThemeProvider,
} from "@material-ui/core/styles";
import "./tsApproverPortal.css";

/**
 * Defines the columns for the assign approver table.
 */
const columns = [
  { name: "employeeId", label: "Employee ID", className: "column" },
  { name: "firstName", label: "First Name", className: "column" },
  { name: "lastName", label: "Last Name", className: "column" },
  { name: "approverStatus", label: "Approver Status", className: "column" },
  { name: "assign", label: "Assign", className: "column" },
];

/**
 * Author: John Ham
 * Version: 1.0
 * Description: Timesheet Approver Portal Component.
 * To be used by a supervisor to give or revoke secondary timesheet approver
 * status to employees.
 */
class TimesheetApproverPortal extends Component {
  getCustomTheme = () =>
  createMuiTheme({
    overrides: {
      MUIDataTable: {
        paper: {
          padding: "45px"
        }
      },
      MUIDataTableHeadCell: {
        data: {
          fontSize: "16px",
          fontWeight: "bold"
        }
      },
      MUIDataTableBodyCell: {
        root: {
          fontSize: "16px"
        }
      },
      MUIDataTableToolbar: {
        root: {
          padding: "0"
        }
      }
    },
  });

  constructor(props) {
    super(props);

    this.state = {
      data: [],
      errorAlert: false,
    };

    this.fetchData = this.fetchData.bind(this);
    this.errorHandling = this.errorHandling.bind(this);
  }

  componentDidMount() {
    this.fetchData();
  }

  errorHandling() {
    this.setState({
      errorAlert: true,
    });
    setTimeout(() => {
      this.setState({
        errorAlert: false,
      });
      this.props.history.push(`/dashboard/tsapprover/`);
    }, 1000);
  }

  /**
   * Gets a list of the employees associated with the supervisor from the database.
   */
  async getEmployees() {
    const token = localStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user"));
    try {
      var response = await agent.employeeInfo.getEmployeesBySupervisor(
        user.employee_id,
        token
      );
    } catch (e) {
      this.errorHandling();
      return [];
    }
    return response;
  }

  async setApprover(employee) {
    employee.is_secondary_approver = true;
    const token = localStorage.getItem("token");
    try {
      var response = await agent.employeeInfo.updateEmployee(
        employee.employee_id,
        token,
        employee
      );
    } catch (e) {
      this.errorHandling();
      return;
    }
    this.props.history.push(`/dashboard/tsapprover/`);
  }

  async removeApprover(employee) {
    employee.is_secondary_approver = false;
    const token = localStorage.getItem("token");
    try {
      var response = await agent.employeeInfo.updateEmployee(
        employee.employee_id,
        token,
        employee
      );
    } catch (e) {
      this.errorHandling();
      return;
    }
    this.props.history.push(`/dashboard/tsapprover/`);
  }

  /**
   * Gets the necessary information from the employees' data and stores
   * them in an array.
   */
  async fetchData() {
    const { classes } = this.props;

    var employeeData = await this.getEmployees();
    var resultData = [];
    for (let i = 0; i < employeeData.length; i++) {
      let id = employeeData[i].employee_id;
      let firstName = employeeData[i].first_name;
      let lastName = employeeData[i].last_name;
      let approverStatus = employeeData[i].is_secondary_approver.toString();

      let row = [];
      row.push(id);
      row.push(firstName);
      row.push(lastName);
      row.push(approverStatus);
      if (employeeData[i].is_secondary_approver) {
        row.push(
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.removeApprover(employeeData[i])}
          >
            Remove
          </Button>
        );
      } else {
        row.push(
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setApprover(employeeData[i])}
          >
            Assign
          </Button>
        );
      }
      resultData.push(row);
    }

    this.setState({
      data: resultData,
    });
  }

  render() {
    const { classes } = this.props;

    /**
     * Configuration object for the MUI data table.
     */
    const options = () => {
      const data = {
        selectableRows: false,
        search: true,
        print: false,
        download: false,
        filter: false,
      };
      return data;
    };

    return (
      <div className="assignApprover-container">
        <MuiThemeProvider theme={this.getCustomTheme()}>
          {this.state.errorAlert ? (
            <Alert
              config={{
                message: "An error has occurred. Please try again.",
                variant: "error",
              }}
            />
          ) : null}
          <MUIDatatable
            className="datatable"
            title={<div className="assignApprover-secondaryTsApproverTitle">Secondary Timesheet Approver</div>}
            options={options(this.props)}
            columns={columns}
            data={this.state.data}
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default TimesheetApproverPortal;
