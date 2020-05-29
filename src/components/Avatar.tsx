import Avatar from '@material-ui/core/Avatar';
import { withStyles, Theme } from '@material-ui/core/styles';

const styles = (theme: Theme) => ({
  root: {
    display: 'flex',
      '& > *': {
        margin: theme.spacing(1),
      },
  },
});
export default withStyles(styles)(Avatar);
