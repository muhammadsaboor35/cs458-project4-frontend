import React from "react";
import { Route, Switch } from "react-router";
import Login from "./Login";
import Signup from './Signup';
import Symptoms from './Symptoms';

const Routes = () => {
  return (
    <Switch>
        <Route path="/" component={Symptoms} exact></Route>
        <Route path="/login" component={Login} exact></Route>
        <Route path="/signup" component={Signup} exact></Route>
    </Switch>
  );
};

export default Routes;
