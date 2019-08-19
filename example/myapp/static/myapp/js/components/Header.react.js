import React from 'react';
import PropTypes from 'prop-types';

const Header = function Header(props) {
  const username = props.currentUser ? props.currentUser.username : 'Anonymous';
  return (<div>Hello, {username}!</div>);
}


Header.propTypes = {
    currentUser: PropTypes.object
};

export default Header;
