import "react-table/react-table.css";
import "./css/anim.css";
import TickSound from "../../../../res/songs/tick.mp3";
import TadaSound from "../../../../res/songs/tada.mp3";
import Sound from "react-sound";
import _ from "lodash";
import moment from "moment";
import classNames from "classnames";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

import * as candidateActions from "../../../../actions/candidate";
import * as voteTokenActions from "../../../../actions/voteToken";
import BackgroundBig from "../../../misc/BackgroundBig";
import Hexagon from "./svg/Hexagon";
import Lotus from "./svg/Lotus";
import TripleLotus from "./svg/TripleLotus";
import QuestionMark from "../../../../res/images/question_mark.png";
import Winner from "../../../../res/images/winner.png";
import SelectInput from "@material-ui/core/Select/SelectInput";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  headline: {
    marginBottom: "1em"
  },
  excelButton: {
    marginBottom: "1em"
  },
  paper: {
    marginTop: "1em",
    padding: "2em"
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "1.5em 0"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "inline-block"
  },

  secondRunnerUpParagraph: {
    textAlign: "center",
    fontSize: "4.5em",
    fontWeight: "bold",
    marginBottom: "0.5em",
    background: "-webkit-linear-gradient(#f4e488, #9b3524)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent"
  },
  firstRunnerUpParagraph: {
    textAlign: "center",
    fontSize: "4.5em",
    fontWeight: "bold",
    marginBottom: "0.5em",
    background: "-webkit-linear-gradient(#dde0e3, #6f6e6c)",
    "-webkit-background-clip": "text",
    "-webkit-text-fill-color": "transparent"
  },

  orderNumberPart: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1em"
  },
  orderNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "100%",
    color: "white",
    border: "1.5px solid #CFB539",
    width: "1.7em",
    height: "1.7em",
    margin: "0 0.5em",
    fontSize: "1.25em",
    padding: "2px"
  },
  shortBar: {
    width: "22px",
    height: "1px",
    backgroundColor: "#CFB539"
  },

  fullnameParagraph: {
    fontSize: "2.8em",
    color: "white"
  },
  voteParagraph:{
    fontSize: "2.8em",
    color: "white",
    marginTop: "0.3em"
  },
  longBar: {
    width: "300px",
    height: "1.5px",
    backgroundColor: "#CFB539",
    margin: "1.2em 0"
  },
  majorParagraph: {
    fontSize: "1.25em",
    color: "white"
  },

  dotContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: 0,
    left: 0,
    color: "gray",
    width: "100vw",
    marginBottom: "1em"
  },
  slash: {
    margin: "0 1em"
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "100%",
    marginLeft: "2px",
    border: "1px solid gray"
  },
  activeDot: {
    background: "gray"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  IDLE = "IDLE";

function pad2(value) {
  return value <= 9 ? "0" + value : value;
}

class ResultIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    top3Candidates: [],
    top3VoteCount:[],
    allCandidates: [],
    candidateIndex: 0,
    stepIndex: 10,
    sounds: {}
  };

  alive = false;

  handleSongFinishedPlaying = removedId => () => {
    this.setState(state => ({
      sounds: _.pickBy(state.sounds, (special, id) => id !== removedId)
    }));
  };

  fetchData = async () => {
    const { getCandidates, getVoteTokens } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      const { candidates } = await getCandidates();
      const { voteTokens } = await getVoteTokens();
      
      const voteTokensPerCandidate = _.groupBy(voteTokens, "candidateId");

      //get top 3 candidate (reversed 3,2,1)
      const top3Candidates = _.chain(candidates)
        .sortBy(
          [cand => -(voteTokensPerCandidate[cand._id] || []).length],
          [cand => cand.orderNumber]
        )
        .slice(0, 3)
        .reverse()
        .value();

      // get vote count from top 3 candidate (reverse 3, 2, 1)
      const top3VoteCount = _.chain(top3Candidates)
        .map(cand => voteTokensPerCandidate[cand._id].length )
        .value();

      this.setState(state => ({
        loadingStatus: IDLE,
        top3Candidates,
        top3VoteCount,
        allCandidates: _.values(candidates)
      }));
      
      setTimeout(this.mainLoop, 200);
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  speeds = [1000, 50, 200, 500, 1000];

  // for looping the iamge
  mainLoop = () => {
    const {
      candidateIndex,
      allCandidates,
      top3Candidates,
      stepIndex
    } = this.state;

    if (stepIndex % 5 === 0) {
    } else if (stepIndex % 5 === 4) {
      const candidate = allCandidates[candidateIndex];
      if (candidate._id !== top3Candidates[Math.floor(stepIndex / 5)]._id) {
        const newCandidateIndex = (candidateIndex + 1) % allCandidates.length;
        this.setState(state => ({
          candidateIndex: newCandidateIndex,
          sounds: { ...state.sounds, [moment().valueOf()]: false }
        }));
      } else {
        this.alive = false;
        this.setState(state => ({
          sounds: { ...state.sounds, [moment().valueOf()]: true }
        }));
      }
    } else {
      const newCandidateIndex = (candidateIndex + 1) % allCandidates.length;
      this.setState(state => ({
        candidateIndex: newCandidateIndex,
        sounds: { ...state.sounds, [moment().valueOf()]: false }
      }));
    }
    
    if (this.alive)
      setTimeout(() => {
        this.mainLoop();
      }, this.speeds[stepIndex % 5]);
  };

  // key event listener
  handleKeyDown = event => {
    const { stepIndex } = this.state;
    switch (event.keyCode) {
      case 37: // left arrow key
        if ((stepIndex - 1 + 5) % 5 !== 4)
          this.setState({
            stepIndex: stepIndex - 1
          });
        break;
      case 39: // right arrow key
        if (stepIndex + 1 < 15)
          this.setState({
            stepIndex: stepIndex + 1
          });
        break;
      default:
        break;
    }
  };

  async componentDidMount() {
    this.alive = true;
    await this.fetchData();
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount() {
    this.alive = false;
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  render() {
    const { classes } = this.props;
    const {
      loadingStatus,
      candidateIndex,
      allCandidates,
      top3VoteCount,
      stepIndex,
      sounds
    } = this.state;
    const candidate = allCandidates[candidateIndex];
    const sectionIndex = Math.floor(stepIndex / 5);
    const firstWinnerVoteCount = top3VoteCount[2];

    // const infoEnabled =
    //   stepIndex % 5 === 4 &&
    //   candidate._id === top3Candidates[Math.floor(stepIndex / 5)]._id;

    const infoEnabled = !this.alive;

    const opacities = [0.5, 0.75, 1];

    return (
      <Fragment>
        {_.map(sounds, (special, id) => (
          <Sound
            key={id}
            url={special ? TadaSound : TickSound}
            playStatus={Sound.status.PLAYING}
            volume={100}
            onFinishedPlaying={this.handleSongFinishedPlaying(id)}
          />
        ))}

        <BackgroundBig opacity={opacities[sectionIndex]} />

        {/* the small dot at below after hexagon */}
        <div className={classes.dotContainer}>
          {_.range(10, 15).map(index => (
            <div
              className={classNames(classes.dot, {
                [classes.activeDot]: index <= stepIndex
              })}
            />
          ))}
        </div>

        <div
          style={{
            display: "flex",
            width: "100vw",
            height: "100vh",
            alignItems: "center"
          }}
        >
          <Grid container justify="center" alignItems="center">
            <Grid item xs={12} style={{ textAlign: "center" }}>
              <img
                src={require("../../../../res/images/logo.png")}
                alt=""
                style={{ width: "250px" }}
              />
            </Grid>

            {/* 
              when loading is error show a button

            */}
            {loadingStatus === ERROR ? (
              //show a button when loading is error
              <Grid item xs={12}>
                <Typography variant="subtitle1" className={classes.retryText}>
                  Cannot fetch data
                </Typography>
                <Button
                  color="primary"
                  className={classes.retryButton}
                  onClick={this.fetchData}
                >
                  Retry
                </Button>
              </Grid>
            ) : loadingStatus === LOADING ? (
              //when status loading show loading progress
              <Grid item xs={12} style={{ textAlign: "center" }}>
                <CircularProgress size={50} />
              </Grid>
            ) : (
              <Fragment>
                <Grid item xs={12}>
                  <div style={{ marginTop: "0em" }}>
                    {sectionIndex === 0 ? (
                      <p className={classes.secondRunnerUpParagraph}>
                        2<sup>nd</sup> RUNNER UP
                      </p>
                    ) : sectionIndex === 1 ? (
                      <p className={classes.firstRunnerUpParagraph}>
                        1<sup>st</sup> RUNNER UP
                      </p>
                    ) : (
                      /**
                       * winner text by using picture
                       * hidden before the final result
                       * this picture will with the final result
                       */
                      <div
                        style={{ textAlign: "center" }}
                        className={classNames(
                          infoEnabled
                            ? "winner-paragraph-show"
                            : "winner-paragraph-hide"
                        )}
                      >
                        <img
                          alt=""
                          src={Winner}
                          style={{ width: "45%", marginBottom: "0.5em" }}
                        />
                      </div>
                    )}
                  </div>
                </Grid>
                
                {/* grid for result and image */}
                <Grid
                  item
                  xs={12}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {/* hexagon for picture  */}
                  <div style={{}}>
                    <Hexagon
                      id={1}
                      sectionIndex={sectionIndex}
                      size={380}
                      imgUrl={
                        stepIndex % 5 === 0
                          ? QuestionMark
                          : candidate.image.secureUrl
                      }
                    />
                  </div>

                  {/* this will show at final result */}
                  <div
                    xs={3}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                    className={infoEnabled ? "info-show" : "info-hide"}
                  >
                    <div className={classes.orderNumberPart}>
                      <div className={classes.shortBar} />
                      <div className={classes.orderNumber}>
                        {infoEnabled ? pad2(candidate.orderNumber) : ""}
                      </div>
                      <div className={classes.shortBar} />
                    </div>

                    <div>
                      {sectionIndex === 2 ? (
                        <TripleLotus
                          size={50}
                          style={{ marginTop: "0.3em", marginBottom: "0.65em" }}
                        />
                      ) : (
                        <Lotus
                          size={25}
                          style={{ marginTop: "0.3em", marginBottom: "0.65em" }}
                        />
                      )}
                    </div>
                    
                    <p className={classes.fullnameParagraph}>
                      {candidate.fullname}
                    </p>
                    <div className={classes.longBar} />
                    <p className={classes.majorParagraph}>{candidate.major}</p>
                    <p className={classes.voteParagraph}>Vote : {firstWinnerVoteCount}</p>
                  </div>
                </Grid>
              </Fragment>
            )}
          </Grid>
        </div>
      </Fragment>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate,
    ...state.voteToken
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions, ...voteTokenActions }
  )
)(ResultIndex);
