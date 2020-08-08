import crypto from "crypto";
import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Redirect, Switch } from "react-router-dom";
import { compose } from "redux";

import Snackbar from "./misc/Snackbar";
import Result from "./main/admin/Result";
import FirstResult from "./main/admin/Result/First";
import SecondResult from "./main/admin/Result/Second";
import ThirdResult from "./main/admin/Result/Third";

import SignIn from "./main/admin/Auth/SignIn/Loadable";
import ForgetPassword from "./main/admin/Auth/ForgetPassword/Loadable";
import ResetPassword from "./main/admin/Auth/ResetPassword/Loadable";

import CandidateList from "./main/user/CandidateList";
import ThankYou from "./main/user/ThankYou";
import ThankYou1 from "./main/user/ThankYou/ThankYou1.js";

import Background from "./misc/Background";
import AdminRouter from "./main/admin/AdminRouter";

class App extends Component {
  async componentDidMount() {
    window.myOwnUniqueId = (await crypto.randomBytes(48)).toString("hex");
  }

  render() {
    return (
      <BrowserRouter>
        <Fragment>
          <Snackbar />
          <Switch>
            <Route
              path="/resetpassword/users/:userId/email/:email/token/:token"
              component={ResetPassword}
            />
            {!this.props.token ? (
              <Fragment>
                <Background opacity={0.7} />
                <Switch>
                  <Route path="/candidateList" component={CandidateList} />
                  <Route path="/verify/:tokenID" component={ThankYou} />
                  <Route path="/thankYou" component={ThankYou1} />
                  <Route path="/openSesame" component={SignIn} />
                  <Route path="/forgetPassword" component={ForgetPassword} />
                  <Route
                    path="*"
                    component={() => <Redirect to="/candidateList" />}
                  />
                </Switch>
              </Fragment>
            ) : (
              <Fragment>
                <Switch>
                  <Route path="/result/first" component={FirstResult} />
                  <Route path="/result/second" component={SecondResult} />
                  <Route path="/result/third" component={ThirdResult} />
                  <Route path="/result" component={Result} />

                  <Route path="/admin" component={AdminRouter} />
                  <Route path="*" component={() => <Redirect to="/admin" />} />
                </Switch>
              </Fragment>
            )}
          </Switch>
        </Fragment>
      </BrowserRouter>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.auth
  };
}

export default compose(connect(mapStateToProps))(App);
