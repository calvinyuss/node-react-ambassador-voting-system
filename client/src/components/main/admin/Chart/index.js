import _ from "lodash";
import moment from "moment";
import React, { Fragment } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  // Cell,
  XAxis,
  YAxis,
  // CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import * as candidateActions from "../../../../actions/candidate";
import * as voteTokenActions from "../../../../actions/voteToken";
import requireAuth from "../../../hoc/requireAuth";

const styles = theme => ({
  retryText: {
    textAlign: "center"
  },
  retryButton: {
    display: "block",
    margin: "auto",
    textAlign: "center"
  }
});

function pad2(value) {
  return value <= 9 ? "0" + value : value;
}

const LOADING = "LOADING",
  ERROR = "ERROR",
  DONE = "DONE";

class Chart extends React.Component {
  state = {
    loadingStatus: LOADING
  };

  fetchData = async () => {
    const { getCandidates, getVoteTokens } = this.props;
    try {
      this.setState({ loadingStatus: LOADING });
      await Promise.all([getCandidates(), getVoteTokens()]);
      this.setState({ loadingStatus: DONE });
    } catch (error) {
      console.log({ error });
      this.setState({ loadingStatus: ERROR });
    }
  };

  async componentDidMount() {
    await this.fetchData();
  }

  render() {
    const { candidates, voteTokens, classes } = this.props;
    const { loadingStatus } = this.state;

    let mainContent = null;
    if (loadingStatus === ERROR) {
      mainContent = (
        <div style={{ textAlign: "center" }}>
          <Typography variant="subheading" className={classes.retryText}>
            Cannot fetch data.
          </Typography>
          <Button
            color="primary"
            className={classes.retryButton}
            onClick={this.fetchData}
          >
            Retry
          </Button>
        </div>
      );
    } else if (loadingStatus === LOADING) {
      mainContent = (
        <div style={{ textAlign: "center" }}>
          <CircularProgress size={50} />
        </div>
      );
    } else {
      // filter voteTokens that is not used 
      // tokens is not used dont had usedAt variable
      const filterVoteTokens = _.filter(voteTokens, e => {return e.usedAt})


      const voteTokenDict = _.groupBy(
        filterVoteTokens,
        voteToken => voteToken.candidateId
      );

      const chartData = _.chain(candidates)
        .map(candidate => {
          const voteTokens = voteTokenDict[candidate._id];
          return {
            name: `${pad2(candidate.orderNumber)} - ${candidate.fullname} (${
              (voteTokens || []).length
            } vote(s))`,
            value: (voteTokens || []).length,
            orderNumber: candidate.orderNumber
          };
        })
        .sortBy([bar => -bar.value, bar => bar.orderNumber])
        .value();

      mainContent = (
        <Fragment>
          <Typography variant="subtitle1" style={{ marginBottom: "1em" }}>
            Last updated at{" "}
            <span style={{ color: "blue" }}>
              {moment().format("D MMMM YYYY, HH:mm:ss")}
            </span>
          </Typography>
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              // width={500}
              // height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 5
              }}
            >
              <XAxis
                dataKey="name"
                tickFormatter={name => name.split(" - ")[0]}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Fragment>
      );
    }

    return (
      <Grid container justify="center">
        <Grid item xs={11}>
          <Paper elevation={3} style={{ padding: "2em" }}>
            <Typography variant="h4">Vote Standings</Typography>
            {mainContent}
          </Paper>
        </Grid>
      </Grid>
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
  ),
  requireAuth
)(Chart);
