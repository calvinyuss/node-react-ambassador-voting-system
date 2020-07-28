import "react-table/react-table.css";
import "./css/gradient-button.css";
import "./css/splash.css";
import _ from "lodash";
import $ from "jquery";
import moment from "moment";
import classNames from "classnames";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import scrollSnapPolyfill from "css-scroll-snap-polyfill";
import { withStyles } from "@material-ui/core/styles";
import { ArrowRightAlt as ArrowRightAltIcon } from "@material-ui/icons";

import * as candidateActions from "../../../../actions/candidate";
import * as configurationActions from "../../../../actions/configuration";
import ConfirmDialog from "./dialogs/ConfirmDialog";
import Hexagon from "./svg/Hexagon";
import Lotus from "./svg/Lotus";
import AmbasVotingSystem from "../../../../res/images/ambas_voting_system.png";
import VoteForYour from "../../../../res/images/vote_for_your.png";
import Logo from "../../../../res/images/logo.png";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  },
  paper: {
    padding: "2em"
  },
  picture: {
    width: "150px",
    height: "150px",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "inline-block"
  },

  splashItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
    scrollSnapAlign: "start",
    flex: "0 0 auto"
  },

  circularProgress: {
    circleIndeterminate: {
      color: "#cfb539",
      backgroundColor: "#cfb539"
    }
  },

  cardWrapper: {
    // position: "relative",
    display: "flex",
    flexWrap: "nowrap",
    overflowX: "scroll",
    height: "100vh",
    width: "100vw",
    alignItems: "center",
    "&::-webkit-scrollbar": {
      display: "none"
    },
    "-ms-overflow-style": "none", // IE 10+
    "scrollbar-width": "none",
    "scroll-snap-type": "x mandatory" /* Chrome Canary */,
    "-moz-scroll-snap-type": "mandatory" /* Firefox */,
    "-ms-scroll-snap-type": "mandatory" /* IE/Edge */,
    "-webkit-scroll-snap-type": "mandatory" /* Safari */,
    "scroll-snap-points-x": "repeat(100vw)",
    "-webkit-scroll-snap-destination": "0% 0%",
    "-webkit-overflow-scrolling": "touch" /* important for iOS */
  },
  card: {
    flex: "0 0 auto",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    "scroll-snap-align": "center" /* latest (Chrome 69+) */,
    "-moz-scroll-snap-align": "center" /* latest (Chrome 69+) */,
    "scroll-snap-coordinate": "50% 50%" /* older (Firefox/IE) */,
    "-webkit-scroll-snap-coordinate": "50% 50%" /* older (Safari) */
  },
  // cardContent: {
  //   flexGrow: 1,
  //   display: "flex",
  //   alignItems: "center",
  //   flexDirection: "column"
  // },
  orderNumberPart: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "1.5em",
    marginBottom: "0.7em"
  },
  orderNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "100%",
    color: "white",
    border: "1.5px solid #CFB539",
    width: "1.5em",
    height: "1.5em",
    margin: "0 0.5em",
    fontSize: "1.25em",
    padding: "2px"
  },
  shortBar: {
    width: "28px",
    height: "1px",
    backgroundColor: "#CFB539"
  },

  imageWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  fullnameParagraph: {
    fontSize: "1.5em",
    textAlign: "center",
    color: "white"
  },
  longBar: {
    width: "100px",
    height: "1px",
    backgroundColor: "#CFB539",
    margin: "0.6em auto"
  },
  majorParagraph: {
    fontSize: "1em",
    textAlign: "center",
    color: "white"
  },
  direction: {
    textAlign: "center"
  },

  topDiv: {
    width: "100%",
    textAlign: "center"
  },
  topDivFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundImage: `
      url(${require("../../../../res/images/top_left_trans.png")}),
      url(${require("../../../../res/images/top_right_trans.png")}),
      linear-gradient(to right, #1b1a17, #1b1a17)
    `,
    backgroundRepeat: "no-repeat, no-repeat",
    backgroundPosition: "left 0 top 0, right 0 top 0",
    backgroundSize: "3.5em, 3.5em, 100%",
    zIndex: 10,
    visibility: "hidden",
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    width: "100vw",
    textAlign: "center"
  }
});

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

