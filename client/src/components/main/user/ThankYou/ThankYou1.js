import "react-table/react-table.css";
import React, { Fragment } from "react";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Fade from "react-reveal/Fade";

import Lotus from "../CandidateList/svg/Lotus";
import ThankYou from "../../../../res/images/thankYou.png";
import { Typography } from "@material-ui/core";

const styles = theme => ({
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover"
  },
  wrapper: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  logo: {
    width: "50%",
    maxWidth: "300px"
  },
  titleWrapper: {
    marginTop: "1.8em",
    marginBottom: "0.8em",
    textAlign: "center"
  },
  title: {
    color: "#CFB539",
    width: "70%",
    maxWidth: "500px",
    display: "block",
    margin: "auto"
  },
  lotus: {
    width: "2em"
  },
  contentText: {
    color: "#CFB539",
    fontSize: "2em",
    fontFamily: "Times New Roman",
    padding: "0 0.5em",
    marginBottom: "0.5em",
  },
  footer: { marginTop: "2.5em", width: "75%", maxWidth: "500px" }
});

class ThankYOu1 extends React.Component {
  render() {
    const { classes, history } = this.props;

    return (
      <Fragment>
        <Grid container justify="center">
          <Grid item xs={12}>
            <div className={classes.wrapper}>
              <Fade bottom>
                <img
                  src={require("../../../../res/images/logo.png")}
                  alt=""
                  className={classes.logo}
                />

                <div className={classes.titleWrapper}>
                  {/* <img alt="" src={ThankYou} className={classes.title} /> */}
                  <p className={classes.contentText}>
                    We have sent you an email to verify your account.
                  </p>
                  <p className={classes.contentText}>
                    Please check your email inbox or spam.
                  </p>
                </div>

                <Lotus size={50} className={classes.lotus} />

                <div style={{ marginTop: "0.5em" }}>
                  <Button
                    style={{
                      color: "white",
                      background: "#CFB539",
                      padding: "5px 12px",
                      fontFamily: "Perpetua",
                      borderRadius: "8px"
                    }}
                    onClick={() => history.push("/candidateList")}
                    size="small"
                  >
                    Back to Candidate List
                  </Button>
                </div>

                <img
                  src={require("../../../../res/images/footer.png")}
                  alt=""
                  className={classes.footer}
                />
              </Fade>
            </div>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

export default compose(withStyles(styles))(ThankYOu1);
