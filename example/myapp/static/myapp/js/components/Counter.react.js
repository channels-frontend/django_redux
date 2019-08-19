import React  from 'react';
import PropTypes from 'prop-types';

const Counter = ({ counter, handleCounterChange }) => {
  let input;

  const handleUserChange = (e) => {
    e.preventDefault();
    if (!input.value.trim()) {
      return;
    }

    handleCounterChange(parseInt(input.value, 10));

    // clear out the text box
    input.value = '';
  };

  const setInput = (node) => {
    input = node;
  };


  return (
    <div className="row">
      <div className="col-md-4 col-md-push-4">
        <form className="login-form" onSubmit={handleUserChange}>
          <div className="input-group">
            <input type="number" autoFocus="autofocus" className="form-control" placeholder="counter" ref={setInput} />
            <span className="input-group-btn">
              <button type="submit" className="btn btn-primary">increment</button>
            </span>
            <p>{counter}</p>
          </div>
        </form>
      </div>
    </div>
  );
};


Counter.propTypes = {
  handleCounterChange: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired
};

export default Counter;