const animationClassNames = ["splash-logo-1", "splash-logo-2", "splash-logo-3"];

const paragraphClassNames = [
  "splash-paragraph-1",
  "splash-paragraph-1",
  "splash-paragraph-2"
];

class CandidateListIndex extends React.Component {
  state = {
    loadingStatus: LOADING,
    animationStatus: 0,
    scrollable: false,
    message: null,
    innerHeight: window.innerHeight,
    innerWidth: window.innerWidth
  };

  configInterval = null;

  updateDimensions = () => {
    this.setState({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
  };
  componentWillMount() {
    this.updateDimensions();
  }

  fetchData = async () => {
    const { getCandidates, getConfiguration } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await Promise.all([getCandidates(), getConfiguration()]);
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log("sudah error", { error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  toggleDialog = stateName => open =>
    this.setState(state => ({
      [stateName]: open === undefined ? !Boolean(state[stateName]) : open
    }));
  
  // showing main screen animation
  // fade in, zoom out, move to top
  startAnimation = () => {
    setTimeout(() => {
      // fade in animation
      this.setState(state => ({ animationStatus: state.animationStatus + 1 }));
      setTimeout(() => {
        // zoom out, move logo to top and show text
        this.setState(state => ({
          animationStatus: state.animationStatus + 1
        }));
      }, 2000);
    }, 1000);
  };

  async componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);

    // scrollSnapPolyfill();
    await this.fetchData();

    (() => {
      const { openMoment, closeMoment, onAir, classes } = this.props;
      const { loadingStatus } = this.state;
      const currentMoment = moment();

      if (loadingStatus === DONE) {
        if (!onAir) {
          this.setState({
            scrollable: false,
            message: (
              <p className={classes.direction}>
                Sorry, the voting is currently closed
              </p>
            )
          });
        } else if (currentMoment.valueOf() < openMoment.valueOf()) {
          this.setState({
            scrollable: false,
            message: (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column"
                }}
              >
                <p className={classes.direction}>The voting is still closed</p>
              </div>
            )
          });
        } else if (currentMoment.valueOf() > closeMoment.valueOf()) {
          this.setState({
            scrollable: false,
            message: (
              <p className={classes.direction}>The voting has been closed</p>
            )
          });
        } else {
          this.setState({
            scrollable: true,
            message: (
              <Fragment>
                <p>Swipe to see candidates</p>
                {/* swipe using arrow right key */}
                <ArrowRightAltIcon style={{ color: "white" }} />
              </Fragment>
            )
          });
        }
      } else if (loadingStatus === ERROR) {
        this.setState({
          scrollable: false,
          message: (
            <p className={classes.direction}>
              Error occured. Please kindly refresh this page.
            </p>
          )
        });
      }
    })();

    // $(".card-wrapper").on("scroll", function() {
    //   // jQuery support test
    //   // $(".card-wrapper").css({
    //   //   backgroundColor: ["red", "green", "blue", "yellow", "purple"][
    //   //     Math.floor(Math.random() * 5)
    //   //   ]
    //   // });
    //   const $firstCard = $(".first-card");
    //   const $firstCardOri = $(".first-card-ori");
    //   if ($firstCard.length) {
    //     const height = $firstCardOri.offset().top + $firstCardOri.outerHeight();
    //     if (this.scrollLeft >= window.innerWidth) {
    //       $firstCard.css({
    //         visibility: "visible",
    //         height
    //       });
    //       $(".ori-card").css({
    //         visibility: "hidden"
    //       });
    //     } else {
    //       $firstCard.css({
    //         visibility: "hidden",
    //         height
    //       });
    //       $(".ori-card").css({
    //         visibility: "visible"
    //       });
    //     }
    //   }
    // });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);

    if (this.configInterval !== null) {
      clearInterval(this.configInterval);
    }

    $(".card-wrapper").off("scroll");
  }

  render() {
    const { classes, candidates } = this.props;
    const {
      loadingStatus,
      animationStatus,
      message,
      scrollable,
      innerWidth
    } = this.state;

    let splashContent = null;
    let mainContent = null;

    //main screen 
    splashContent = (
      <Grid item xs={12} className={classes.splashItem}>
        <img
          src={require("../../../../res/images/logo.png")}
          alt=""
          onLoad={this.startAnimation}
          className={classNames(
            "splash-logo",
            animationClassNames[animationStatus]
          )}
        />
        <div
          className={classNames(
            "splash-paragraph",
            paragraphClassNames[animationStatus]
          )}
        >
          <img
            alt=""
            src={AmbasVotingSystem}
            style={{ width: "70%", maxWidth: "350px" }}
          />
        </div>

        <div
          className={classNames(
            "splash-loading",
            animationStatus >= 2 && loadingStatus === LOADING
              ? "splash-loading-2"
              : "splash-loading-1"
          )}
        >
          <CircularProgress size={32} classes={classes.circularProgress} />
        </div>

        <div
          className={classNames(
            "splash-direction",
            animationStatus >= 2 &&
              (loadingStatus === DONE || loadingStatus === ERROR)
              ? "splash-direction-2"
              : "splash-direction-1"
          )}
        >
          {message}
        </div>
      </Grid>
    );

    if (loadingStatus === DONE && animationStatus >= 2) {
      const data = _.chain(candidates)
        .values()
        .sortBy([cand => cand.orderNumber])
        .map(cand => ({
          ...cand,
          orderNumber:
            cand.orderNumber < 10 ? "0" + cand.orderNumber : cand.orderNumber
        }))
        .value();
      
      // contestant screen
      mainContent = data.map((d, index) => (
        <Grid
          item
          xs={12}
          sm={12}
          md={12}
          lg={12}
          key={d.orderNumber}
          className={classNames(classes.card)}
        >
          <div
            className={classNames(
              classes.topDiv,
              {
                "first-card-ori": index === 0
              },
              "ori-card"
            )}
          >
            <div style={{ textAlign: "center" }}>
              <img
                src={Logo}
                alt=""
                style={{
                  width: "40%",
                  maxWidth: "250px",
                  marginBottom: "0.5em"
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <img
                src={VoteForYour}
                alt=""
                style={{ width: "70%", maxWidth: "300px" }}
              />
            </div>
          </div>

          <div className={classes.orderNumberPart}>
            <div className={classes.shortBar} />
            <div className={classes.orderNumber}>{d.orderNumber}</div>
            <div className={classes.shortBar} />
          </div>

          <div className={classes.imageWrapper}>
            <Lotus size={35} />
            <Hexagon
              key={d.orderNumber}
              id={d.orderNumber}
              style={{ margin: "0 1.25em" }}
              // size={145}
              size={Math.min(260, 0.4 * innerWidth)}
              imgUrl={_.get(
                d,
                "image.secureUrl",
                "https://via.placeholder.com/300"
              )}
            />
            <Lotus size={35} />
          </div>

          <div>
            <Lotus
              size={20}
              style={{
                display: "block",
                margin: "auto",
                marginTop: "0.5em",
                marginBottom: "0.65em"
              }}
            />
          </div>

          <p className={classes.fullnameParagraph}>{d.fullname}</p>
          <div>
            <div className={classes.longBar} />
          </div>
          <p className={classes.majorParagraph}>{d.major}</p>

          <div style={{ textAlign: "center" }}>
            <button
              className="btn btn-grad-4"
              style={{
                marginTop: "1.5em",
                fontFamily: "Perpetua",
                border: "2px solid #9c7d2d",
                borderRadius: "8px",
                fontSize: "17px",
                padding: "10px 24px"
              }}
              onClick={() => this.toggleDialog("ConfirmDialog")(d)}
            >
              VOTE
            </button>
          </div>
        </Grid>
      ));
    }

    return (
      <div style={{}}>
        <Grid
          container
          className={classNames(classes.cardWrapper, "card-wrapper")}
        >
          {splashContent}
          {scrollable ? mainContent : null}
        </Grid>

        {this.state["ConfirmDialog"] && (
          <ConfirmDialog
            name="ConfirmDialog"
            state={this.state}
            toggleDialog={this.toggleDialog}
          />
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.candidate,
    ...state.configuration
  };
}

export default compose(
  withStyles(styles),
  connect(
    mapStateToProps,
    { ...candidateActions, ...configurationActions }
  )
)(CandidateListIndex);
