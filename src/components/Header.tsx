import React from 'react';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles } from '@material-ui/core/styles';
// import Weather from '../Features/Weather/Weather';
import Avatar from './Avatar';

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
});

export default () => {
  const classes = useStyles();

  // const name = "jagankoppisetti's";
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" color="inherit" className={classes.grow}>
          {/* {name} EOG React Visualization Assessment */}
          EOG Resources Inc
        </Typography>
        {/* <Weather /> */}
        Jagan Mohan Koppisetti &nbsp;<Avatar alt="Jagan" />
      </Toolbar>
    </AppBar>
  );
};
