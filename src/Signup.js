import React, { PureComponent } from 'react'
import styled from 'styled-components';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

import { countries, findCountryByShortCode } from './countries';
import { URL } from './constants';
import { Link, Redirect } from 'react-router-dom';

class Signup extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            email: '',
            password: '',
            confirmPassword: '',
            age: '',
            location: '',
            nationality: '',
            name: '',
        }
    }

    render() {
        const { name, email, password, confirmPassword, age, location, nationality, data } = this.state;
        if (this.state.status === 200) {
            if (data && data.success) {
                return <Redirect to="/login"/>
            } 
        }
        return (
            <Container>
                <h3>
                    Signup
                </h3>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label>Name</label>
                        <input className="form-control" value={name} onChange={e => this.setState({ name: e.target.value })}></input>
                    </div>
                    <div>
                        <label>Email</label>
                        <input className="form-control" value={email} onChange={e => this.setState({ email: e.target.value })}></input>
                    </div>
                    <div>
                        <label>Password</label>
                        <input className="form-control" value={password} type="password" onChange={e => this.setState({ password: e.target.value })}></input>
                    </div>
                    <div>
                        <label>Confirm Password</label>
                        <input className="form-control" value={confirmPassword} type="password" onChange={e => this.setState({ confirmPassword: e.target.value })}></input>
                    </div>
                    <div>
                        <label>Age</label>
                        <input className="form-control" value={age} onChange={e => this.setState({ age: e.target.value })}></input>
                    </div>
                    <div>
                        <label>Location</label>
                        <Dropdown options={countries} onChange={country => this.setState({ location: country.value })} value={location}></Dropdown>
                    </div>
                    <div>
                        <label>Nationality </label>
                        <Dropdown options={countries} onChange={country => this.setState({ nationality: country.value })} value={nationality}></Dropdown>
                    </div>
                    <ButtonContainer>
                    <button type="submit" className="btn btn-primary" disabled={!name || (!email || !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(email)) || !password || !confirmPassword || !age || !location || !nationality || (password !== confirmPassword)}>Signup</button>
                    <Link to="/login">Already a member?</Link>
                    </ButtonContainer>
                </form>
                {data && !data.success &&
                <ErrorDiv className="alert alert-warning alert-dismissible fade show" role="alert">
                    {data.message || "Error occurred. Please try again."}
                </ErrorDiv>}
            </Container>
        )
    }

    onSubmit = async (e) => {
        e.preventDefault();
        const { email, password, name, age, location, nationality } = this.state;
        let nationality_country = undefined;
        let location_country = undefined;
        for (let i = 0; i < countries.length; i++) {
            if (countries[i].value === nationality) {
                nationality_country = i;
            }
            if (countries[i].value === location) {
                location_country = i;
            } 
        }
        const data = { 
            email, 
            password, 
            name, 
            age: age, 
            location: location_country + "", 
            nationality: nationality_country + "" 
        };
        await fetch(URL + '/v1/users/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data),
            }).then(response => {
                if (response.status === 200) {
                    this.setState({ status: 200 });
                }
                return response.json()
            }).then(data => {
                this.setState({ data });
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
        });
    }
}


const Container = styled.div`
    width: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`; 

const ButtonContainer = styled.div`
    padding-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    button {
    display: block;
    width: 20%;
        padding-top: 10px;
    }
    a {
        display: block;
        padding-top: 10px;
    }
`;

const ErrorDiv = styled.div`
    
`;


export default Signup