import React, { PureComponent } from "react";
import { countries, findCountryByShortCode } from "./countries";
import styled from "styled-components";
import { Table } from "react-bootstrap";
import { SYMPTOMS, SYMPTOMS_KEY_VALUE, URL } from "./constants";
import DayPicker, { DateUtils } from "react-day-picker";
import { Modal } from "react-bootstrap";
import "react-day-picker/lib/style.css";
import moment from "moment";
import { Multiselect } from "multiselect-react-dropdown";
import { Redirect } from "react-router";

class Symptoms extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      from: "",
      to: "",
      show: false,
      symptomsList: [],
      historyResults: undefined,
      status: undefined,
	  logout: false
    };
  }

  async componentDidMount() {
    const response = await fetch(URL + "/v1/history/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("user_token"),
      },
    });
    if (response.status === 401) {
        this.setState({ status: 401 })
    }
    const data = await response.json();
    this.setState({
        user: data.user,
        historyResults: data.history_results,
        alert: data.alert,
    });
  }

  render() {
    const { alert, user, historyResults, from, to, show, data, logout } = this.state;
    if (this.state.status === 401 || logout) {
		localStorage.clear();
        return <Redirect to="/login" />
    }
    return (
      <div>
		<UserCard>
        {user && (
          <UserProfile>
            <h2>{user.name}</h2>
            <p>Age: {user.age}</p>
            <p>Location: {countries[user.location].label}</p>
            <p>Nationality: {countries[user.nationality].label}</p>
          </UserProfile>
        )}
		  <LogoutButton
          onClick={() => this.setState({ logout: true })}
          className="btn btn-primary"
          >
          Logout
        </LogoutButton>
		</UserCard>

        <Modal
          show={show}
          onHide={() => this.setState({ show: false })}
          dialogClassName="modal-90w"
          aria-labelledby="example-custom-modal-styling-title"
        >
          <DayPicker
            className="Selectable"
            numberOfMonths={1}
            selectedDays={[from, { from, to }]}
            onDayClick={this.handleDayClick}
          />
          <ButtonContainer>
            <div>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => this.handleResetClick()}
              >
                Reset
              </button>
            </div>
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => this.handleDateSet()}
              >
                Select
              </button>
            </div>
          </ButtonContainer>
        </Modal>
        <SelectDatesButton
          onClick={() => this.setState({ show: true })}
          className="btn btn-primary"
        >
          Select Dates
        </SelectDatesButton>
        {to && from ? <Dates>{moment(from).format("YYYY-MM-DD")} - {moment(to).format("YYYY-MM-DD")}</Dates>
        : <Dates>{moment(new Date().setDate(new Date().getDate() - 15)).format("YYYY-MM-DD")} - {moment(new Date()).format("YYYY-MM-DD")}</Dates>
        }
        {typeof historyResults === "undefined" ? (
          <StyledText>
            <p>Loading...</p>
          </StyledText>
        ) : typeof historyResults !== "undefined" &&
          historyResults.length > 0 ? (
          <StyledTable>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symptoms</th>
                </tr>
              </thead>
              <tbody>
                {historyResults &&
                  historyResults.map((result, index) => {
                    return (
                      <tr key={"tablerow" + index}>
                        <td>{result.date}</td>
                        <td>
                          <ul>
                            {result.symptoms.map((symptom, index) => {
                              return (
                                <li key={"symptom" + index}>
                                  {SYMPTOMS[symptom]}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </StyledTable>
        ) : (
          <StyledText>
            <p>No symptoms to show. Select a valid date range.</p>
          </StyledText>
        )}
        {alert && <ErrorDiv className={`alert alert-${this.resolveDegree()} alert-dismissible fade show`} role="alert">
            {alert}
        </ErrorDiv>}
        <SymptomSelectContainer>
          <p>Please choose your symptoms</p>
          <Multiselect
            options={SYMPTOMS_KEY_VALUE}
            displayValue="text"
            onSelect={this.onSelect}
            onRemove={this.onRemove}
          />
        </SymptomSelectContainer>
        <SubmitSymptomsButton>
          <button
            className="btn btn-primary"
            onClick={() => this.submitSymptoms()}
            disabled={this.state.symptomsList.length === 0}
          >
            Submit Symptoms
          </button>
        </SubmitSymptomsButton>
        {data && !data.success && <ErrorDiv className={`alert alert-warning alert-dismissible fade show`} role="alert">
            {data.message}
        </ErrorDiv>}
      </div>
    );
  }

  onSelect = (selectedList, selectedItem) => {
    this.setState({ symptomsList: [...selectedList] });
  };

  onRemove = (selectedList, removedItem) => {
    this.setState({ symptomsList: [...selectedList] });
  };

  handleDayClick = (day) => {
    const range = DateUtils.addDayToRange(day, this.state);
    this.setState(range);
  };

  handleResetClick = () => {
    this.setState({ from: undefined, to: undefined });
  };

  handleDateSet = async () => {
    const { from, to } = this.state;
    if (!from || !to) return;

    const data = {
      start_date: moment(from).format("YYYY-MM-DD"),
      end_date: moment(to).format("YYYY-MM-DD"),
    };
    await fetch(
      URL + `/v1/history/?start_date=${data.start_date}&end_date=${data.end_date}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("user_token"),
        },
      }
    )
      .then((response) => {
            if (response.status === 401) {
                this.setState({ status: 401 })
            }
            return response.json()
        })
      .then((data) => {
        this.setState({
            user: data.user,
            historyResults: data.history_results,
            alert: data.alert,
            show: false
        });
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  submitSymptoms = async () => {
    const data = {
      symptoms: this.state.symptomsList.map((symptom) => symptom.key),
    };
    await fetch(URL + "/v1/history/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("user_token"),
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
            if (response.status === 401) {
                this.setState({ status: 401 })
            }
            return response.json();
        })
      .then((data) => {
        console.log(data);
        this.setState({ data })
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  resolveDegree = () => {
    const { alert } = this.state;
    if (!alert) return;
    if (alert.toLowerCase().includes("no alerts")) return "success";
    if (alert.toLowerCase().includes("all most common")) return "primary";
    if (alert.toLowerCase().includes("less common")) return "warning";
    if (alert.toLowerCase().includes("serious")) return "danger";
    return "primary";
  }
}

const UserCard =  styled.div`
  display: flex;
  justify-content: space-between;
`;

const UserProfile = styled.div`
  width: 30%;
  height: fit-content;
  position: relative;
  margin-bottom: 10px;

  left: 10%;
  p {
    font-size: 20px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  padding-bottom: 10px;
  div {
    width: 40%;
    button {
      width: 100%;
    }
  }
`;

const SelectDatesButton = styled.div`
  position: relative;
  left: 10%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const LogoutButton = styled.div`
  left: 10%;
  margin-right: 10%;
  height: 25%;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const StyledTable = styled.div`
  width: 80%;
  position: relative;
  left: 10%;
  overflow-y: auto;
  max-height: 400px;
  border: 2px solid black;
  margin-bottom: 10px;
`;

const SymptomSelectContainer = styled.div`
  margin-top: 15px;
  width: 80%;
  position: relative;
  left: 10%;
`;

const StyledText = styled.div`
  position: relative;
  text-align: center;
  p {
    font-size: 20px;
  }
`;

const SubmitSymptomsButton = styled.div`
  text-align: center;
  margin-top: 10px;
`;

const ErrorDiv = styled.div`
    width: 80%;
    position: relative;
    left: 10%;
    margin-top: 10px;
`;

const Dates = styled.span`
  position: relative;
  left: 12%;
`;

export default Symptoms;
