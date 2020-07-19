import React, { Text, useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';

import productJSON from '/Users/vivekkandathil/Desktop/NewList1/desktop/list-maker-desktop/data.json';

import Card from '@material-ui/core/Card';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import MaterialTable from 'material-table';
import AddBox from '@material-ui/icons/AddBox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import { FormHelperText } from '@material-ui/core';

const TAX_RATE = 0.13;

const useStyles = makeStyles({
  root: {
    display: 'flex',
    maxWidth: 1600,
    margin: 20,
    flexDirection: 'row',
  },
  card: {
    maxWidth: 345,
    margin: 20,
  },
  media: {
    height: 100,
  },
  gridList: {
    width: 400,
    height: 450,
  },
  table: {
    minWidth: 1200,
  },
});

// Sample data from Loblaws Kanata (id=UPC code)
const productData = productJSON.data;
// Items the user added to the grocery list
let selectedItems = [];
// Colour references
const colors = {
  red: '#e52d27',
  redLeft: '#b31217',
  blue: '#0070FF',
  gray: '#777777',
  white: '#ffffff',
  black: '#000000',
  green: '#00ff7f',
  purple: '#9b5de5',
  dark: '#1a1a1a',
};

const keyExtractor = (item, index) => index.toString();
// Keys to display when the list is exported
const productKeys = ['Category', 'Name', 'Price', 'QTY'];
// Card swiper/transition
const swiperRef = React.createRef();
const tableRef = React.createRef();
const transitionRef = React.createRef();
// Array of product information
let tableRows = [];

export default function Home(): JSX.Element {
  // ---- STATE -----
  const [tableState, setTableState] = React.useState({
    columns: [
      { title: 'Category', field: 'category' },
      { title: 'Name', field: 'name' },
      { title: 'Price', field: 'price', type: 'numeric' },
    ],
    data: productData,
  });

  const classes = useStyles();

  const StyledButton = withStyles({
    root: {
      background: 'linear-gradient(45deg, #ff0000 10%, #990000 90%)',
      borderRadius: 3,
      border: 0,
      color: 'white',
      height: 48,
      padding: '0 30px',
      boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    },
    label: {
      textTransform: 'capitalize',
    },
  })(Button);

  return (
    <div className={styles.container} data-tid="container">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
      />
      <Link to={routes.COUNTER}>to Counter</Link>

      <div className={classes.root}>
        <GridList cellHeight={260} className={classes.gridList} cols={1}>
          {productData.map((tile) => (
            <GridListTile key={tile.image} cols={1}>
              <Card className={classes.card}>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={tile.image}
                    title="Contemplative Reptile"
                  />
                  <CardContent>
                    <Typography gutterBottom variant="subtitle1" component="h5">
                      {tile.name}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <StyledButton>Cancel</StyledButton>
                  <StyledButton
                    onClick={() => {
                      alert('clicked');
                    }}
                  >
                    Add to list
                  </StyledButton>
                </CardActions>
              </Card>
            </GridListTile>
          ))}
        </GridList>
        <MaterialTable
          title="Editable Example"
          columns={tableState.columns}
          data={tableState.data}
          style={{ maxWidth: '100%' }}
          editable={{
            onRowAdd: (newData) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  setState((prevState) => {
                    const data = [...prevState.data];
                    data.push(newData);
                    return { ...prevState, data };
                  });
                }, 600);
              }),
            onRowUpdate: (newData, oldData) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  if (oldData) {
                    setState((prevState) => {
                      const data = [...prevState.data];
                      data[data.indexOf(oldData)] = newData;
                      return { ...prevState, data };
                    });
                  }
                }, 600);
              }),
            onRowDelete: (oldData) =>
              new Promise((resolve) => {
                setTimeout(() => {
                  resolve();
                  setState((prevState) => {
                    const data = [...prevState.data];
                    data.splice(data.indexOf(oldData), 1);
                    return { ...prevState, data };
                  });
                }, 600);
              }),
          }}
        />
      </div>
    </div>
  );
}
