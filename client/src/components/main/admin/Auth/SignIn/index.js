import _ from "lodash";
import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { reduxForm, Field } from "redux-form";
import { withStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import CircularProgress from "@material-ui/core/CircularProgress";
import Typography from "@material-ui/core/Typography";

import * as authActions from "../../../../../actions/auth";
import * as snackbarActions from "../../../../../actions/snackbar";
import CleanLink from "../../../../misc/CleanLink";
import SignInWallpaper from "../../../../../res/images/sign_in_wallpaper.jpg";

const styles = theme => ({
  rootGridContainer: {
    height: "100vh",
    width: "100vw",
    background: "yellow"
  },
  leftGridItem: {
    backgroundImage: `url(${SignInWallpaper})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat"
  },
  rightGridItem: {
    height: "100vh",
    background: "green"
  },
  formContainer: {
    height: "100vh",
    width: "100%",
    background: "white",
    alignItems: "center"
  },
  formItem: {
    width: "100%",
    background: "white",
    padding: "2em"
  },
  authInfo: {
    color: "red",
    marginTop: "1em"
  },
  button: {
    marginTop: theme.spacing.unit * 1,
    marginBottom: theme.spacing.unit * 3,
    backgroundColor: "blue"
  },
  wallpaper: {
    display: "block",
    width: "100%",
    height: "100%",
    objectFit: "cover"
  }
});

const SUBMITTING = "SUBMITTING",
  IDLE = "IDLE";

class SignIn extends Component {
  state = {
    authInfo: "",
    submitStatus: IDLE
  };

  onSubmit = async formValues => {
    const { signIn, history } = this.props;
    try {
      this.setState({ submitStatus: SUBMITTING });
      await signIn(_.pick(formValues, ["email", "password"]));
      history.push("/admin");
    } catch (error) {
      console.log({ error });
      return this.setState({ authInfo: error.msg });
    } finally {
      this.setState({ submitStatus: IDLE });
    }
  };

  renderField = field => {
    const { touched, error } = field.meta;
    return (
      <div>
        <TextField
          {...field}
          {...field.input}
          fullWidth
          autoComplete="off"
          helperText={
            touched ? (
              <div style={{ color: "red" }}>{error}</div>
            ) : (
              <p>&nbsp;</p>
            )
          }
        />
      </div>
    );
  };

  render() {
    const { authInfo, submitStatus } = this.state;
    const { classes, handleSubmit } = this.props;
    return (
      <Grid container className={classes.rootGridContainer}>
        <Grid
          item
          xs={false}
          sm={7}
          md={8}
          lg={9}
          className={classes.leftGridItem}
        />
        <Grid
          item
          xs={12}
          sm={5}
          md={4}
          lg={3}
          className={classes.rightGridItem}
        >
          <Grid container className={classes.formContainer}>
            <Grid item xs={12} className={classes.formItem}>
              <Typography
                variant="h4"
                style={{ color: "blue", fontFamily: "Baloo Chettan" }}
              >
                VOTING SYSTEM
              </Typography>
              <Typography variant="body2" gutterBottom>
                Ambassador UPHMC 2020
              </Typography>
              <br />
              <form onSubmit={handleSubmit(this.onSubmit)}>
                <div>
                  <Field
                    type="email"
                    name="email"
                    label="Email"
                    component={this.renderField}
                    disabled={submitStatus === SUBMITTING}
                  />
                </div>
                <div>
                  <Field
                    type="password"
                    name="password"
                    label="Password"
                    component={this.renderField}
                    disabled={submitStatus === SUBMITTING}
                  />
                </div>
                <Typography component="p" className={classes.authInfo}>
                  {authInfo}
                </Typography>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  fullWidth={true}
                  className={classes.button}
                  disabled={submitStatus === SUBMITTING}
                >
                  {submitStatus === SUBMITTING ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
              <Typography component="p">
                <CleanLink
                  to={submitStatus === SUBMITTING ? "" : "/forgetPassword"}
                >
                  Forget password?
                </CleanLink>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

function validate(values) {
  const errors = {};

  const emailTest = value =>
    value && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);
  if (!values.email) errors.email = "Please specify an email!";
  else if (!emailTest(values.email)) errors.email = "Invalid email address!";

  if (!values.password) errors.password = "Please specify a password!";

  return errors;
}

export default compose(
  withStyles(styles),
  reduxForm({ validate, form: "SignIn" }),
  connect(
    null,
    { ...authActions, ...snackbarActions }
  )
)(SignIn);
