import React  from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { incrementCounter } from '../actions';
import Counter from '../components/Counter.react';
import Header from '../components/Header.react';


const Root = function Root(props) {
  return (
    <div className="container">
      <Header currentUser={props.currentUser} />
      <Counter counter={props.counter} handleCounterChange={props.handleCounterChange} />
    </div>
  );
}

Root.propTypes = {
  currentUser: PropTypes.object,
  counter: PropTypes.number,
  handleCounterChange: PropTypes.func.isRequired
};


const mapStateToProps = (state) => ({
  counter: state.counter,
  currentUser: state.currentUser
});

const mapDispatchToProps = (dispatch) => ({
  handleCounterChange: (incrementBy) => {
    dispatch(incrementCounter(incrementBy));
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Root);
