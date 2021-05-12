import React, { PureComponent } from 'react'
import { Link, Redirect } from 'react-router-dom';
import styled from 'styled-components';
import { URL } from "./constants";

class Login extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            status: undefined,
        }

    }

    render() {
        const { email, password, data } = this.state;

        if (data && data.success) {
            return <Redirect to="/"/>
        }

        return (
            <Container>
                <h3>Login</h3>
                <form onSubmit={this.onSubmit}>
                    <div>
                        <label>Email</label>
                        <input value={email} onChange={e => this.setState({ email: e.target.value })} className="form-control"></input>
                    </div>
                    <div>
                        <label>Password</label>
                        <input value={password} onChange={e => this.setState({ password: e.target.value })}className="form-control" type="password"></input>
                    </div>
                    <ButtonContainer>
                        <button type="submit" className="btn btn-primary" disabled={(!email || !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i.test(email)) || !password}>Login</button>
                        <Link to="/signup">Sign Up</Link>
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
        const { email, password } = this.state;

        const data = { email, password };
        await fetch( URL + '/v1/users/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
                body: JSON.stringify(data),
            }).then(response => {
                return response.json()
            }).then(data => {
                localStorage.setItem("user_token", data.token);
                this.setState({ data });
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

export default Login