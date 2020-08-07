import "react-table/react-table.css";
import React, { Fragment } from "react";
import { compose } from "redux";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Fade from "react-reveal/Fade";

import Lotus from "../CandidateList/svg/Lotus";
import votingApi from "../../../../apis/voting.js";
import ThankYou from "../../../../res/images/thankYou.png";

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
  footer: { marginTop: "2.5em", width: "75%", maxWidth: "500px" }
});

class CandidateListIndex extends React.Component {
  state = {
    errorMessage : "",
  }

  async componentDidMount(){
    try{
      const response = await votingApi().post(`/voteTokens/verify/${this.props.match.params.tokenID}`);

    }catch (error){
      console.error({ error });
      console.log(error.response.data.error.msg)
      this.setState({
        errorMessage : error.response.data.error.msg 
      })
    }
  }

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

                  {
                  this.state.errorMessage ?
                  (<div className={classes.titleWrapper}>
                    {/* <img alt="" src={ThankYou} className={classes.title} /> */}
                    <p className={classes.contentText}>
                      {this.state.errorMessage}
                    </p>
                  </div>)
                  :
                  (<div className={classes.titleWrapper}>
                      <div className={classes.titleWrapper}>
                        <img alt="" src={ThankYou} className={classes.title} />
                      </div>
                  </div>)
                }

                

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

export default compose(withStyles(styles))(CandidateListIndex);
